/**
 * common.types.ts
 * Branded types, pagination, API response shapes and shared status enums.
 * All monetary amounts are `number` here (converted from Prisma's Decimal at the service layer).
 * Persistence uses NUMERIC(19,4) — documented per field.
 */

// ---------------------------------------------------------------------------
// Branded ID types
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type TenantId = Brand<string, 'TenantId'>;
export type UserId = Brand<string, 'UserId'>;
export type EmployeeId = Brand<string, 'EmployeeId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type VehicleId = Brand<string, 'VehicleId'>;
export type DriverId = Brand<string, 'DriverId'>;
export type ClientId = Brand<string, 'ClientId'>;
export type RouteId = Brand<string, 'RouteId'>;
export type TripId = Brand<string, 'TripId'>;
export type OccurrenceId = Brand<string, 'OccurrenceId'>;
export type FuelRecordId = Brand<string, 'FuelRecordId'>;
export type MaintenanceOrderId = Brand<string, 'MaintenanceOrderId'>;
export type DocumentId = Brand<string, 'DocumentId'>;

// UUID validation regex (v4)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertUUID(s: string, label: string): void {
  if (!UUID_REGEX.test(s)) {
    throw new TypeError(`Invalid UUID for ${label}: "${s}"`);
  }
}

export function asTenantId(s: string): TenantId {
  assertUUID(s, 'TenantId');
  return s as TenantId;
}

export function asUserId(s: string): UserId {
  assertUUID(s, 'UserId');
  return s as UserId;
}

export function asEmployeeId(s: string): EmployeeId {
  assertUUID(s, 'EmployeeId');
  return s as EmployeeId;
}

export function asRoleId(s: string): RoleId {
  assertUUID(s, 'RoleId');
  return s as RoleId;
}

export function asVehicleId(s: string): VehicleId {
  assertUUID(s, 'VehicleId');
  return s as VehicleId;
}

export function asDriverId(s: string): DriverId {
  assertUUID(s, 'DriverId');
  return s as DriverId;
}

export function asClientId(s: string): ClientId {
  assertUUID(s, 'ClientId');
  return s as ClientId;
}

export function asRouteId(s: string): RouteId {
  assertUUID(s, 'RouteId');
  return s as RouteId;
}

export function asTripId(s: string): TripId {
  assertUUID(s, 'TripId');
  return s as TripId;
}

export function asOccurrenceId(s: string): OccurrenceId {
  assertUUID(s, 'OccurrenceId');
  return s as OccurrenceId;
}

export function asFuelRecordId(s: string): FuelRecordId {
  assertUUID(s, 'FuelRecordId');
  return s as FuelRecordId;
}

export function asMaintenanceOrderId(s: string): MaintenanceOrderId {
  assertUUID(s, 'MaintenanceOrderId');
  return s as MaintenanceOrderId;
}

export function asDocumentId(s: string): DocumentId {
  assertUUID(s, 'DocumentId');
  return s as DocumentId;
}

// ---------------------------------------------------------------------------
// API Response shapes
// ---------------------------------------------------------------------------

export interface ResponseMeta {
  requestId?: string;
  version?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    traceId?: string;
  };
  path?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationQuery {
  limit?: number;
  cursor?: string;
}

export interface CursorPage<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export type SortOrder = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Date range
// ---------------------------------------------------------------------------

export interface DateRange {
  from: Date;
  to: Date;
}

// ---------------------------------------------------------------------------
// Status union types
// ---------------------------------------------------------------------------

export type TripStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELED';

export type VehicleStatus =
  | 'AVAILABLE'
  | 'IN_MAINTENANCE'
  | 'UNAVAILABLE'
  | 'RETIRED';

export type DriverAvailabilityStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'ON_LEAVE'
  | 'SUSPENDED'
  | 'INACTIVE';

export type OccurrenceStatus =
  | 'OPEN'
  | 'IN_ANALYSIS'
  | 'RESOLVED'
  | 'CRITICAL';

export type OccurrenceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MaintenanceStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';

export type ContractStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELED'
  | 'SUSPENDED';
