import type { Driver, Employee } from '@gestao-fretamento-pro/database';

export interface DriverResponseDto {
  id: string;
  tenantId: string;
  employeeId: string | null;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiresAt: Date;
  availabilityStatus: string;
  preferredVehicleId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

export interface DriverAvailabilityDto {
  driverId: string;
  available: boolean;
  reason?: string;
}

type DriverWithEmployee = Driver & { employee?: Employee | null };

export function toDriverDto(driver: DriverWithEmployee): DriverResponseDto {
  return {
    id: driver.id,
    tenantId: driver.tenantId,
    employeeId: driver.employeeId,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiresAt: driver.licenseExpiresAt,
    availabilityStatus: driver.availabilityStatus,
    preferredVehicleId: driver.preferredVehicleId,
    notes: driver.notes,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
    employee: driver.employee
      ? {
          id: driver.employee.id,
          name: driver.employee.name,
          phone: driver.employee.phone,
          email: driver.employee.email,
        }
      : null,
  };
}
