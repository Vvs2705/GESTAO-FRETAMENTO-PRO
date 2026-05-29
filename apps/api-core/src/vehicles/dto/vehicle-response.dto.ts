import type { Vehicle } from '@gestao-fretamento-pro/database';

export interface VehicleResponseDto {
  id: string;
  tenantId: string;
  branchId: string | null;
  plate: string;
  prefix: string | null;
  type: string;
  capacity: number;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuelType: string | null;
  currentOdometer: number | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleAvailabilityDto {
  vehicleId: string;
  available: boolean;
  reason?: 'IN_MAINTENANCE' | 'UNAVAILABLE' | 'RETIRED';
}

export function toVehicleDto(vehicle: Vehicle): VehicleResponseDto {
  return {
    id: vehicle.id,
    tenantId: vehicle.tenantId,
    branchId: vehicle.branchId,
    plate: vehicle.plate,
    prefix: vehicle.prefix,
    type: vehicle.type,
    capacity: vehicle.capacity,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    fuelType: vehicle.fuelType,
    currentOdometer: vehicle.currentOdometer ? Number(vehicle.currentOdometer) : null,
    status: vehicle.status,
    notes: vehicle.notes,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  };
}
