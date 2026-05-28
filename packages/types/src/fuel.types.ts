/**
 * fuel.types.ts
 * FuelRecord and FuelStation interfaces and DTOs.
 * All monetary amounts are `number` (NUMERIC(19,4) in DB).
 * Odometer and liters use `number` (NUMERIC(10,1) in DB).
 */

import type { TenantId, FuelRecordId, PaginationQuery } from './common.types';

// ---------------------------------------------------------------------------
// FuelStation
// ---------------------------------------------------------------------------

export interface FuelStation {
  id: string;
  tenantId: TenantId;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  cnpj?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// FuelRecord
// ---------------------------------------------------------------------------

export interface FuelRecord {
  id: FuelRecordId;
  tenantId: TenantId;
  vehicleId: string;
  driverId?: string;
  branchId?: string;
  fuelStationName?: string;
  fuelType: string;
  /** Liters supplied — NUMERIC(10,1) in DB. */
  liters: number;
  /** Price per liter — NUMERIC(19,4) in DB. */
  unitPrice: number;
  /** Total amount = liters * unitPrice — NUMERIC(19,4) in DB. */
  totalAmount: number;
  /** Odometer reading at supply time — NUMERIC(10,1) in DB. */
  odometer: number;
  receiptFileId?: string;
  suppliedAt: Date;
  anomalyFlag: boolean;
  anomalyReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateFuelRecordDto {
  vehicleId: string;
  driverId?: string;
  branchId?: string;
  fuelStationName?: string;
  fuelType: string;
  liters: number;
  unitPrice: number;
  odometer: number;
  suppliedAt: Date;
  notes?: string;
}

export interface UpdateFuelRecordDto {
  fuelStationName?: string;
  fuelType?: string;
  liters?: number;
  unitPrice?: number;
  odometer?: number;
  suppliedAt?: Date;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Anomaly DTO
// ---------------------------------------------------------------------------

export interface FuelAnomalyDto {
  vehicleId: string;
  vehiclePlate: string;
  /** Actual km/l calculated for this record. */
  actualKmPerLiter: number;
  /** Historical average km/l for this vehicle. */
  historicalAvgKmPerLiter: number;
  /** Deviation as a percentage (negative = worse than average). */
  deviationPercent: number;
  fuelRecordId: string;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface FuelListFilters extends PaginationQuery {
  vehicleId?: string;
  driverId?: string;
  branchId?: string;
  fuelType?: string;
  anomalyFlag?: boolean;
  from?: Date;
  to?: Date;
  search?: string;
}
