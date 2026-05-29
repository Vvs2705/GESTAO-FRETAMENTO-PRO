export interface FuelRecordCreatedPayload {
  fuelRecordId: string;
  tenantId: string;
  vehicleId: string;
  driverId: string | null;
  liters: number;
  odometer: number;
  anomalyFlag: boolean;
  actorUserId: string;
  occurredAt: Date;
}

export interface FuelAnomalyDetectedPayload {
  fuelRecordId: string;
  tenantId: string;
  vehicleId: string;
  driverId: string | null;
  kmPerLiter: number;
  historicalAverage: number;
  anomalyReason: string;
  actorUserId: string;
  occurredAt: Date;
}
