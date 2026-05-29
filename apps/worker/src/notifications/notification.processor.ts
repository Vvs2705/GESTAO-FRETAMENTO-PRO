import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUES } from '../outbox/outbox.processor';

/**
 * Shape of every job payload published by OutboxProcessor.
 * The `payload` field mirrors the original domain event payload stored in outbox_events.
 */
interface OutboxJobData {
  eventId: string;
  tenantId: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

// ── Fuel notifications ────────────────────────────────────────────────────────

@Processor(QUEUES.FUEL)
export class FuelNotificationProcessor {
  private readonly logger = new Logger(FuelNotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consumes FuelAnomalyDetected events and creates in-app notifications for
   * every user with the `fuel.approve` permission in the tenant.
   * Uses idempotency check to prevent duplicate notifications on retry.
   */
  @Process('FuelAnomalyDetected')
  async handleFuelAnomaly(job: Job<OutboxJobData>): Promise<void> {
    const { tenantId, aggregateId, payload } = job.data;

    // ── Idempotency: skip if a notification already exists for this event ──
    const alreadyProcessed = await this.prisma.notification.findFirst({
      where: {
        tenantId,
        entityType: 'FuelRecord',
        entityId: aggregateId,
        type: 'FUEL_ANOMALY',
      },
    });
    if (alreadyProcessed) {
      this.logger.debug(
        `FuelAnomalyDetected already processed — fuelRecordId=${aggregateId}`,
      );
      return;
    }

    // ── Find all users with fuel.approve permission in this tenant ──
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        employee: {
          role: {
            rolePermissions: {
              some: { permission: { key: 'fuel.approve' } },
            },
          },
        },
      },
      select: { id: true },
    });

    if (users.length === 0) {
      this.logger.warn(
        `No users with fuel.approve found — tenantId=${tenantId} fuelRecordId=${aggregateId}`,
      );
      return;
    }

    const deviationPercent = payload['deviationPercent'] as number | undefined;
    const bodyText = deviationPercent !== undefined
      ? `O abastecimento registrado está ${deviationPercent.toFixed(1)}% abaixo da média histórica do veículo.`
      : 'Um abastecimento com consumo anômalo foi detectado.';

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        tenantId,
        userId: user.id,
        type: 'FUEL_ANOMALY',
        title: 'Anomalia de Combustível Detectada',
        body: bodyText,
        entityType: 'FuelRecord',
        entityId: aggregateId,
        data: payload as never,
      })),
    });

    this.logger.log(
      `Fuel anomaly notifications created — tenantId=${tenantId} fuelRecordId=${aggregateId} notifiedUsers=${users.length}`,
    );
  }
}

// ── Occurrence notifications ──────────────────────────────────────────────────

