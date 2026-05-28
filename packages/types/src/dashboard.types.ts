/**
 * dashboard.types.ts
 * Dashboard payload types for each role-specific dashboard.
 * All monetary values are `number` (NUMERIC(19,4) in DB).
 */

import type { DateRange, OccurrenceSeverity, VehicleStatus } from './common.types';
import type { FuelAnomalyDto } from './fuel.types';

// ---------------------------------------------------------------------------
// Executive dashboard (CEO / Owner)
// ---------------------------------------------------------------------------

export interface ExecutiveDashboardKpis {
  /** Number of trips in progress or confirmed today. */
  tripsToday: number;
  /** Number of trips currently in DELAYED status. */
  tripsDelayed: number;
  /** Number of occurrences in OPEN or IN_ANALYSIS status. */
  openOccurrences: number;
  /** Number of vehicles in AVAILABLE status. */
  availableVehicles: number;
  /** Percentage of fleet currently on trips (0–100). */
  fleetUtilization: number;
}

export interface ExecutiveDashboard {
  kpis: ExecutiveDashboardKpis;
  period: DateRange;
  /** Revenue for the current month — NUMERIC(19,4) in DB. */
  monthRevenue?: number;
  /** Operational cost for the current month — NUMERIC(19,4) in DB. */
  monthCost?: number;
  /** Gross margin — NUMERIC(19,4) in DB. */
  monthMargin?: number;
}

// ---------------------------------------------------------------------------
// Operation dashboard (Operator / Supervisor)
// ---------------------------------------------------------------------------

export interface OperationDashboardTripStats {
  total: number;
  draft: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  delayed: number;
  canceled: number;
}

export interface OperationDashboard {
  date: Date;
  trips: OperationDashboardTripStats;
  openOccurrences: number;
  criticalOccurrences: number;
  driversOnTrip: number;
  vehiclesInOperation: number;
}

// ---------------------------------------------------------------------------
// Fleet dashboard (Fleet manager / Supervisor)
// ---------------------------------------------------------------------------

export interface FleetVehicleStatusBreakdown {
  status: VehicleStatus;
  count: number;
}

export interface FleetDashboard {
  totalVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  unavailableVehicles: number;
  retiredVehicles: number;
  statusBreakdown: FleetVehicleStatusBreakdown[];
  /** Number of vehicles with at least one document expiring in the next 30 days. */
  vehiclesWithExpiringDocuments: number;
}

// ---------------------------------------------------------------------------
// Fuel dashboard (Fuel team / Supervisor)
// ---------------------------------------------------------------------------

export interface FuelDashboard {
  period: DateRange;
  /** Total liters supplied in the period. */
  totalLiters: number;
  /** Total fuel cost — NUMERIC(19,4) in DB. */
  totalCost: number;
  /** Average price per liter — NUMERIC(19,4) in DB. */
  averageUnitPrice: number;
  /** Fleet-wide average km per liter. */
  averageKmPerLiter: number;
  /** Number of fuel records flagged as anomalies. */
  anomalyCount: number;
  /** Top anomalies for the period. */
  topAnomalies: FuelAnomalyDto[];
  /** Fuel records without receipt. */
  missingReceiptCount: number;
}

// ---------------------------------------------------------------------------
// Occurrence severity breakdown (shared helper)
// ---------------------------------------------------------------------------

export interface OccurrenceSeverityBreakdown {
  severity: OccurrenceSeverity;
  count: number;
}
