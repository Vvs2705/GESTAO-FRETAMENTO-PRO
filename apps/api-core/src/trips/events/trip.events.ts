export interface TripCreatedPayload {
  tripId: string;
  tenantId: string;
  vehicleId: string | null;
  driverId: string | null;
  scheduledStartAt: Date;
  actorUserId: string;
  occurredAt: Date;
}

export interface TripConfirmedPayload {
  tripId: string;
  tenantId: string;
  vehicleId: string | null;
  driverId: string | null;
  actorUserId: string;
  occurredAt: Date;
}

export interface TripStartedPayload {
  tripId: string;
  tenantId: string;
  actualStartAt: Date;
  actorUserId: string;
  occurredAt: Date;
}

export interface TripCompletedPayload {
  tripId: string;
  tenantId: string;
  actualEndAt: Date;
  actorUserId: string;
  occurredAt: Date;
}

export interface TripCanceledPayload {
  tripId: string;
  tenantId: string;
  cancelReason: string;
  actorUserId: string;
  occurredAt: Date;
}

export interface TripDelayedPayload {
  tripId: string;
  tenantId: string;
  actorUserId: string;
  occurredAt: Date;
}
