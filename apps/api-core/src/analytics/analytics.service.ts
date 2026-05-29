import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { FuelDashboardFiltersDto, AnalyticsFiltersDto } from './dto/analytics-filters.dto';
import type {
  ExecutiveSummaryResponseDto,
  FuelAnalyticsResponseDto,
  FuelCostByPeriodItem,
  FuelLitersByProductItem,
  FuelCostByVehicleItem,
  FuelAnomalyAnalyticsItem,
  FuelTankStockItem,
  FleetAnalyticsResponseDto,
  VehicleByStatusItem,
  KmByVehicleItem,
  FuelEfficiencyRankItem,
  MaintenanceCostItem,
  ExpiringDocumentItem,
  OperationsAnalyticsResponseDto,
  TripByStatusItem,
} from './dto/analytics-response.dto';

const CACHE_TTL_SECONDS = 60;

// -----------------------------------------------------------------------
// Legacy dashboard types (kept for backwards compat with /dashboards routes)
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

// Raw query row types
interface RawCountRow { count: string }
interface RawFuelSumRow { total_cost: string; total_liters: string }
interface RawPeriodRow { period: string; total_cost: string; total_liters: string }
interface RawProductRow { fuel_type: string; total_liters: string; record_count: string }
interface RawVehicleCostRow { vehicle_id: string; vehicle_plate: string; total_cost: string; total_liters: string }
interface RawKmRow { vehicle_id: string; vehicle_plate: string; estimated_km: string }
interface RawEfficiencyRow { vehicle_id: string; vehicle_plate: string; avg_km_per_liter: string }
interface RawMaintenanceCostRow { vehicle_id: string; vehicle_plate: string; total_cost: string; order_count: string }
interface RawTankRow { tank_id: string; tank_name: string; current_volume_liters: string; capacity_liters: string }
interface RawDeliveryRow { count: string }
interface RawAnomalyRow {
  id: string; vehicle_id: string; vehicle_plate: string;
  anomaly_reason: string | null; total_amount: string; liters: string; supplied_at: Date;
}
interface RawAttendantRow {
  attendant_user_id: string | null; attendant_name: string | null;
  total_dispensed: string; record_count: string; anomaly_count: string;
}
interface RawTripStatusRow { status: string; count: string }
interface RawAvgDurationRow { avg_duration_minutes: string | null }
interface RawDocExpRow {
  document_id: string; entity_type: string; entity_id: string;
  title: string; expires_at: Date;
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

  // =======================================================================
  // Legacy /dashboards endpoints
  // =======================================================================

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
      this.prisma.trip.count({
        where: { tenantId, deletedAt: null, scheduledStartAt: { gte: dayStart, lte: dayEnd }, status: { not: 'CANCELED' } },
      }),
      this.prisma.trip.count({
        where: { tenantId, deletedAt: null, status: 'COMPLETED', actualEndAt: { gte: dayStart, lte: dayEnd } },
      }),
      this.prisma.trip.count({
        where: {
          tenantId, deletedAt: null,
          OR: [{ status: 'DELAYED' }, { status: 'IN_PROGRESS', scheduledEndAt: { lt: now } }],
        },
      }),
      this.prisma.occurrence.count({ where: { tenantId, deletedAt: null, status: { in: ['OPEN', 'IN_ANALYSIS', 'CRITICAL'] } } }),
      this.prisma.occurrence.count({ where: { tenantId, deletedAt: null, status: 'CRITICAL' } }),
      this.prisma.vehicle.count({ where: { tenantId, deletedAt: null, status: 'AVAILABLE' } }),
      this.prisma.vehicle.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.driver.count({ where: { tenantId, deletedAt: null, availabilityStatus: { in: ['AVAILABLE', 'ON_TRIP'] } } }),
      this.prisma.fuelRecord.aggregate({ where: { tenantId, deletedAt: null, suppliedAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
      this.prisma.fuelRecord.count({ where: { tenantId, deletedAt: null, anomalyFlag: true, suppliedAt: { gte: monthStart } } }),
      this.prisma.document.count({ where: { tenantId, deletedAt: null, status: 'ACTIVE', expiresAt: { gte: now, lte: thirtyDaysFromNow } } }),
    ]);

    const fuelCostThisMonth = parseFloat((fuelCostResult._sum.totalAmount ?? 0).toString());
    const fleetUtilizationPercent = totalVehicles > 0
      ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100 * 100) / 100
      : 0;

