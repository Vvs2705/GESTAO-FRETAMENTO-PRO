/**
 * events.types.ts
 * Domain event interfaces for the Outbox pattern.
 * Each event type extends DomainEventBase with a literal `type` and typed `payload`.
 */

import type { TenantId, UserId, OccurrenceSeverity } from './common.types';

// ---------------------------------------------------------------------------
// Base event
// ---------------------------------------------------------------------------

export interface DomainEventBase {
  eventId: string;
  tenantId: TenantId;
  type: string;
  actorUserId?: UserId;
  entityType: string;
  entityId: string;
  occurredAt: Date;
  correlationId?: string;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Trip events
// ---------------------------------------------------------------------------

export interface TripCreatedEvent extends DomainEventBase {
  type: 'TripCreated';
  entityType: 'trip';
  payload: {
    clientId?: string;
    vehicleId?: string;
    driverId?: string;
    routeId?: string;
    scheduledStartAt: string;
  };
}

export interface TripConfirmedEvent extends DomainEventBase {
  type: 'TripConfirmed';
  entityType: 'trip';
  payload: {
    vehicleId: string;
    driverId: string;
  };
}

export interface TripStartedEvent extends DomainEventBase {
  type: 'TripStarted';
  entityType: 'trip';
  payload: {
    actualStartAt: string;
    vehicleId: string;
    driverId: string;
  };
}

export interface TripDelayedEvent extends DomainEventBase {
  type: 'TripDelayed';
  entityType: 'trip';
  payload: {
    reason?: string;
    delayedAt: string;
  };
}

export interface TripCompletedEvent extends DomainEventBase {
  type: 'TripCompleted';
  entityType: 'trip';
  payload: {
    actualEndAt: string;
    vehicleId: string;
    driverId: string;
  };
}

export interface TripCanceledEvent extends DomainEventBase {
  type: 'TripCanceled';
  entityType: 'trip';
  payload: {
    reason?: string;
    canceledAt: string;
  };
}

// ---------------------------------------------------------------------------
// Occurrence events
// ---------------------------------------------------------------------------

export interface OccurrenceCreatedEvent extends DomainEventBase {
  type: 'OccurrenceCreated';
  entityType: 'occurrence';
  payload: {
    severity: OccurrenceSeverity;
    type: string;
    tripId?: string;
    vehicleId?: string;
    driverId?: string;
  };
}

export interface OccurrenceEscalatedEvent extends DomainEventBase {
  type: 'OccurrenceEscalated';
  entityType: 'occurrence';
  payload: {
    previousStatus: string;
    newStatus: string;
    severity: OccurrenceSeverity;
  };
}

export interface OccurrenceResolvedEvent extends DomainEventBase {
  type: 'OccurrenceResolved';
  entityType: 'occurrence';
  payload: {
    resolvedAt: string;
    actionTaken?: string;
    responsibleUserId?: string;
  };
}

// ---------------------------------------------------------------------------
// Vehicle events
// ---------------------------------------------------------------------------

export interface VehicleStatusChangedEvent extends DomainEventBase {
  type: 'VehicleStatusChanged';
  entityType: 'vehicle';
  payload: {
    previousStatus: string;
    newStatus: string;
    reason?: string;
  };
}

export interface VehicleDocumentExpiringEvent extends DomainEventBase {
  type: 'VehicleDocumentExpiring';
  entityType: 'vehicle';
  payload: {
    documentId: string;
    documentType: string;
    expiresAt: string;
    daysUntilExpiry: number;
  };
}

// ---------------------------------------------------------------------------
// Fuel events
// ---------------------------------------------------------------------------

export interface FuelRecordCreatedEvent extends DomainEventBase {
  type: 'FuelRecordCreated';
  entityType: 'fuel_record';
  payload: {
    vehicleId: string;
    driverId?: string;
    liters: number;
    odometer: number;
    suppliedAt: string;
  };
}

export interface FuelAnomalyDetectedEvent extends DomainEventBase {
  type: 'FuelAnomalyDetected';
  entityType: 'fuel_record';
  payload: {
    vehicleId: string;
    vehiclePlate: string;
    actualKmPerLiter: number;
    historicalAvgKmPerLiter: number;
    deviationPercent: number;
  };
}

// ---------------------------------------------------------------------------
// Maintenance events
// ---------------------------------------------------------------------------

export interface MaintenanceOrderCreatedEvent extends DomainEventBase {
  type: 'MaintenanceOrderCreated';
  entityType: 'maintenance_order';
  payload: {
    vehicleId: string;
    type: string;
    expectedStartAt?: string;
  };
}

export interface MaintenanceOrderCompletedEvent extends DomainEventBase {
  type: 'MaintenanceOrderCompleted';
  entityType: 'maintenance_order';
  payload: {
    vehicleId: string;
    actualEndAt: string;
    totalCost?: number;
  };
}

// ---------------------------------------------------------------------------
// Document events
// ---------------------------------------------------------------------------

export interface DocumentExpiringSoonEvent extends DomainEventBase {
  type: 'DocumentExpiringSoon';
  entityType: 'document';
  payload: {
    entityType: string;
    entityId: string;
    entityName: string;
    documentType: string;
    expiresAt: string;
    daysUntilExpiry: number;
  };
}

// ---------------------------------------------------------------------------
// User/auth events
// ---------------------------------------------------------------------------

export interface UserLoginEvent extends DomainEventBase {
  type: 'UserLogin';
  entityType: 'user';
  payload: {
    email: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface UserLoginFailedEvent extends DomainEventBase {
  type: 'UserLoginFailed';
  entityType: 'user';
  payload: {
    email: string;
    reason: string;
    ipAddress?: string;
    attemptCount?: number;
  };
}

export interface UserLogoutEvent extends DomainEventBase {
  type: 'UserLogout';
  entityType: 'user';
  payload: {
    sessionId?: string;
  };
}

// ---------------------------------------------------------------------------
// Union of all domain events
// ---------------------------------------------------------------------------

export type DomainEvent =
  | TripCreatedEvent
  | TripConfirmedEvent
  | TripStartedEvent
  | TripDelayedEvent
  | TripCompletedEvent
  | TripCanceledEvent
  | OccurrenceCreatedEvent
  | OccurrenceEscalatedEvent
  | OccurrenceResolvedEvent
  | VehicleStatusChangedEvent
  | VehicleDocumentExpiringEvent
  | FuelRecordCreatedEvent
  | FuelAnomalyDetectedEvent
  | MaintenanceOrderCreatedEvent
  | MaintenanceOrderCompletedEvent
  | DocumentExpiringSoonEvent
  | UserLoginEvent
  | UserLoginFailedEvent
  | UserLogoutEvent;