@Processor(QUEUES.OCCURRENCES)
export class OccurrenceNotificationProcessor {
  private readonly logger = new Logger(OccurrenceNotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Notifies managers (hierarchyLevel >= 3) when an occurrence is escalated to CRITICAL.
   */
  @Process('OccurrenceEscalated')
  async handleOccurrenceEscalated(job: Job<OutboxJobData>): Promise<void> {
    const { tenantId, aggregateId } = job.data;

    // ── Idempotency ──
    const alreadyProcessed = await this.prisma.notification.findFirst({
      where: {
        tenantId,
        entityType: 'Occurrence',
        entityId: aggregateId,
        type: 'OCCURRENCE_CRITICAL',
      },
    });
    if (alreadyProcessed) return;

    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        employee: { role: { hierarchyLevel: { gte: 3 } } },
      },
      select: { id: true },
    });

    if (users.length === 0) {
      this.logger.warn(
        `No managers (hierarchyLevel >= 3) to notify — tenantId=${tenantId} occurrenceId=${aggregateId}`,
      );
      return;
    }

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        tenantId,
        userId: user.id,
        type: 'OCCURRENCE_CRITICAL',
        title: 'Ocorrência Crítica Registrada',
        body: 'Uma ocorrência foi escalada para nível CRÍTICO e requer atenção imediata.',
        entityType: 'Occurrence',
        entityId: aggregateId,
      })),
    });

    this.logger.log(
      `Occurrence critical notifications created — tenantId=${tenantId} occurrenceId=${aggregateId} notifiedUsers=${users.length}`,
    );
  }

  /**
   * Notifies supervisors (hierarchyLevel >= 2) for HIGH severity occurrences.
   * CRITICAL is handled by the escalation processor above.
   */
  @Process('OccurrenceCreated')
  async handleOccurrenceCreated(job: Job<OutboxJobData>): Promise<void> {
    const { tenantId, aggregateId, payload } = job.data;
    const severity = payload['severity'] as string | undefined;

    // Only notify for HIGH severity; CRITICAL occurrences get their own flow
    if (severity !== 'HIGH') return;

    // ── Idempotency ──
    const alreadyProcessed = await this.prisma.notification.findFirst({
      where: {
        tenantId,
        entityType: 'Occurrence',
        entityId: aggregateId,
        type: 'OCCURRENCE_HIGH',
      },
    });
    if (alreadyProcessed) return;

    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        employee: { role: { hierarchyLevel: { gte: 2 } } },
      },
      select: { id: true },
    });

    if (users.length === 0) return;

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        tenantId,
        userId: user.id,
        type: 'OCCURRENCE_HIGH',
        title: 'Ocorrência de Alta Gravidade',
        body: 'Uma ocorrência de alta gravidade foi registrada no sistema.',
        entityType: 'Occurrence',
        entityId: aggregateId,
      })),
    });

    this.logger.log(
      `High severity occurrence notifications created — tenantId=${tenantId} occurrenceId=${aggregateId} notifiedUsers=${users.length}`,
    );
  }

  /**
   * Notifies the responsible user (and supervisors) when an occurrence is resolved.
   */
  @Process('OccurrenceResolved')
  async handleOccurrenceResolved(job: Job<OutboxJobData>): Promise<void> {
    const { tenantId, aggregateId, payload } = job.data;
    const responsibleUserId = payload['responsibleUserId'] as string | undefined;

    if (!responsibleUserId) return;

    // ── Idempotency ──
    const alreadyProcessed = await this.prisma.notification.findFirst({
      where: {
        tenantId,
        entityType: 'Occurrence',
        entityId: aggregateId,
        type: 'OCCURRENCE_RESOLVED',
        userId: responsibleUserId,
      },
    });
    if (alreadyProcessed) return;

    await this.prisma.notification.create({
      data: {
        tenantId,
        userId: responsibleUserId,
        type: 'OCCURRENCE_RESOLVED',
        title: 'Ocorrência Resolvida',
        body: 'A ocorrência pela qual você era responsável foi marcada como resolvida.',
        entityType: 'Occurrence',
        entityId: aggregateId,
        data: payload as never,
      },
    });

    this.logger.log(
      `Occurrence resolved notification sent — tenantId=${tenantId} occurrenceId=${aggregateId} userId=${responsibleUserId}`,
    );
  }
}

// ── Trip notifications ────────────────────────────────────────────────────────

@Processor(QUEUES.TRIPS)
export class TripNotificationProcessor {
  private readonly logger = new Logger(TripNotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Notifies operations staff when a trip is marked as DELAYED.
   */
  @Process('TripDelayed')
  async handleTripDelayed(job: Job<OutboxJobData>): Promise<void> {
    const { tenantId, aggregateId, payload } = job.data;

    // ── Idempotency ──
    const alreadyProcessed = await this.prisma.notification.findFirst({
      where: {
        tenantId,
        entityType: 'Trip',
        entityId: aggregateId,
        type: 'TRIP_DELAYED',
      },
    });
    if (alreadyProcessed) return;

    // Notify users with trip.read permission (operations)
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        employee: {
          role: {
            rolePermissions: {
              some: { permission: { key: 'trip.read' } },
            },
          },
        },
      },
      select: { id: true },
    });

    if (users.length === 0) return;

    const reason = payload['reason'] as string | undefined;
    const bodyText = reason
      ? `Viagem atrasada. Motivo: ${reason}`
      : 'Uma viagem foi sinalizada como atrasada.';

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        tenantId,
        userId: user.id,
        type: 'TRIP_DELAYED',
        title: 'Viagem com Atraso',
        body: bodyText,
        entityType: 'Trip',
        entityId: aggregateId,
        data: payload as never,
      })),
    });

    this.logger.log(
      `Trip delayed notifications created — tenantId=${tenantId} tripId=${aggregateId} notifiedUsers=${users.length}`,
    );
  }
}
