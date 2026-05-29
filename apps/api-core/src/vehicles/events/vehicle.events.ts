export interface VehicleCreatedPayload {
  vehicleId: string;
  tenantId: string;
  plate: string;
  type: string;
  actorUserId: string;
  occurredAt: Date;
}

export interface VehicleStatusChangedPayload {
  vehicleId: string;
  tenantId: string;
  previousStatus: string;
  newStatus: string;
  actorUserId: string;
  occurredAt: Date;
}
