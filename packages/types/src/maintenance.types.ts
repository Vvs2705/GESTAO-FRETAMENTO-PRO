/**
 * maintenance.types.ts
 * MaintenanceOrder and MaintenanceItem interfaces and DTOs.
 * All monetary values are `number` (NUMERIC(19,4) in DB).
 */

import type {
  TenantId,
  MaintenanceOrderId,
  MaintenanceStatus,
  MaintenanceType,
  PaginationQuery,
} from './common.types';

// ---------------------------------------------------------------------------
// MaintenanceItem
// ---------------------------------------------------------------------------

export interface MaintenanceItem {
  id: string;
  tenantId: TenantId;
  maintenanceOrderId: MaintenanceOrderId;
  description: string;
  quantity: number;
  /** Unit price — NUMERIC(19,4) in DB. */
  unitPrice?: number;
  /** Total for this item — NUMERIC(19,4) in DB. */
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// MaintenanceOrder
// ---------------------------------------------------------------------------

export interface MaintenanceOrder {
  id: MaintenanceOrderId;
  tenantId: TenantId;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  supplierName?: string;
  expectedStartAt?: Date;
  expectedEndAt?: Date;
  actualEndAt?: Date;
  /** Total cost — NUMERIC(19,4) in DB. */
  totalCost?: number;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateMaintenanceItemDto {
  description: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateMaintenanceOrderDto {
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  supplierName?: string;
  expectedStartAt?: Date;
  expectedEndAt?: Date;
  items?: CreateMaintenanceItemDto[];
}

export interface UpdateMaintenanceOrderDto {
  type?: MaintenanceType;
  description?: string;
  supplierName?: string;
  expectedStartAt?: Date;
  expectedEndAt?: Date;
  actualEndAt?: Date;
  totalCost?: number;
  status?: MaintenanceStatus;
}

export interface MaintenanceListFilters extends PaginationQuery {
  status?: MaintenanceStatus;
  type?: MaintenanceType;
  vehicleId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}
