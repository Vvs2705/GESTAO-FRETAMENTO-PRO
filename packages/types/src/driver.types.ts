/**
 * driver.types.ts
 * Driver interfaces and DTOs.
 */

import type {
  TenantId,
  DriverId,
  EmployeeId,
  DriverAvailabilityStatus,
  PaginationQuery,
} from './common.types';
import type { Employee } from './user.types';

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

export interface Driver {
  id: DriverId;
  tenantId: TenantId;
  employeeId?: EmployeeId;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiresAt: Date;
  availabilityStatus: DriverAvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface DriverWithEmployee extends Driver {
  employee?: Employee;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateDriverDto {
  employeeId?: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiresAt: Date;
  availabilityStatus?: DriverAvailabilityStatus;
}

export interface UpdateDriverDto {
  employeeId?: string;
  licenseNumber?: string;
  licenseCategory?: string;
  licenseExpiresAt?: Date;
  availabilityStatus?: DriverAvailabilityStatus;
}

export interface DriverListFilters extends PaginationQuery {
  availabilityStatus?: DriverAvailabilityStatus;
  search?: string;
  branchId?: string;
}
