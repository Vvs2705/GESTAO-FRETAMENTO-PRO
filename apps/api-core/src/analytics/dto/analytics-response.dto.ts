/**
 * Analytics response DTOs — typed payloads for the /analytics/* endpoints.
 */

// ---------------------------------------------------------------------------
// Executive Summary
// ---------------------------------------------------------------------------

export interface ExecutiveSummaryResponseDto {
  totalTrips: number;
  totalVehicles: number;
  totalFuelCost: number;
  totalFuelLiters: number;
  anomaliesCount: number;
  activeDrivers: number;
  activeContracts: number;
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// Fuel Analytics
// ---------------------------------------------------------------------------

export interface FuelCostByPeriodItem {
  period: string; // 'YYYY-MM'
  totalCost: number;
  totalLiters: number;
}

export interface FuelLitersByProductItem {
  fuelType: string;
  totalLiters: number;
  recordCount: number;
}

export interface FuelCostByVehicleItem {
  vehicleId: string;
  vehiclePlate: string;
  totalCost: number;
  totalLiters: number;
}

export interface FuelCostByRouteItem {
  routeId: string | null;
  routeName: string | null;
  totalCost: number;
  tripCount: number;
}

export interface FuelCostByClientItem {
  clientId: string | null;
  clientName: string | null;
  totalCost: number;
  tripCount: number;
}

export interface FuelAnomalyAnalyticsItem {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  anomalyReason: string | null;
  totalAmount: number;
  liters: number;
  suppliedAt: Date;
}

export interface FuelTankStockItem {
  tankId: string;
  tankName: string;
  currentVolumeLiters: number;
  capacityLiters: number;
  fillPercent: number;
}

export interface FuelAttendantPerformanceItem {
  attendantUserId: string | null;
  attendantName: string | null;
  totalDispensed: number;
  recordCount: number;
  anomalyCount: number;
}

export interface FuelAnalyticsResponseDto {
  period: { from: Date; to: Date };
  costByPeriod: FuelCostByPeriodItem[];
  litersByProduct: FuelLitersByProductItem[];
  costByVehicle: FuelCostByVehicleItem[];
  costByRoute: FuelCostByRouteItem[];
  costByClient: FuelCostByClientItem[];
  avgKmPerLiter: number | null;
  stockByTank: FuelTankStockItem[];
  deliveriesInPeriod: number;
  anomalies: FuelAnomalyAnalyticsItem[];
  attendantsPerformance: FuelAttendantPerformanceItem[];
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// Fleet Analytics
// ---------------------------------------------------------------------------

export interface VehicleByStatusItem {
  status: string;
  count: number;
}

export interface KmByVehicleItem {
  vehicleId: string;
  vehiclePlate: string;
  estimatedKm: number;
}

export interface FuelEfficiencyRankItem {
  vehicleId: string;
  vehiclePlate: string;
  avgKmPerLiter: number;
}

export interface MaintenanceCostItem {
  vehicleId: string;
  vehiclePlate: string;
  totalCost: number;
  orderCount: number;
}

export interface ExpiringDocumentItem {
  documentId: string;
  entityType: string;
  entityId: string;
  title: string;
  expiresAt: Date;
  daysUntilExpiry: number;
}

export interface FleetAnalyticsResponseDto {
  vehiclesByStatus: VehicleByStatusItem[];
  kmByVehicle: KmByVehicleItem[];
  fuelEfficiencyRanking: FuelEfficiencyRankItem[];
  maintenanceCosts: MaintenanceCostItem[];
  documentsExpiring: ExpiringDocumentItem[];
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// Operations Analytics
// ---------------------------------------------------------------------------

export interface TripByStatusItem {
  status: string;
  count: number;
}

export interface OperationsAnalyticsResponseDto {
  totalTrips: number;
  tripsByStatus: TripByStatusItem[];
  onTimeRatePercent: number;
  avgDurationMinutes: number | null;
  occurrencesCount: number;
  generatedAt: Date;
}
