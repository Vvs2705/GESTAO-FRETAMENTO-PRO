import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type {
  FinanceSummaryFiltersDto,
  FinanceClientFiltersDto,
  FinanceVehicleFiltersDto,
} from './dto/finance-filters.dto';

export interface FinanceSummaryDto {
  period: { from: Date; to: Date };
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  margin: number;
}

export interface RevenueByClientItem {
  clientId: string;
  clientName: string;
  tripCount: number;
  totalTrips: number;
  completedTrips: number;
}

export interface CostByVehicleItem {
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
  totalKm: number | null;
}

const CACHE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(
    type: string,
    tenantId: string,
    from: Date,
    to: Date,
  ): string {
    return `finance:${type}:${tenantId}:${from.toISOString()}:${to.toISOString()}`;
  }

  private async getCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch (err) {
      this.logger.warn({ err, key }, 'Redis cache read failed');
    }
    return null;
  }

  private async setCache(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(value));
    } catch (err) {
      this.logger.warn({ err, key }, 'Redis cache write failed');
    }
  }

  async getSummary(
    tenantId: string,
    filters: FinanceSummaryFiltersDto,
  ): Promise<FinanceSummaryDto> {
    const cacheKey = this.cacheKey('summary', tenantId, filters.from, filters.to);
    const cached = await this.getCached<FinanceSummaryDto>(cacheKey);
    if (cached) return cached;

    // Total fuel cost in period
    const fuelAggregate = await this.prisma.fuelRecord.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        suppliedAt: { gte: filters.from, lte: filters.to },
      },
      _sum: { totalAmount: true },
    });

    const totalFuelCost = parseFloat(
      (fuelAggregate._sum.totalAmount ?? 0).toString(),
    );

    // Total maintenance cost in period (completed orders)
    const maintenanceAggregate = await this.prisma.maintenanceOrder.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: 'COMPLETED',
        actualEndAt: { gte: filters.from, lte: filters.to },
      },
      _sum: { totalCost: true },
    });

    const totalMaintenanceCost = parseFloat(
      (maintenanceAggregate._sum.totalCost ?? 0).toString(),
    );

    // Revenue estimation: sum of contract values for active contracts in period
    // (until Trip has a `value` field, we approximate via active contracts)
    const contractAggregate = await this.prisma.contract.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        startDate: { lte: filters.to },
        OR: [{ endDate: null }, { endDate: { gte: filters.from } }],
      },
      _sum: { value: true },
    });

    const totalRevenue = parseFloat(
      (contractAggregate._sum.value ?? 0).toString(),
    );

    const margin = totalRevenue - totalFuelCost - totalMaintenanceCost;

    const result: FinanceSummaryDto = {
      period: { from: filters.from, to: filters.to },
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      margin,
    };

    await this.setCache(cacheKey, result);
    return result;
  }

  async getRevenueByClient(
    tenantId: string,
    filters: FinanceClientFiltersDto,
  ): Promise<RevenueByClientItem[]> {
    const cacheKey = this.cacheKey('revenue-by-client', tenantId, filters.from, filters.to);
    const cached = await this.getCached<RevenueByClientItem[]>(cacheKey);
    if (cached) return cached;

    // Find clients with trips in this period
    const clients = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        name: true,
        trips: {
          where: {
            tenantId,
            deletedAt: null,
            scheduledStartAt: { gte: filters.from, lte: filters.to },
          },
          select: { id: true, status: true },
        },
      },
    });

    const result: RevenueByClientItem[] = clients
      .filter((c) => c.trips.length > 0)
      .map((c) => ({
        clientId: c.id,
        clientName: c.name,
        tripCount: c.trips.length,
        totalTrips: c.trips.length,
        completedTrips: c.trips.filter((t) => t.status === 'COMPLETED').length,
      }))
      .sort((a, b) => b.tripCount - a.tripCount);

    await this.setCache(cacheKey, result);
    return result;
  }

  async getCostByVehicle(
    tenantId: string,
    filters: FinanceVehicleFiltersDto,
  ): Promise<CostByVehicleItem[]> {
    const cacheKey = this.cacheKey('cost-by-vehicle', tenantId, filters.from, filters.to);
    const cached = await this.getCached<CostByVehicleItem[]>(cacheKey);
    if (cached) return cached;

    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        plate: true,
        type: true,
        fuelRecords: {
          where: {
            tenantId,
            deletedAt: null,
            suppliedAt: { gte: filters.from, lte: filters.to },
          },
          select: { totalAmount: true, odometer: true, suppliedAt: true },
        },
        maintenanceOrders: {
          where: {
            tenantId,
            deletedAt: null,
            status: 'COMPLETED',
            actualEndAt: { gte: filters.from, lte: filters.to },
          },
          select: { totalCost: true },
        },
      },
    });

    const result: CostByVehicleItem[] = vehicles
      .map((v) => {
        const fuelCost = v.fuelRecords.reduce(
          (sum, r) => sum + parseFloat(r.totalAmount.toString()),
          0,
        );
        const maintenanceCost = v.maintenanceOrders.reduce(
          (sum, o) => sum + parseFloat((o.totalCost ?? 0).toString()),
          0,
        );

        // Calculate km delta from odometer readings
        let totalKm: number | null = null;
        if (v.fuelRecords.length >= 2) {
          const sorted = [...v.fuelRecords].sort(
            (a, b) => a.suppliedAt.getTime() - b.suppliedAt.getTime(),
          );
          const firstOdo = parseFloat(sorted[0]!.odometer.toString());
          const lastOdo = parseFloat(sorted[sorted.length - 1]!.odometer.toString());
          if (lastOdo > firstOdo) {
            totalKm = lastOdo - firstOdo;
          }
        }

        return {
          vehicleId: v.id,
          vehiclePlate: v.plate,
          vehicleType: v.type,
          fuelCost,
          maintenanceCost,
          totalCost: fuelCost + maintenanceCost,
          totalKm,
        };
      })
      .filter((v) => v.fuelCost > 0 || v.maintenanceCost > 0)
      .sort((a, b) => b.totalCost - a.totalCost);

    await this.setCache(cacheKey, result);
    return result;
  }

  async invalidateCache(tenantId: string): Promise<void> {
    try {
      const pattern = `finance:*:${tenantId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      this.logger.warn({ err, tenantId }, 'Failed to invalidate finance cache');
    }
  }
}
