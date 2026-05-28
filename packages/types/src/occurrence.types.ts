/**
 * occurrence.types.ts
 * Occurrence interfaces and DTOs.
 */

import type {
  TenantId,
  OccurrenceId,
  OccurrenceStatus,
  OccurrenceSeverity,
  PaginationQuery,
} from './common.types';

// ---------------------------------------------------------------------------
// Occurrence
// ---------------------------------------------------------------------------

export interface Occurrence {
  id: OccurrenceId;
  tenantId: TenantId;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  clientId?: string;
  type: string;
  severity: OccurrenceSeverity;
  description: string;
  status: OccurrenceStatus;
  responsibleUserId?: string;
  resolvedAt?: Date;
  actionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateOccurrenceDto {
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  clientId?: string;
  type: string;
  severity: OccurrenceSeverity;
  description: string;
}

export interface UpdateOccurrenceDto {
  type?: string;
  severity?: OccurrenceSeverity;
  description?: string;
  status?: OccurrenceStatus;
  responsibleUserId?: string;
  actionTaken?: string;
}

export interface ResolveOccurrenceDto {
  actionTaken: string;
  resolvedAt?: Date;
}

export interface OccurrenceListFilters extends PaginationQuery {
  status?: OccurrenceStatus;
  severity?: OccurrenceSeverity;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  clientId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}
