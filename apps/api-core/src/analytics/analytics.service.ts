import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { FuelDashboardFiltersDto } from './dto/analytics-filters.dto';

const CACHE_TTL_SECONDS = 60; // 60 seconds for all dashboard data

// -----------------------------------------------------------------------
// Dashboard payload types
// -----------------------------------------------------------------------

export interface ExecutiveDashboardDto {
  tripsToday: number;
  tripsCompleted: number;
  tripsDelayed: number;
  openOccurrences: number;
  criticalOccurrences: number;
  availableVehicles: number;
  totalVehicles: number;
  fleetUtilizationPercent: number;
  activeDrivers: number;
  fuelCostThisMonth: number;
  anomaliesThisMonth: number;
  documentsExpiringSoon: number;
  generatedAt: Date;
}

export interface TripsByStatusDto {
  total: number;
  draft: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  delayed: number;
  canceled: number;
}

export interface TripByHourItem {
  hour: number;
  count: number;
}

export interface RecentOccurrenceItem {
  id: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  createdAt: Date;
  vehicleId: string | null;
}

export interface DelayedTripItem {
  id: string;
  status: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date | null;
  vehicleId: string | null;
  vehiclePlate: string | null;
  driverId: string | null;
  driverName: string | null;
}

export interface OperationDashboardDto {
  date: Date;
  trips: TripsByStatusDto;
  openOccurrences: RecentOccurrenceItem[];
  delayedTrips: DelayedTripItem[];
  generatedAt: Date;
}

export interface VehicleStatusBreakdownItem {
  status: string;
  count: number;
}

export interface OpenMaintenanceItem {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: string;
  description: string;
  status: string;
  expectedEndAt: Date | null;
  createdAt: Date;
}

export interface ExpiringDocumentsBreakdown {
  within7Days: number;
  within30Days: number;
  within60Days: number;
}

export interface FleetDashboardDto {
  totalVehicles: number;
  vehiclesByStatus: VehicleStatusBreakdownItem[];
  maintenanceOrders: OpenMaintenanceItem[];
  documentsExpiring: ExpiringDocumentsBreakdown;
  avgKmPerVehicle: number | null;
  generatedAt: Date;
}

export interface FuelAnomalyItem {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  anomalyReason: string | null;
  totalAmount: number;
  liters: number;
  suppliedAt: Date;
}

export interface FuelCostByTypeItem {
  fuelType: string;
  totalLiters: number;
  totalCost: number;
  recordCount: number;
}

