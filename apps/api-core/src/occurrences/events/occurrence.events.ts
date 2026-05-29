export interface OccurrenceCreatedPayload {
  occurrenceId: string;
  tenantId: string;
  type: string;
  severity: string;
  tripId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  actorUserId: string;
  occurredAt: Date;
}

export interface OccurrenceEscalatedPayload {
  occurrenceId: string;
  tenantId: string;
  severity: string;
  actorUserId: string;
  occurredAt: Date;
}

export interface OccurrenceResolvedPayload {
  occurrenceId: string;
  tenantId: string;
  actionTaken: string;
  actorUserId: string;
  occurredAt: Date;
}