    const result: ExecutiveDashboardDto = {
      tripsToday, tripsCompleted, tripsDelayed, openOccurrences, criticalOccurrences,
      availableVehicles, totalVehicles, fleetUtilizationPercent, activeDrivers,
      fuelCostThisMonth, anomaliesThisMonth, documentsExpiringSoon, generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getOperationDashboard(tenantId: string): Promise<OperationDashboardDto> {
    const cacheKey = `dashboard:operation:${tenantId}`;
    const cached = await this.getCached<OperationDashboardDto>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const [tripStatuses, , openOccurrencesRaw, delayedTripsRaw] = await Promise.all([
      this.prisma.trip.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null, scheduledStartAt: { gte: dayStart, lte: dayEnd } },
        _count: { _all: true },
      }),
      this.prisma.trip.findMany({
        where: { tenantId, deletedAt: null, scheduledStartAt: { gte: now, lte: twelveHoursFromNow }, status: { in: ['CONFIRMED', 'IN_PROGRESS', 'DELAYED'] } },
        select: { id: true, scheduledStartAt: true },
        orderBy: { scheduledStartAt: 'asc' },
      }),
      this.prisma.occurrence.findMany({
        where: { tenantId, deletedAt: null, status: { in: ['OPEN', 'IN_ANALYSIS', 'CRITICAL'] } },
        select: { id: true, type: true, severity: true, status: true, description: true, createdAt: true, vehicleId: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.trip.findMany({
        where: { tenantId, deletedAt: null, OR: [{ status: 'DELAYED' }, { status: 'IN_PROGRESS', scheduledEndAt: { lt: now } }] },
        select: {
          id: true, status: true, scheduledStartAt: true, scheduledEndAt: true, vehicleId: true, driverId: true,
          vehicle: { select: { plate: true } },
          driver: { select: { employee: { select: { name: true } } } },
        },
        orderBy: { scheduledStartAt: 'asc' },
        take: 20,
      }),
    ]);

    const statusMap = new Map(tripStatuses.map((s) => [s.status, s._count._all]));
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

    const openOccurrences: RecentOccurrenceItem[] = openOccurrencesRaw.map((o) => ({
      id: o.id, type: o.type, severity: o.severity, status: o.status,
      description: o.description.length > 100 ? `${o.description.substring(0, 100)}...` : o.description,
      createdAt: o.createdAt, vehicleId: o.vehicleId,
    }));

    const delayedTrips: DelayedTripItem[] = delayedTripsRaw.map((t) => ({
      id: t.id, status: t.status, scheduledStartAt: t.scheduledStartAt, scheduledEndAt: t.scheduledEndAt,
      vehicleId: t.vehicleId, vehiclePlate: t.vehicle?.plate ?? null,
      driverId: t.driverId, driverName: t.driver?.employee?.name ?? null,
    }));

    const result: OperationDashboardDto = { date: now, trips, openOccurrences, delayedTrips, generatedAt: now };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getFleetDashboard(tenantId: string): Promise<FleetDashboardDto> {
    const cacheKey = `dashboard:fleet:${tenantId}`;
    const cached = await this.getCached<FleetDashboardDto>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const days7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const days30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const days60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const [totalVehicles, vehicleStatusGroups, openMaintenanceOrders, docsWithin7, docsWithin30, docsWithin60, vehiclesWithOdometer] =
      await Promise.all([
        this.prisma.vehicle.count({ where: { tenantId, deletedAt: null } }),
        this.prisma.vehicle.groupBy({ by: ['status'], where: { tenantId, deletedAt: null }, _count: { _all: true } }),
        this.prisma.maintenanceOrder.findMany({
          where: { tenantId, deletedAt: null, status: { in: ['OPEN', 'IN_PROGRESS'] } },
          select: { id: true, vehicleId: true, type: true, description: true, status: true, expectedEndAt: true, createdAt: true, vehicle: { select: { plate: true } } },
          orderBy: { createdAt: 'desc' }, take: 20,
        }),
        this.prisma.document.count({ where: { tenantId, deletedAt: null, status: 'ACTIVE', expiresAt: { gte: now, lte: days7 } } }),
        this.prisma.document.count({ where: { tenantId, deletedAt: null, status: 'ACTIVE', expiresAt: { gte: now, lte: days30 } } }),
        this.prisma.document.count({ where: { tenantId, deletedAt: null, status: 'ACTIVE', expiresAt: { gte: now, lte: days60 } } }),
        this.prisma.fuelRecord.groupBy({
          by: ['vehicleId'], where: { tenantId, deletedAt: null, suppliedAt: { gte: monthStart } },
          _max: { odometer: true }, _min: { odometer: true },
        }),
      ]);

    const vehiclesByStatus: VehicleStatusBreakdownItem[] = vehicleStatusGroups.map((g) => ({ status: g.status, count: g._count._all }));
    const maintenanceOrders: OpenMaintenanceItem[] = openMaintenanceOrders.map((o) => ({
      id: o.id, vehicleId: o.vehicleId, vehiclePlate: o.vehicle.plate, type: o.type,
      description: o.description.length > 100 ? `${o.description.substring(0, 100)}...` : o.description,
      status: o.status, expectedEndAt: o.expectedEndAt, createdAt: o.createdAt,
    }));

    let avgKmPerVehicle: number | null = null;
    if (vehiclesWithOdometer.length > 0) {
      const totalKm = vehiclesWithOdometer.reduce((sum, v) => {
        const maxOdo = parseFloat((v._max.odometer ?? 0).toString());
        const minOdo = parseFloat((v._min.odometer ?? 0).toString());
        return sum + Math.max(0, maxOdo - minOdo);
      }, 0);
      avgKmPerVehicle = Math.round((totalKm / vehiclesWithOdometer.length) * 10) / 10;
    }

    const result: FleetDashboardDto = {
      totalVehicles, vehiclesByStatus, maintenanceOrders,
      documentsExpiring: { within7Days: docsWithin7, within30Days: docsWithin30, within60Days: docsWithin60 },
      avgKmPerVehicle, generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getFuelDashboard(tenantId: string, filters: FuelDashboardFiltersDto): Promise<FuelDashboardDto> {
    const now = new Date();
    const from = filters.from ?? startOfMonth(now);
    const to = filters.to ?? now;
    const cacheKey = `dashboard:fuel:${tenantId}:${from.toISOString()}:${to.toISOString()}`;
    const cached = await this.getCached<FuelDashboardDto>(cacheKey);
    if (cached) return cached;

    const baseWhere = { tenantId, deletedAt: null, suppliedAt: { gte: from, lte: to } } as const;

    const [aggregate, anomalyCount, recentAnomaliesRaw, fuelTypeGroups, kmData] = await Promise.all([
      this.prisma.fuelRecord.aggregate({ where: baseWhere, _sum: { liters: true, totalAmount: true }, _avg: { unitPrice: true } }),
      this.prisma.fuelRecord.count({ where: { ...baseWhere, anomalyFlag: true } }),
      this.prisma.fuelRecord.findMany({
        where: { ...baseWhere, anomalyFlag: true },
        select: { id: true, vehicleId: true, anomalyReason: true, totalAmount: true, liters: true, suppliedAt: true, vehicle: { select: { plate: true } } },
        orderBy: { suppliedAt: 'desc' }, take: 5,
      }),
      this.prisma.fuelRecord.groupBy({ by: ['fuelType'], where: baseWhere, _sum: { liters: true, totalAmount: true }, _count: { _all: true } }),
      this.prisma.fuelRecord.groupBy({ by: ['vehicleId'], where: baseWhere, _max: { odometer: true }, _min: { odometer: true }, _sum: { liters: true } }),
    ]);

    const totalLiters = parseFloat((aggregate._sum.liters ?? 0).toString());
    const totalCost = parseFloat((aggregate._sum.totalAmount ?? 0).toString());
    const avgPricePerLiter = totalLiters > 0 ? Math.round((totalCost / totalLiters) * 10000) / 10000 : 0;

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
      avgKmPerLiter = Math.round((totalKmDriven / totalLitersConsumed) * 100) / 100;
    }

    const result: FuelDashboardDto = {
      period: { from, to },
      totalLiters, totalCost, avgPricePerLiter, avgKmPerLiter, anomalyCount,
      recentAnomalies: recentAnomaliesRaw.map((r) => ({
        id: r.id, vehicleId: r.vehicleId, vehiclePlate: r.vehicle.plate,
        anomalyReason: r.anomalyReason, totalAmount: parseFloat(r.totalAmount.toString()),
        liters: parseFloat(r.liters.toString()), suppliedAt: r.suppliedAt,
      })),
      costByFuelType: fuelTypeGroups.map((g) => ({
        fuelType: g.fuelType, totalLiters: parseFloat((g._sum.liters ?? 0).toString()),
        totalCost: parseFloat((g._sum.totalAmount ?? 0).toString()), recordCount: g._count._all,
      })),
      generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  // =======================================================================
  // NEW /analytics/* endpoints (TAREFA 1)
  // =======================================================================

  async getExecutiveSummary(tenantId: string, filters: AnalyticsFiltersDto): Promise<ExecutiveSummaryResponseDto> {
    const now = new Date();
    const from = filters.dateFrom ?? startOfMonth(now);
    const to = filters.dateTo ?? now;
    const cacheKey = `analytics:executive:${tenantId}:${from.toISOString()}:${to.toISOString()}:${filters.branchId ?? 'all'}`;
    const cached = await this.getCached<ExecutiveSummaryResponseDto>(cacheKey);
    if (cached) return cached;

    const [tripRows, vehicleRows, fuelRows, anomalyRows, driverRows, contractRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM trips
         WHERE tenant_id = $1 AND deleted_at IS NULL AND scheduled_start_at >= $2 AND scheduled_start_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM vehicles WHERE tenant_id = $1 AND deleted_at IS NULL`,
        tenantId,
      ),
      this.prisma.$queryRawUnsafe<RawFuelSumRow[]>(
        `SELECT COALESCE(SUM(total_amount),0)::text AS total_cost, COALESCE(SUM(liters),0)::text AS total_liters
         FROM fuel_records WHERE tenant_id = $1 AND deleted_at IS NULL AND supplied_at >= $2 AND supplied_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM fuel_records
         WHERE tenant_id = $1 AND deleted_at IS NULL AND anomaly_flag = true AND supplied_at >= $2 AND supplied_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM drivers
         WHERE tenant_id = $1 AND deleted_at IS NULL AND availability_status IN ('AVAILABLE','ON_TRIP')`,
        tenantId,
      ),
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM contracts WHERE tenant_id = $1 AND status = 'ACTIVE'`,
        tenantId,
      ),
    ]);

    const result: ExecutiveSummaryResponseDto = {
      totalTrips: parseInt(tripRows[0]?.count ?? '0', 10),
      totalVehicles: parseInt(vehicleRows[0]?.count ?? '0', 10),
      totalFuelCost: parseFloat(fuelRows[0]?.total_cost ?? '0'),
      totalFuelLiters: parseFloat(fuelRows[0]?.total_liters ?? '0'),
      anomaliesCount: parseInt(anomalyRows[0]?.count ?? '0', 10),
      activeDrivers: parseInt(driverRows[0]?.count ?? '0', 10),
      activeContracts: parseInt(contractRows[0]?.count ?? '0', 10),
      generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getFuelAnalytics(tenantId: string, filters: AnalyticsFiltersDto): Promise<FuelAnalyticsResponseDto> {
    const now = new Date();
    const from = filters.dateFrom ?? startOfMonth(now);
    const to = filters.dateTo ?? now;
    const cacheKey = `analytics:fuel:${tenantId}:${from.toISOString()}:${to.toISOString()}:${filters.branchId ?? 'all'}`;
    const cached = await this.getCached<FuelAnalyticsResponseDto>(cacheKey);
    if (cached) return cached;

    const [costByPeriodRows, litersByProductRows, costByVehicleRows, kmData, deliveryRows, anomalyRows, attendantRows, tankRows] =
      await Promise.all([
        this.prisma.$queryRawUnsafe<RawPeriodRow[]>(
          `SELECT TO_CHAR(DATE_TRUNC('month', supplied_at),'YYYY-MM') AS period,
                  COALESCE(SUM(total_amount),0)::text AS total_cost,
                  COALESCE(SUM(liters),0)::text AS total_liters
           FROM fuel_records WHERE tenant_id = $1 AND deleted_at IS NULL AND supplied_at >= $2 AND supplied_at <= $3
           GROUP BY period ORDER BY period`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<RawProductRow[]>(
          `SELECT fuel_type, COALESCE(SUM(liters),0)::text AS total_liters, COUNT(*)::text AS record_count
           FROM fuel_records WHERE tenant_id = $1 AND deleted_at IS NULL AND supplied_at >= $2 AND supplied_at <= $3
           GROUP BY fuel_type`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<RawVehicleCostRow[]>(
          `SELECT fr.vehicle_id, v.plate AS vehicle_plate,
                  COALESCE(SUM(fr.total_amount),0)::text AS total_cost,
                  COALESCE(SUM(fr.liters),0)::text AS total_liters
           FROM fuel_records fr JOIN vehicles v ON v.id = fr.vehicle_id
           WHERE fr.tenant_id = $1 AND fr.deleted_at IS NULL AND fr.supplied_at >= $2 AND fr.supplied_at <= $3
           GROUP BY fr.vehicle_id, v.plate ORDER BY total_cost DESC LIMIT 20`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<Array<{ vehicle_id: string; max_odo: string; min_odo: string; total_liters: string }>>(
          `SELECT vehicle_id, MAX(odometer)::text AS max_odo, MIN(odometer)::text AS min_odo, COALESCE(SUM(liters),0)::text AS total_liters
           FROM fuel_records WHERE tenant_id = $1 AND deleted_at IS NULL AND supplied_at >= $2 AND supplied_at <= $3 AND odometer IS NOT NULL
           GROUP BY vehicle_id`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<RawDeliveryRow[]>(
          `SELECT COUNT(*)::text AS count FROM fuel_deliveries
           WHERE tenant_id = $1 AND deleted_at IS NULL AND delivery_date >= $2 AND delivery_date <= $3`,
          tenantId, from, to,
        ).catch(() => [{ count: '0' }] as RawDeliveryRow[]),
        this.prisma.$queryRawUnsafe<RawAnomalyRow[]>(
          `SELECT fr.id, fr.vehicle_id, v.plate AS vehicle_plate,
                  fr.anomaly_reason, fr.total_amount::text, fr.liters::text, fr.supplied_at
           FROM fuel_records fr JOIN vehicles v ON v.id = fr.vehicle_id
           WHERE fr.tenant_id = $1 AND fr.deleted_at IS NULL AND fr.anomaly_flag = true
             AND fr.supplied_at >= $2 AND fr.supplied_at <= $3
           ORDER BY fr.supplied_at DESC LIMIT 50`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<RawAttendantRow[]>(
          `SELECT fr.created_by AS attendant_user_id, u.name AS attendant_name,
                  COALESCE(SUM(fr.liters),0)::text AS total_dispensed,
                  COUNT(*)::text AS record_count,
                  COUNT(*) FILTER (WHERE fr.anomaly_flag = true)::text AS anomaly_count
           FROM fuel_records fr LEFT JOIN users u ON u.id = fr.created_by
           WHERE fr.tenant_id = $1 AND fr.deleted_at IS NULL AND fr.supplied_at >= $2 AND fr.supplied_at <= $3
           GROUP BY fr.created_by, u.name ORDER BY total_dispensed DESC`,
          tenantId, from, to,
        ),
        this.prisma.$queryRawUnsafe<RawTankRow[]>(
          `SELECT id AS tank_id, name AS tank_name, current_stock_liters::text AS current_volume_liters, capacity_liters::text
           FROM fuel_tanks WHERE tenant_id = $1 AND deleted_at IS NULL`,
          tenantId,
        ).catch(() => [] as RawTankRow[]),
      ]);

    let totalKm = 0;
    let totalLitersForKml = 0;
    for (const v of kmData) {
      const diff = parseFloat(v.max_odo) - parseFloat(v.min_odo);
      const liters = parseFloat(v.total_liters);
      if (diff > 0 && liters > 0) { totalKm += diff; totalLitersForKml += liters; }
    }
    const avgKmPerLiter = totalLitersForKml > 0 ? Math.round((totalKm / totalLitersForKml) * 100) / 100 : null;

    const stockByTank: FuelTankStockItem[] = tankRows.map((t) => {
      const current = parseFloat(t.current_volume_liters);
      const capacity = parseFloat(t.capacity_liters);
      return { tankId: t.tank_id, tankName: t.tank_name, currentVolumeLiters: current, capacityLiters: capacity, fillPercent: capacity > 0 ? Math.round((current / capacity) * 1000) / 10 : 0 };
    });

    const result: FuelAnalyticsResponseDto = {
      period: { from, to },
      costByPeriod: costByPeriodRows.map((r): FuelCostByPeriodItem => ({ period: r.period, totalCost: parseFloat(r.total_cost), totalLiters: parseFloat(r.total_liters) })),
      litersByProduct: litersByProductRows.map((r): FuelLitersByProductItem => ({ fuelType: r.fuel_type, totalLiters: parseFloat(r.total_liters), recordCount: parseInt(r.record_count, 10) })),
      costByVehicle: costByVehicleRows.map((r): FuelCostByVehicleItem => ({ vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, totalCost: parseFloat(r.total_cost), totalLiters: parseFloat(r.total_liters) })),
      costByRoute: [],
      costByClient: [],
      avgKmPerLiter,
      stockByTank,
      deliveriesInPeriod: parseInt(deliveryRows[0]?.count ?? '0', 10),
      anomalies: anomalyRows.map((r): FuelAnomalyAnalyticsItem => ({
        id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate,
        anomalyReason: r.anomaly_reason, totalAmount: parseFloat(r.total_amount),
        liters: parseFloat(r.liters), suppliedAt: r.supplied_at,
      })),
      attendantsPerformance: attendantRows.map((r) => ({
        attendantUserId: r.attendant_user_id, attendantName: r.attendant_name,
        totalDispensed: parseFloat(r.total_dispensed), recordCount: parseInt(r.record_count, 10), anomalyCount: parseInt(r.anomaly_count, 10),
      })),
      generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getFleetAnalytics(tenantId: string, filters: AnalyticsFiltersDto): Promise<FleetAnalyticsResponseDto> {
    const now = new Date();
    const from = filters.dateFrom ?? startOfMonth(now);
    const to = filters.dateTo ?? now;
    const cacheKey = `analytics:fleet:${tenantId}:${from.toISOString()}:${to.toISOString()}:${filters.branchId ?? 'all'}`;
    const cached = await this.getCached<FleetAnalyticsResponseDto>(cacheKey);
    if (cached) return cached;

    const [statusRows, kmRows, efficiencyRows, maintenanceRows, docRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<Array<{ status: string; count: string }>>(
        `SELECT status, COUNT(*)::text AS count FROM vehicles WHERE tenant_id = $1 AND deleted_at IS NULL GROUP BY status`,
        tenantId,
      ),
      this.prisma.$queryRawUnsafe<RawKmRow[]>(
        `SELECT fr.vehicle_id, v.plate AS vehicle_plate, (MAX(fr.odometer) - MIN(fr.odometer))::text AS estimated_km
         FROM fuel_records fr JOIN vehicles v ON v.id = fr.vehicle_id
         WHERE fr.tenant_id = $1 AND fr.deleted_at IS NULL AND fr.supplied_at >= $2 AND fr.supplied_at <= $3 AND fr.odometer IS NOT NULL
         GROUP BY fr.vehicle_id, v.plate HAVING MAX(fr.odometer) > MIN(fr.odometer)
         ORDER BY estimated_km DESC`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawEfficiencyRow[]>(
        `SELECT fr.vehicle_id, v.plate AS vehicle_plate,
                ROUND((MAX(fr.odometer) - MIN(fr.odometer)) / NULLIF(SUM(fr.liters),0),2)::text AS avg_km_per_liter
         FROM fuel_records fr JOIN vehicles v ON v.id = fr.vehicle_id
         WHERE fr.tenant_id = $1 AND fr.deleted_at IS NULL AND fr.supplied_at >= $2 AND fr.supplied_at <= $3 AND fr.odometer IS NOT NULL
         GROUP BY fr.vehicle_id, v.plate HAVING MAX(fr.odometer) > MIN(fr.odometer) AND SUM(fr.liters) > 0
         ORDER BY avg_km_per_liter DESC LIMIT 20`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawMaintenanceCostRow[]>(
        `SELECT mo.vehicle_id, v.plate AS vehicle_plate,
                COALESCE(SUM(mo.total_cost),0)::text AS total_cost, COUNT(*)::text AS order_count
         FROM maintenance_orders mo JOIN vehicles v ON v.id = mo.vehicle_id
         WHERE mo.tenant_id = $1 AND mo.deleted_at IS NULL AND mo.created_at >= $2 AND mo.created_at <= $3
         GROUP BY mo.vehicle_id, v.plate ORDER BY total_cost DESC LIMIT 20`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawDocExpRow[]>(
        `SELECT id AS document_id, entity_type, entity_id, title, expires_at
         FROM documents WHERE tenant_id = $1 AND deleted_at IS NULL AND status = 'ACTIVE'
           AND expires_at >= NOW() AND expires_at <= NOW() + INTERVAL '60 days'
         ORDER BY expires_at ASC LIMIT 50`,
        tenantId,
      ),
    ]);

    const result: FleetAnalyticsResponseDto = {
      vehiclesByStatus: statusRows.map((r): VehicleByStatusItem => ({ status: r.status, count: parseInt(r.count, 10) })),
      kmByVehicle: kmRows.map((r): KmByVehicleItem => ({ vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, estimatedKm: parseFloat(r.estimated_km) })),
      fuelEfficiencyRanking: efficiencyRows.map((r): FuelEfficiencyRankItem => ({ vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, avgKmPerLiter: parseFloat(r.avg_km_per_liter) })),
      maintenanceCosts: maintenanceRows.map((r): MaintenanceCostItem => ({ vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, totalCost: parseFloat(r.total_cost), orderCount: parseInt(r.order_count, 10) })),
      documentsExpiring: docRows.map((r): ExpiringDocumentItem => {
        const expiresAt = new Date(r.expires_at);
        return { documentId: r.document_id, entityType: r.entity_type, entityId: r.entity_id, title: r.title, expiresAt, daysUntilExpiry: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
      }),
      generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }

  async getOperationsAnalytics(tenantId: string, filters: AnalyticsFiltersDto): Promise<OperationsAnalyticsResponseDto> {
    const now = new Date();
    const from = filters.dateFrom ?? startOfMonth(now);
    const to = filters.dateTo ?? now;
    const cacheKey = `analytics:operations:${tenantId}:${from.toISOString()}:${to.toISOString()}:${filters.branchId ?? 'all'}`;
    const cached = await this.getCached<OperationsAnalyticsResponseDto>(cacheKey);
    if (cached) return cached;

    const [totalRows, statusRows, onTimeRows, avgDurationRows, occurrenceRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM trips
         WHERE tenant_id = $1 AND deleted_at IS NULL AND scheduled_start_at >= $2 AND scheduled_start_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawTripStatusRow[]>(
        `SELECT status, COUNT(*)::text AS count FROM trips
         WHERE tenant_id = $1 AND deleted_at IS NULL AND scheduled_start_at >= $2 AND scheduled_start_at <= $3
         GROUP BY status`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<Array<{ on_time: string; total_completed: string }>>(
        `SELECT
           COUNT(*) FILTER (WHERE actual_end_at IS NOT NULL AND scheduled_end_at IS NOT NULL AND actual_end_at <= scheduled_end_at)::text AS on_time,
           COUNT(*) FILTER (WHERE status = 'COMPLETED')::text AS total_completed
         FROM trips WHERE tenant_id = $1 AND deleted_at IS NULL AND scheduled_start_at >= $2 AND scheduled_start_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawAvgDurationRow[]>(
        `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (actual_end_at - actual_start_at)) / 60))::text AS avg_duration_minutes
         FROM trips WHERE tenant_id = $1 AND deleted_at IS NULL AND status = 'COMPLETED'
           AND actual_start_at IS NOT NULL AND actual_end_at IS NOT NULL
           AND scheduled_start_at >= $2 AND scheduled_start_at <= $3`,
        tenantId, from, to,
      ),
      this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM occurrences
         WHERE tenant_id = $1 AND deleted_at IS NULL AND created_at >= $2 AND created_at <= $3`,
        tenantId, from, to,
      ),
    ]);

    const onTimeData = onTimeRows[0];
    const onTime = parseInt(onTimeData?.on_time ?? '0', 10);
    const totalCompleted = parseInt(onTimeData?.total_completed ?? '0', 10);

    const result: OperationsAnalyticsResponseDto = {
      totalTrips: parseInt(totalRows[0]?.count ?? '0', 10),
      tripsByStatus: statusRows.map((r): TripByStatusItem => ({ status: r.status, count: parseInt(r.count, 10) })),
      onTimeRatePercent: totalCompleted > 0 ? Math.round((onTime / totalCompleted) * 1000) / 10 : 0,
      avgDurationMinutes: avgDurationRows[0]?.avg_duration_minutes != null ? parseFloat(avgDurationRows[0].avg_duration_minutes) : null,
      occurrencesCount: parseInt(occurrenceRows[0]?.count ?? '0', 10),
      generatedAt: now,
    };
    await this.setCache(cacheKey, result);
    return result;
  }
}