export interface FuelDashboardDto {
  period: { from: Date; to: Date };
  totalLiters: number;
  totalCost: number;
  avgPricePerLiter: number;
  avgKmPerLiter: number | null;
  anomalyCount: number;
  recentAnomalies: FuelAnomalyItem[];
  costByFuelType: FuelCostByTypeItem[];
  generatedAt: Date;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async getCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch (err) {
      this.logger.warn({ err, key }, 'Dashboard cache read failed');
    }
    return null;
  }

  private async setCache(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(value));
    } catch (err) {
      this.logger.warn({ err, key }, 'Dashboard cache write failed');
    }
  }

  // -----------------------------------------------------------------------
  // Executive Dashboard
  // -----------------------------------------------------------------------

  async getExecutiveDashboard(tenantId: string): Promise<ExecutiveDashboardDto> {
    const cacheKey = `dashboard:executive:${tenantId}`;
    const cached = await this.getCached<ExecutiveDashboardDto>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      tripsToday,
      tripsCompleted,
      tripsDelayed,
      openOccurrences,
      criticalOccurrences,
      availableVehicles,
      totalVehicles,
      activeDrivers,
      fuelCostResult,
      anomaliesThisMonth,
      documentsExpiringSoon,
    ] = await Promise.all([
      // Trips scheduled today (not CANCELED)
      this.prisma.trip.count({
        where: {
          tenantId,
          deletedAt: null,
          scheduledStartAt: { gte: dayStart, lte: dayEnd },
          status: { not: 'CANCELED' },
        },
      }),

      // Trips COMPLETED today
      this.prisma.trip.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'COMPLETED',
          actualEndAt: { gte: dayStart, lte: dayEnd },
        },
      }),

      // Delayed trips: DELAYED status or IN_PROGRESS past scheduled end
      this.prisma.trip.count({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { status: 'DELAYED' },
            {
              status: 'IN_PROGRESS',
              scheduledEndAt: { lt: now },
            },
          ],
        },
      }),

      // Open occurrences (OPEN or IN_ANALYSIS or CRITICAL)
      this.prisma.occurrence.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['OPEN', 'IN_ANALYSIS', 'CRITICAL'] },
        },
      }),

      // Critical occurrences
      this.prisma.occurrence.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'CRITICAL',
        },
      }),

      // Available vehicles
      this.prisma.vehicle.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'AVAILABLE',
        },
      }),

      // Total vehicles (not deleted)
      this.prisma.vehicle.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),

      // Active drivers (AVAILABLE or ON_TRIP)
      this.prisma.driver.count({
        where: {
          tenantId,
          deletedAt: null,
          availabilityStatus: { in: ['AVAILABLE', 'ON_TRIP'] },
        },
      }),

      // Fuel cost this month
      this.prisma.fuelRecord.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          suppliedAt: { gte: monthStart },
        },
        _sum: { totalAmount: true },
      }),

      // Fuel anomalies this month
      this.prisma.fuelRecord.count({
        where: {
          tenantId,
          deletedAt: null,
          anomalyFlag: true,
          suppliedAt: { gte: monthStart },
        },
      }),

      // Documents expiring in next 30 days
      this.prisma.document.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'ACTIVE',
          expiresAt: { gte: now, lte: thirtyDaysFromNow },
        },
      }),
    ]);

    const fuelCostThisMonth = parseFloat(
      (fuelCostResult._sum.totalAmount ?? 0).toString(),
    );

    const fleetUtilizationPercent =
      totalVehicles > 0
        ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100 * 100) / 100
        : 0;

    const result: ExecutiveDashboardDto = {
      tripsToday,
      tripsCompleted,
      tripsDelayed,
      openOccurrences,
      criticalOccurrences,
      availableVehicles,
      totalVehicles,
      fleetUtilizationPercent,
      activeDrivers,
      fuelCostThisMonth,
      anomaliesThisMonth,
      documentsExpiringSoon,
      generatedAt: now,
    };

    await this.setCache(cacheKey, result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Operation Dashboard
  // -----------------------------------------------------------------------

  async getOperationDashboard(tenantId: string): Promise<OperationDashboardDto> {
    const cacheKey = `dashboard:operation:${tenantId}`;
    const cached = await this.getCached<OperationDashboardDto>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const [tripStatuses, upcomingTrips, openOccurrencesRaw, delayedTripsRaw] =
      await Promise.all([
        // Trip status breakdown for today
        this.prisma.trip.groupBy({
          by: ['status'],
          where: {
            tenantId,
            deletedAt: null,
            scheduledStartAt: { gte: dayStart, lte: dayEnd },
          },
          _count: { _all: true },
        }),

        // Trips in next 12h for distribution by hour
        this.prisma.trip.findMany({
          where: {
            tenantId,
            deletedAt: null,
            scheduledStartAt: { gte: now, lte: twelveHoursFromNow },
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'DELAYED'] },
          },
          select: { id: true, scheduledStartAt: true },
          orderBy: { scheduledStartAt: 'asc' },
        }),

        // 5 most recent open occurrences
        this.prisma.occurrence.findMany({
          where: {
            tenantId,
            deletedAt: null,
            status: { in: ['OPEN', 'IN_ANALYSIS', 'CRITICAL'] },
          },
          select: {
            id: true,
            type: true,
            severity: true,
            status: true,
            description: true,
            createdAt: true,
            vehicleId: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),

        // Delayed trips with vehicle and driver info
        this.prisma.trip.findMany({
          where: {
            tenantId,
            deletedAt: null,
            OR: [
              { status: 'DELAYED' },
              {
                status: 'IN_PROGRESS',
                scheduledEndAt: { lt: now },
              },
            ],
          },
          select: {
            id: true,
            status: true,
            scheduledStartAt: true,
            scheduledEndAt: true,
            vehicleId: true,
            driverId: true,
            vehicle: { select: { plate: true } },
            driver: { select: { employee: { select: { name: true } } } },
          },
          orderBy: { scheduledStartAt: 'asc' },
          take: 20,
        }),
      ]);

    // Aggregate trip stats
    const statusMap = new Map(
      tripStatuses.map((s) => [s.status, s._count._all]),
    );
    const total = tripStatuses.reduce((sum, s) => sum + s._count._all, 0);

    const trips: TripsByStatusDto = {
      total,
      draft: statusMap.get('DRAFT') ?? 0,
      confirmed: statusMap.get('CONFIRMED') ?? 0,
      inProgress: statusMap.get('IN_PROGRESS') ?? 0,
      completed: statusMap.get('COMPLETED') ?? 0,
      delayed: statusMap.get('DELAYED') ?? 0,
      canceled: statusMap.get('CANCELED') ?? 0,
    };

    // Build trip-by-hour distribution
    const hourMap = new Map<number, number>();
    for (const trip of upcomingTrips) {
      const hour = trip.scheduledStartAt.getHours();
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
    }

    const openOccurrences: RecentOccurrenceItem[] = openOccurrencesRaw.map(
      (o) => ({
        id: o.id,
        type: o.type,
        severity: o.severity,
        status: o.status,
        description:
          o.description.length > 100
            ? `${o.description.substring(0, 100)  }...`
            : o.description,
        createdAt: o.createdAt,
        vehicleId: o.vehicleId,
      }),
    );

    const delayedTrips: DelayedTripItem[] = delayedTripsRaw.map((t) => ({
      id: t.id,
      status: t.status,
      scheduledStartAt: t.scheduledStartAt,
      scheduledEndAt: t.scheduledEndAt,
      vehicleId: t.vehicleId,
      vehiclePlate: t.vehicle?.plate ?? null,
      driverId: t.driverId,
      driverName: t.driver?.employee?.name ?? null,
    }));

    const result: OperationDashboardDto = {
      date: now,
      trips,
      openOccurrences,
      delayedTrips,
      generatedAt: now,
    };

    await this.setCache(cacheKey, result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Fleet Dashboard
  // -----------------------------------------------------------------------

  async getFleetDashboard(tenantId: string): Promise<FleetDashboardDto> {
    const cacheKey = `dashboard:fleet:${tenantId}`;
    const cached = await this.getCached<FleetDashboardDto>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const days7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const days30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const days60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const [
      totalVehicles,
      vehicleStatusGroups,
      openMaintenanceOrders,
      docsWithin7,
      docsWithin30,
      docsWithin60,
      vehiclesWithOdometer,
    ] = await Promise.all([
      // Total vehicles
      this.prisma.vehicle.count({
        where: { tenantId, deletedAt: null },
      }),

      // Vehicle count grouped by status
      this.prisma.vehicle.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null },
        _count: { _all: true },
      }),

      // Open / in-progress maintenance orders
      this.prisma.maintenanceOrder.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
        select: {
          id: true,
          vehicleId: true,
          type: true,
          description: true,
          status: true,
          expectedEndAt: true,
          createdAt: true,
          vehicle: { select: { plate: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // Documents expiring within 7 days
      this.prisma.document.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'ACTIVE',
          expiresAt: { gte: now, lte: days7 },
        },
      }),

      // Documents expiring within 30 days
      this.prisma.document.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'ACTIVE',
          expiresAt: { gte: now, lte: days30 },
        },
      }),

      // Documents expiring within 60 days
      this.prisma.document.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'ACTIVE',
          expiresAt: { gte: now, lte: days60 },
        },
      }),

      // Average km per vehicle this month (max odometer readings)
      this.prisma.fuelRecord.groupBy({
        by: ['vehicleId'],
        where: {
          tenantId,
          deletedAt: null,
          suppliedAt: { gte: monthStart },
        },
        _max: { odometer: true },
        _min: { odometer: true },
      }),
    ]);

    const vehiclesByStatus: VehicleStatusBreakdownItem[] = vehicleStatusGroups.map(
      (g) => ({ status: g.status, count: g._count._all }),
    );

    const maintenanceOrders: OpenMaintenanceItem[] = openMaintenanceOrders.map(
      (o) => ({
        id: o.id,
        vehicleId: o.vehicleId,
        vehiclePlate: o.vehicle.plate,
        type: o.type,
        description:
          o.description.length > 100
            ? `${o.description.substring(0, 100)  }...`
            : o.description,
        status: o.status,
        expectedEndAt: o.expectedEndAt,
        createdAt: o.createdAt,
      }),
    );

    const documentsExpiring: ExpiringDocumentsBreakdown = {
      within7Days: docsWithin7,
      within30Days: docsWithin30,
      within60Days: docsWithin60,
    };

    // Calculate average km per vehicle in current month
    let avgKmPerVehicle: number | null = null;
    if (vehiclesWithOdometer.length > 0) {
      const totalKm = vehiclesWithOdometer.reduce((sum, v) => {
        const maxOdo = parseFloat((v._max.odometer ?? 0).toString());
        const minOdo = parseFloat((v._min.odometer ?? 0).toString());
        return sum + Math.max(0, maxOdo - minOdo);
      }, 0);
      avgKmPerVehicle =
        Math.round((totalKm / vehiclesWithOdometer.length) * 10) / 10;
    }

    const result: FleetDashboardDto = {
      totalVehicles,
      vehiclesByStatus,
      maintenanceOrders,
      documentsExpiring,
      avgKmPerVehicle,
      generatedAt: now,
    };

    await this.setCache(cacheKey, result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Fuel Dashboard
  // -----------------------------------------------------------------------

  async getFuelDashboard(
    tenantId: string,
    filters: FuelDashboardFiltersDto,
  ): Promise<FuelDashboardDto> {
    const now = new Date();
    const from = filters.from ?? startOfMonth(now);
    const to = filters.to ?? now;

    const cacheKey = `dashboard:fuel:${tenantId}:${from.toISOString()}:${to.toISOString()}`;
    const cached = await this.getCached<FuelDashboardDto>(cacheKey);
    if (cached) return cached;

    const baseWhere = {
      tenantId,
      deletedAt: null,
      suppliedAt: { gte: from, lte: to },
    } as const;

    const [
      aggregate,
      anomalyCount,
      recentAnomaliesRaw,
      fuelTypeGroups,
      kmData,
    ] = await Promise.all([
      // Total liters and cost
      this.prisma.fuelRecord.aggregate({
        where: baseWhere,
        _sum: { liters: true, totalAmount: true },
        _avg: { unitPrice: true },
      }),

      // Anomaly count
      this.prisma.fuelRecord.count({
        where: { ...baseWhere, anomalyFlag: true },
      }),

      // Recent anomalies with vehicle info
      this.prisma.fuelRecord.findMany({
        where: { ...baseWhere, anomalyFlag: true },
        select: {
          id: true,
          vehicleId: true,
          anomalyReason: true,
          totalAmount: true,
          liters: true,
          suppliedAt: true,
          vehicle: { select: { plate: true } },
        },
        orderBy: { suppliedAt: 'desc' },
        take: 5,
      }),

      // Cost grouped by fuel type
      this.prisma.fuelRecord.groupBy({
        by: ['fuelType'],
        where: baseWhere,
        _sum: { liters: true, totalAmount: true },
        _count: { _all: true },
      }),

      // Odometer data per vehicle for km/l calculation
      this.prisma.fuelRecord.groupBy({
        by: ['vehicleId'],
        where: baseWhere,
        _max: { odometer: true },
        _min: { odometer: true },
        _sum: { liters: true },
      }),
    ]);

    const totalLiters = parseFloat((aggregate._sum.liters ?? 0).toString());
    const totalCost = parseFloat((aggregate._sum.totalAmount ?? 0).toString());
    const avgPricePerLiter =
      totalLiters > 0
        ? Math.round((totalCost / totalLiters) * 10000) / 10000
        : 0;

    // Calculate fleet-average km/l from odometer deltas
    let avgKmPerLiter: number | null = null;
    let totalKmDriven = 0;
    let totalLitersConsumed = 0;

    for (const v of kmData) {
      const maxOdo = parseFloat((v._max.odometer ?? 0).toString());
      const minOdo = parseFloat((v._min.odometer ?? 0).toString());
      const litersForVehicle = parseFloat((v._sum.liters ?? 0).toString());

      if (maxOdo > minOdo && litersForVehicle > 0) {
        totalKmDriven += maxOdo - minOdo;
        totalLitersConsumed += litersForVehicle;
      }
    }

    if (totalLitersConsumed > 0) {
      avgKmPerLiter =
        Math.round((totalKmDriven / totalLitersConsumed) * 100) / 100;
    }

    const recentAnomalies: FuelAnomalyItem[] = recentAnomaliesRaw.map((r) => ({
      id: r.id,
      vehicleId: r.vehicleId,
      vehiclePlate: r.vehicle.plate,
      anomalyReason: r.anomalyReason,
      totalAmount: parseFloat(r.totalAmount.toString()),
      liters: parseFloat(r.liters.toString()),
      suppliedAt: r.suppliedAt,
    }));

    const costByFuelType: FuelCostByTypeItem[] = fuelTypeGroups.map((g) => ({
      fuelType: g.fuelType,
      totalLiters: parseFloat((g._sum.liters ?? 0).toString()),
      totalCost: parseFloat((g._sum.totalAmount ?? 0).toString()),
      recordCount: g._count._all,
    }));

    const result: FuelDashboardDto = {
      period: { from, to },
      totalLiters,
      totalCost,
      avgPricePerLiter,
      avgKmPerLiter,
      anomalyCount,
      recentAnomalies,
      costByFuelType,
      generatedAt: now,
    };

    await this.setCache(cacheKey, result);
    return result;
  }
}
