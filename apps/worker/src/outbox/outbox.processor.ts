import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

// ── Queue names — one per event category ──────────────────────────────────────
export const QUEUES = {
  TRIPS: 'trips',
  OCCURRENCES: 'occurrences',
  VEHICLES: 'vehicles',
  FUEL: 'fuel',
  NOTIFICATIONS: 'notifications',
  MAINTENANCE: 'maintenance',
  DOCUMENTS: 'documents',
  REPORTS: 'reports',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

// ── Mapping: event type → queue name ──────────────────────────────────────────
const EVENT_QUEUE_MAP: Record<string, QueueName> = {
  // Trip events
  TripCreated: QUEUES.TRIPS,
  TripConfirmed: QUEUES.TRIPS,
  TripStarted: QUEUES.TRIPS,
  TripCompleted: QUEUES.TRIPS,
  TripCanceled: QUEUES.TRIPS,
  TripDelayed: QUEUES.TRIPS,
  // Occurrence events
  OccurrenceCreated: QUEUES.OCCURRENCES,
  OccurrenceEscalated: QUEUES.OCCURRENCES,
  OccurrenceResolved: QUEUES.OCCURRENCES,
  OccurrenceStatusChanged: QUEUES.OCCURRENCES,
  // Vehicle events
  VehicleCreated: QUEUES.VEHICLES,
  VehicleStatusChanged: QUEUES.VEHICLES,
  VehicleDocumentExpiring: QUEUES.VEHICLES,
  // Fuel events
  FuelRecordCreated: QUEUES.FUEL,
  FuelAnomalyDetected: QUEUES.FUEL,
  // Maintenance events
  MaintenanceOrderCreated: QUEUES.MAINTENANCE,
  MaintenanceOrderCompleted: QUEUES.MAINTENANCE,
  // Document events
  DocumentExpiringSoon: QUEUES.DOCUMENTS,
};

// ── Raw row returned by the FOR UPDATE SKIP LOCKED query ─────────────────────
interface OutboxRow {
  id: string;
  tenant_id: string;
  aggregate_id: string;
  event_type: string;
  payload: unknown;
  retries: number;
}

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES.TRIPS) private readonly tripsQueue: Queue,
    @InjectQueue(QUEUES.OCCURRENCES) private readonly occurrencesQueue: Queue,
    @InjectQueue(QUEUES.VEHICLES) private readonly vehiclesQueue: Queue,
    @InjectQueue(QUEUES.FUEL) private readonly fuelQueue: Queue,
    @InjectQueue(QUEUES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUES.MAINTENANCE) private readonly maintenanceQueue: Queue,
    @InjectQueue(QUEUES.DOCUMENTS) private readonly documentsQueue: Queue,
  ) {}

  /**
   * Runs every 5 seconds. Uses FOR UPDATE SKIP LOCKED so multiple worker
   * instances never process the same event concurrently.
   */
  @Cron('*/5 * * * * *')
  async processOutbox(): Promise<void> {
    if (this.isProcessing) return; // Prevent concurrent runs within the same instance
    this.isProcessing = true;

    try {
      await this.prisma.$transaction(async (tx) => {
        const events = await tx.$queryRaw<OutboxRow[]>`
          SELECT id, tenant_id, aggregate_id, event_type, payload, retries
          FROM outbox_events
          WHERE status = 'PENDING'
            AND (next_retry_at IS NULL OR next_retry_at <= NOW())
          ORDER BY created_at ASC
          LIMIT 100
          FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) return;

        for (const event of events) {
          try {
            const queue = this.resolveQueue(event.event_type);

            await queue.add(
              event.event_type,
              {
                eventId: event.id,
                tenantId: event.tenant_id,
                aggregateId: event.aggregate_id,
                eventType: event.event_type,
                payload: event.payload,
              },
              {
                // Deduplication: same event will not be enqueued twice
                jobId: `outbox:${event.id}`,
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
              },
            );

            await tx.$executeRaw`
              UPDATE outbox_events
              SET status = 'PUBLISHED', published_at = NOW()
              WHERE id = ${event.id}::uuid
            `;

            this.logger.debug(
              `Outbox event published — id=${event.id} type=${event.event_type}`,
            );
          } catch (err) {
            const nextRetry = this.calculateNextRetry(event.retries);
            const newStatus = event.retries >= 2 ? 'DEAD' : 'PENDING';

            await tx.$executeRaw`
              UPDATE outbox_events
              SET status = ${newStatus},
                  retries = retries + 1,
                  last_error = ${String(err)},
                  next_retry_at = ${nextRetry}
              WHERE id = ${event.id}::uuid
            `;

            if (newStatus === 'DEAD') {
              this.logger.error(
                {
                  eventId: event.id,
                  eventType: event.event_type,
                  retries: event.retries + 1,
                  err,
                },
                'Outbox event moved to DEAD after max retries — manual intervention required',
              );
            } else {
              this.logger.warn(
                {
                  eventId: event.id,
                  eventType: event.event_type,
                  retries: event.retries + 1,
                  nextRetry,
                  err,
                },
                'Outbox event failed — scheduled for retry',
              );
            }
          }
        }

        this.logger.log(`Outbox batch processed — count=${events.length}`);
      });
    } catch (err) {
      this.logger.error({ err }, 'Fatal error in outbox batch — transaction rolled back');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Resolve which BullMQ queue should receive an event type.
   * Falls back to the notifications queue for unknown types to avoid silent drops.
   */
  private resolveQueue(eventType: string): Queue {
    const queueName = EVENT_QUEUE_MAP[eventType] ?? QUEUES.NOTIFICATIONS;

    switch (queueName) {
      case QUEUES.TRIPS:
        return this.tripsQueue;
      case QUEUES.OCCURRENCES:
        return this.occurrencesQueue;
      case QUEUES.VEHICLES:
        return this.vehiclesQueue;
      case QUEUES.FUEL:
        return this.fuelQueue;
      case QUEUES.MAINTENANCE:
        return this.maintenanceQueue;
      case QUEUES.DOCUMENTS:
        return this.documentsQueue;
      default:
        return this.notificationsQueue;
    }
  }

  /**
   * Exponential back-off: attempt 0 → 1 s, attempt 1 → 5 s, attempt 2+ → 30 s.
   */
  private calculateNextRetry(retries: number): Date {
    const delaysMs = [1_000, 5_000, 30_000] as const;
    const delay = delaysMs[retries] ?? 30_000;
    return new Date(Date.now() + delay);
  }
}
