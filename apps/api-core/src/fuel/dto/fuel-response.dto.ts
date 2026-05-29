import type { FuelRecord } from '@gestao-fretamento-pro/database';

export interface FuelRecordResponseDto {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string | null;
  branchId: string | null;
  fuelStationName: string | null;
  fuelType: string;
  liters: number;
  unitPrice: number;
  totalAmount: number;
  odometer: number;
  suppliedAt: Date;
  anomalyFlag: boolean;
  anomalyReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelStatsDto {
  totalLiters: number;
  totalCost: number;
  averageKmPerLiter: number | null;
  costPerKm: number | null;
  totalRecords: number;
}

export function toFuelRecordDto(record: FuelRecord): FuelRecordResponseDto {
  return {
    id: record.id,
    tenantId: record.tenantId,
    vehicleId: record.vehicleId,
    driverId: record.driverId,
    branchId: record.branchId,
    fuelStationName: record.fuelStationName,
    fuelType: record.fuelType,
    liters: Number(record.liters),
    unitPrice: Number(record.unitPrice),
    totalAmount: Number(record.totalAmount),
    odometer: Number(record.odometer),
    suppliedAt: record.suppliedAt,
    anomalyFlag: record.anomalyFlag,
    anomalyReason: record.anomalyReason,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
