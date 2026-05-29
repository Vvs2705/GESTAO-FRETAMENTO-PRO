import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateFuelRecordDto } from './dto/create-fuel.dto';
import type { UpdateFuelRecordDto } from './dto/update-fuel.dto';
import type { FuelFiltersDto, FuelStatsFiltersDto } from './dto/fuel-filters.dto';
import {
  toFuelRecordDto,
  type FuelRecordResponseDto,
  type FuelStatsDto,
} from './dto/fuel-response.dto';

// Anomaly threshold: km/l must be >= 80% of historical average
const ANOMALY_THRESHOLD_RATIO = 0.8;
// Number of historical records to compute average
const HISTORY_SAMPLE_SIZE = 10;

@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: FuelFiltersDto,
  ): Promise<CursorPage<FuelRecordResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const records = await this.prisma.fuelRecord.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters.driverId ? { driverId: filters.driverId } : {}),
        ...(filters.anomalyFlag !== undefined
          ? { anomalyFlag: filters.anomalyFlag }
          : {}),
        ...(filters.dateFrom || filters.dateTo
          ? {
              suppliedAt: {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {}),
              },
            }
          : {}),
      },
      orderBy: { suppliedAt: 'desc' },
      take,
    });

    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;

    return {
      data: data.map(toFuelRecordDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<FuelRecordResponseDto> {
    const record = await this.prisma.fuelRecord.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException({
        error: 'FUEL_RECORD_NOT_FOUND',
        message: 'Registro de abastecimento não encontrado',
      });
    }

    return toFuelRecordDto(record);
  }

  async findAnomalies(
    tenantId: string,
    filters: FuelFiltersDto,
  ): Promise<CursorPage<FuelRecordResponseDto>> {
    return this.findAll(tenantId, { ...filters, anomalyFlag: true });
  }

  async create(
    tenantId: string,
    dto: CreateFuelRecordDto,
    actorId: string,
  ): Promise<FuelRecordResponseDto> {
    // Validate vehicle exists in tenant
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException({
        error: 'VEHICLE_NOT_FOUND',
        message: 'Veículo não encontrado',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // CRITICAL VALIDATION: odometer must be >= last recorded odometer
      const lastRecord = await tx.fuelRecord.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          tenantId,
          deletedAt: null,
        },
        orderBy: { odometer: 'desc' },
        select: { odometer: true, id: true },
      });

      const lastOdometer = lastRecord ? Number(lastRecord.odometer) : 0;

      if (dto.odometer < lastOdometer) {
        throw new BadRequestException({
          error: 'ODOMETER_INVALID',
          message: 'O hodômetro não pode ser menor que o último registro do veículo',
          details: {
            lastOdometer,
            submittedOdometer: dto.odometer,
          },
        });
      }

      // Anomaly detection: calculate km/l and compare with historical average
      let anomalyFlag = false;
      let anomalyReason: string | null = null;
      let currentKmPerLiter: number | null = null;

      // Get the previous fuel record to calculate km traveled
      const previousRecord = await tx.fuelRecord.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          tenantId,
          deletedAt: null,
        },
        orderBy: { suppliedAt: 'desc' },
        select: { odometer: true, liters: true },
      });

      if (previousRecord) {
        const kmTraveled = dto.odometer - Number(previousRecord.odometer);

        if (kmTraveled > 0 && dto.liters > 0) {
          currentKmPerLiter = kmTraveled / dto.liters;

          // Get historical average from last N records
          const historicalRecords = await tx.fuelRecord.findMany({
            where: {
              vehicleId: dto.vehicleId,
              tenantId,
              anomalyFlag: false, // Only use non-anomaly records for baseline
              deletedAt: null,
            },
            orderBy: { suppliedAt: 'desc' },
            take: HISTORY_SAMPLE_SIZE,
            select: { odometer: true, liters: true },
          });

          if (historicalRecords.length >= 2) {
            // Calculate km/l for each consecutive pair
            const kmPerLiterHistory: number[] = [];

            for (let i = 0; i < historicalRecords.length - 1; i++) {
              const current = historicalRecords[i];
              const previous = historicalRecords[i + 1];

              if (current && previous) {
                const km = Number(current.odometer) - Number(previous.odometer);
                const liters = Number(current.liters);

                if (km > 0 && liters > 0) {
                  kmPerLiterHistory.push(km / liters);
                }
              }
            }

            if (kmPerLiterHistory.length > 0) {
              const historicalAverage =
                kmPerLiterHistory.reduce((a, b) => a + b, 0) /
                kmPerLiterHistory.length;

              const threshold = historicalAverage * ANOMALY_THRESHOLD_RATIO;

              if (currentKmPerLiter < threshold) {
                anomalyFlag = true;
                anomalyReason =
                  `km/l atual (${currentKmPerLiter.toFixed(2)}) está abaixo de 80% da média histórica ` +
                  `(${historicalAverage.toFixed(2)} km/l, limiar: ${threshold.toFixed(2)} km/l)`;
              }
            }
          }
        }
      }

      // Create fuel record
      const fuelRecord = await tx.fuelRecord.create({
        data: {
          tenantId,
          vehicleId: dto.vehicleId,
          driverId: dto.driverId ?? null,
          branchId: dto.branchId ?? null,
          fuelStationName: dto.fuelStationName ?? null,
          fuelType: dto.fuelType,
          liters: dto.liters,
          unitPrice: dto.unitPrice,
          totalAmount: dto.totalAmount,
          odometer: dto.odometer,
          suppliedAt: dto.suppliedAt,
          anomalyFlag,
          anomalyReason,
          notes: dto.notes ?? null,
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      // Update vehicle current odometer
      await tx.vehicle.update({
        where: { id: dto.vehicleId },
        data: { currentOdometer: dto.odometer, updatedBy: actorId },
      });

      // Always emit FuelRecordCreated
      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: fuelRecord.id,
          eventType: 'FuelRecordCreated',
          payload: {
            fuelRecordId: fuelRecord.id,
            tenantId,
            vehicleId: dto.vehicleId,
            driverId: dto.driverId ?? null,
            liters: dto.liters,
            odometer: dto.odometer,
            anomalyFlag,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      // Emit FuelAnomalyDetected if anomaly detected
      if (anomalyFlag && currentKmPerLiter !== null) {
        const historicalRecordsForEvent = await tx.fuelRecord.findMany({
          where: {
            vehicleId: dto.vehicleId,
            tenantId,
            anomalyFlag: false,
            deletedAt: null,
            id: { not: fuelRecord.id },
          },
          orderBy: { suppliedAt: 'desc' },
          take: HISTORY_SAMPLE_SIZE,
          select: { odometer: true, liters: true },
        });

        // Recalculate for event payload
        let historicalAvg = 0;
        const pairs: number[] = [];
        for (let i = 0; i < historicalRecordsForEvent.length - 1; i++) {
          const cur = historicalRecordsForEvent[i];
          const prev = historicalRecordsForEvent[i + 1];
          if (cur && prev) {
            const km = Number(cur.odometer) - Number(prev.odometer);
            const lit = Number(cur.liters);
            if (km > 0 && lit > 0) pairs.push(km / lit);
          }
        }
        if (pairs.length > 0) {
          historicalAvg = pairs.reduce((a, b) => a + b, 0) / pairs.length;
        }

        await tx.outboxEvent.create({
          data: {
            tenantId,
            aggregateId: fuelRecord.id,
            eventType: 'FuelAnomalyDetected',
            payload: {
              fuelRecordId: fuelRecord.id,
              tenantId,
              vehicleId: dto.vehicleId,
              driverId: dto.driverId ?? null,
              kmPerLiter: currentKmPerLiter,
              historicalAverage: historicalAvg,
              anomalyReason: anomalyReason ?? '',
              actorUserId: actorId,
              occurredAt: new Date(),
            },
          },
        });
      }

      return toFuelRecordDto(fuelRecord);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateFuelRecordDto,
    actorId: string,
  ): Promise<FuelRecordResponseDto> {
    await this.findById(id, tenantId);

    const record = await this.prisma.fuelRecord.update({
      where: { id },
      data: {
        ...(dto.fuelStationName !== undefined
          ? { fuelStationName: dto.fuelStationName }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
    });

    return toFuelRecordDto(record);
  }

  async getStats(
    tenantId: string,
    filters: FuelStatsFiltersDto,
  ): Promise<FuelStatsDto> {
    const where = {
      tenantId,
      deletedAt: null,
      ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      ...(filters.driverId ? { driverId: filters.driverId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            suppliedAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const [aggregation, count] = await Promise.all([
      this.prisma.fuelRecord.aggregate({
        where,
        _sum: { liters: true, totalAmount: true },
      }),
      this.prisma.fuelRecord.count({ where }),
    ]);

    const totalLiters = aggregation._sum.liters
      ? Number(aggregation._sum.liters)
      : 0;
    const totalCost = aggregation._sum.totalAmount
      ? Number(aggregation._sum.totalAmount)
      : 0;

    // Get max and min odometer for km calculation
    const odometerResult = await this.prisma.fuelRecord.aggregate({
      where,
      _max: { odometer: true },
      _min: { odometer: true },
    });

    const maxOdometer = odometerResult._max.odometer
      ? Number(odometerResult._max.odometer)
      : 0;
    const minOdometer = odometerResult._min.odometer
      ? Number(odometerResult._min.odometer)
      : 0;

    const totalKm = maxOdometer - minOdometer;

    const averageKmPerLiter =
      totalLiters > 0 && totalKm > 0 ? totalKm / totalLiters : null;
    const costPerKm =
      totalCost > 0 && totalKm > 0 ? totalCost / totalKm : null;

    return {
      totalLiters,
      totalCost,
      averageKmPerLiter,
      costPerKm,
      totalRecords: count,
    };
  }
}
