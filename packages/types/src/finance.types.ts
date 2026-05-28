/**
 * finance.types.ts
 * Financial summary and reporting types.
 * All monetary values are `number` (NUMERIC(19,4) in DB).
 */

import type { TenantId, DateRange } from './common.types';

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface FinancialSummary {
  tenantId: TenantId;
  period: DateRange;
  /** Total revenue — NUMERIC(19,4) in DB. */
  totalRevenue: number;
  /** Total operational cost — NUMERIC(19,4) in DB. */
  totalCost: number;
  /** Gross margin (totalRevenue - totalCost) — NUMERIC(19,4) in DB. */
  margin: number;
  /** Fuel cost portion — NUMERIC(19,4) in DB. */
  fuelCost: number;
  /** Maintenance cost portion — NUMERIC(19,4) in DB. */
  maintenanceCost: number;
}

// ---------------------------------------------------------------------------
// Revenue by client
// ---------------------------------------------------------------------------

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  /** Revenue for this client in the period — NUMERIC(19,4) in DB. */
  revenue: number;
  tripCount: number;
}

// ---------------------------------------------------------------------------
// Cost by vehicle
// ---------------------------------------------------------------------------

export interface CostByVehicle {
  vehicleId: string;
  vehiclePlate: string;
  /** Fuel cost for this vehicle in the period — NUMERIC(19,4) in DB. */
  fuelCost: number;
  /** Maintenance cost for this vehicle in the period — NUMERIC(19,4) in DB. */
  maintenanceCost: number;
  totalKm: number;
  /** Cost per km — NUMERIC(19,4) in DB. */
  costPerKm: number;
}
