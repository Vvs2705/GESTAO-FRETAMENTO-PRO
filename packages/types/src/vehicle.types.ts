/**
 * vehicle.types.ts
 * Vehicle interfaces and DTOs.
 * `currentOdometer` is numeric with 1 decimal place (NUMERIC(10,1) in DB).
 */

import type { TenantId, VehicleId, VehicleStatus, PaginationQuery } from './common.types';

// ---------------------------------------------------------------------------
// Vehicle
// ---------------------------------------------------------------------------

export interface Vehicle {
  id: VehicleId;
  tenantId: TenantId;
  branchId?: string;
  plate: string;
  prefix?: string;
  type: string;
  capacity?: number;
  brand?: string;
  model?: string;
  year?: number;
  /** Stored as NUMERIC(10,1) in DB — exposed as number here. */
  currentOdometer?: number;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// Aggregated stats per vehicle
// ---------------------------------------------------------------------------

export interface VehicleStats {
  /** Total km driven (computed from fuel_records). */
  totalKm?: number;
  /** Total fuel cost in the period. Stored as NUMERIC(19,4), exposed as number. */
  totalFuelCost?: number;
  /** Average km per liter across all fuel records for this vehicle. */
  avgKmPerLiter?: number;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateVehicleDto {
  plate: string;
  prefix?: string;
  type: string;
  capacity?: number;
  brand?: string;
  model?: string;
  year?: number;
  currentOdometer?: number;
  branchId?: string;
}

export interface UpdateVehicleDto {
  plate?: string;
  prefix?: string;
  type?: string;
  capacity?: number;
  brand?: string;
  model?: string;
  year?: number;
  currentOdometer?: number;
  status?: VehicleStatus;
  branchId?: string;
}

export interface VehicleListFilters extends PaginationQuery {
  status?: VehicleStatus;
  search?: string;
  branchId?: string;
}
