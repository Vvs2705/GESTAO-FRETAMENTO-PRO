import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUES } from '../outbox/outbox.processor';

interface FuelJobData {
  eventId: string;
  tenantId: string;
  /** fuelRecordId */
  aggregateId: string;
  payload: {
    vehicleId: string;
    driverId?: string;
    liters: number;
    odometer: number;
    suppliedAt: string;
  };
}

/**
 * If the current km/l falls below 80 % of the vehicle's historical average,
 * the record is flagged and a FuelAnomalyDetected event is published.
 */
const ANOMALY_THRESHOLD_RATIO = 0.8;

/**
 * Number of historical records to use when computing the average.
 * Must have at least 2 to compute at least 1 km/l pair.
 */
const HISTORY_RECORDS = 10;

@Processor(QUEUES.FUEL)
export class FuelAnomalyProcessor {
  private readonly logger = new Logger(FuelAnomalyProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consumes FuelRecordCreated events.
   * Calculates km/l for the new record, compares it with the historical
   * average of the last N non-anomalous records for the same vehicle,
   * and flags + publishes FuelAnomalyDetected when below threshold.
   *
   * Note: The api-core already performs the same calculation inline on
   * record creation. This processor acts as a secondary, asynchronous
   * check — useful for records imported in bulk or when the inline check
   * was skipped due to missing previousOdometer at creation time.
   */
  @Process('FuelRecordCreated')
  async detectAnomaly(job: Job<FuelJobData>): Promise<void> {
    const { tenantId, aggregateId, payload } = job.data;

    // ── Fetch the persisted record to ensure we have accurate data ──
    const record = await this.prisma.fuelRecord.findFirst({
      where: { id: aggregateId, tenantId },
      select: {
        id: true,
        vehicleId: true,
        liters: true,
        odometer: true,
        suppliedAt: true,
        anomalyFlag: true,
        deletedAt: true,
      },
    });

    if (!record || record.deletedAt || record.anomalyFlag) {
      // Already flagged or does not exist — nothing to do
      return;
    }

    // ── Find the immediately preceding record to calculate km driven ──
    const previousRecord = await this.prisma.fuelRecord.findFirst({
      where: {
        tenantId,
        vehicleId: record.vehicleId,
        deletedAt: null,
        suppliedAt: { lt: record.suppliedAt },
        id: { not: aggregateId },
      },
      orderBy: { suppliedAt: 'desc' },
      select: { odometer: true },
    });

    if (!previousRecord) {
      // First record for this vehicle — cannot compute km/l
      return;
    }

    const kmDriven = Number(record.odometer) - Number(previousRecord.odometer);
    if (kmDriven <= 0 || Number(record.liters) <= 0) {
      this.logger.warn(
        `Cannot compute km/l — invalid kmDriven=${kmDriven} or liters=${Number(record.liters)} — fuelRecordId=${aggregateId}`,
      );
      return;
    }

    const currentKmPerLiter = kmDriven / Number(record.liters);

    // ── Fetch historical records to compute the average ──
    const historicalRecords = await this.prisma.fuelRecord.findMany({
      where: {
        tenantId,
        vehicleId: payload.vehicleId,
        anomalyFlag: false,
        deletedAt: null,
        id: { not: aggregateId },
      },
      orderBy: { suppliedAt: 'desc' },
      take: HISTORY_RECORDS,
      select: { liters: true, odometer: true, suppliedAt: true },
    });

    if (historicalRecords.length < 2) {
      // Not enough history to compute a meaningful average
      return;
    }

    // Compute average km/l from consecutive pairs (oldest → newest order)
    const sorted = [...historicalRecords].reverse(); // oldest first
    let totalKmPerLiter = 0;
    let pairs = 0;

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = sorted[i - 1];
      if (!curr || !prev) continue;

      const km = Number(curr.odometer) - Number(prev.odometer);
      if (km > 0 && Number(prev.liters) > 0) {
        totalKmPerLiter += km / Number(prev.liters);
        pairs++;
      }
    }

    if (pairs === 0) return;

    const historicalAvg = totalKmPerLiter / pairs;
    const threshold = historicalAvg * ANOMALY_THRESHOLD_RATIO;

    if (currentKmPerLiter >= threshold) {
      // Consumption is within acceptable range — no anomaly
      return;
    }

    const deviationPercent =
      ((historicalAvg - currentKmPerLiter) / historicalAvg) * 100;

    const anomalyReason =
      `Consumo ${deviationPercent.toFixed(1)}% abaixo da média histórica. ` +
      `Atual: ${currentKmPerLiter.toFixed(2)} km/l, ` +
      `Média histórica: ${historicalAvg.toFixed(2)} km/l`;

    // ── Fetch vehicle plate for the outbox payload ──
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: payload.vehicleId, tenantId },
      select: { plate: true },
    });

    await this.prisma.$transaction(async (tx) => {
      // Flag the record
      await tx.fuelRecord.update({
        where: { id: aggregateId },
        data: {
          anomalyFlag: true,
          anomalyReason,
        },
      });

      // Publish FuelAnomalyDetected to the outbox so notification processors react
      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId,
          eventType: 'FuelAnomalyDetected',
          payload: {
            fuelRecordId: aggregateId,
            vehicleId: payload.vehicleId,
            vehiclePlate: vehicle?.plate ?? '',
            actualKmPerLiter: currentKmPerLiter,
            historicalAvgKmPerLiter: historicalAvg,
            deviationPercent,
          } as never,
        },
      });
    });

    this.logger.warn(
      `Fuel anomaly detected — fuelRecordId=${aggregateId} deviation=${deviationPercent.toFixed(1)}% current=${currentKmPerLiter.toFixed(2)} avg=${historicalAvg.toFixed(2)}`,
    );
  }
}
