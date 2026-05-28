/**
 * trip.types.ts
 * Trip and TripPassenger interfaces and DTOs.
 */

import type {
  TenantId,
  TripId,
  TripStatus,
  PaginationQuery,
} from './common.types';
import type { Vehicle } from './vehicle.types';
import type { Driver } from './driver.types';
import type { Route } from './route.types';
import type { Client } from './client.types';

// ---------------------------------------------------------------------------
// Trip
// ---------------------------------------------------------------------------

export interface Trip {
  id: TripId;
  tenantId: TenantId;
  clientId?: string;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  scheduledStartAt: Date;
  scheduledEndAt?: Date;
  actualStartAt?: Date;
  actualEndAt?: Date;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface TripWithRelations extends Trip {
  vehicle?: Vehicle;
  driver?: Driver;
  route?: Route;
  client?: Client;
}

// ---------------------------------------------------------------------------
// TripPassenger
// ---------------------------------------------------------------------------

export interface TripPassenger {
  id: string;
  tenantId: TenantId;
  tripId: TripId;
  name: string;
  document?: string;
  phone?: string;
  boardingPoint?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateTripDto {
  clientId?: string;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  scheduledStartAt: Date;
  scheduledEndAt?: Date;
  notes?: string;
}

export interface UpdateTripDto {
  clientId?: string;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  notes?: string;
}

export interface ChangeTripStatusDto {
  status: TripStatus;
  reason?: string;
}

export interface TripListFilters extends PaginationQuery {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
  clientId?: string;
  routeId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}
