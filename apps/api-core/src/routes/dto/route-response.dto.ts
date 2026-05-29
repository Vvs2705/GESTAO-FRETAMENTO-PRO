import type { Route, RoutePoint } from '@gestao-fretamento-pro/database';

export interface RoutePointResponseDto {
  id: string;
  sequence: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  plannedTime: string | null;
  type: string;
}

export interface RouteResponseDto {
  id: string;
  tenantId: string;
  clientId: string | null;
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  routePoints?: RoutePointResponseDto[];
}

type RouteWithPoints = Route & { routePoints?: RoutePoint[] };

export function toRoutePointDto(point: RoutePoint): RoutePointResponseDto {
  return {
    id: point.id,
    sequence: point.sequence,
    name: point.name,
    address: point.address,
    latitude: point.latitude ? Number(point.latitude) : null,
    longitude: point.longitude ? Number(point.longitude) : null,
    plannedTime: point.plannedTime,
    type: point.type,
  };
}

export function toRouteDto(route: RouteWithPoints): RouteResponseDto {
  const dto: RouteResponseDto = {
    id: route.id,
    tenantId: route.tenantId,
    clientId: route.clientId,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    estimatedDistanceKm: route.estimatedDistanceKm
      ? Number(route.estimatedDistanceKm)
      : null,
    estimatedDurationMinutes: route.estimatedDurationMinutes,
    status: route.status,
    notes: route.notes,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  };

  if (route.routePoints) {
    dto.routePoints = route.routePoints.map(toRoutePointDto);
  }

  return dto;
}
