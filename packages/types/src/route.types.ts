/**
 * route.types.ts
 * Route and RoutePoint interfaces and DTOs.
 */

import type { TenantId, RouteId } from './common.types';

// ---------------------------------------------------------------------------
// RoutePoint
// ---------------------------------------------------------------------------

export interface RoutePoint {
  id: string;
  tenantId: TenantId;
  routeId: RouteId;
  sequence: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  /** HH:MM planned departure/arrival time string */
  plannedTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export interface Route {
  id: RouteId;
  tenantId: TenantId;
  clientId?: string;
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface RouteWithPoints extends Route {
  routePoints: RoutePoint[];
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateRoutePointDto {
  sequence: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  plannedTime?: string;
}

export interface CreateRouteDto {
  clientId?: string;
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  routePoints?: CreateRoutePointDto[];
}

export interface UpdateRouteDto {
  clientId?: string;
  name?: string;
  origin?: string;
  destination?: string;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  status?: string;
}
