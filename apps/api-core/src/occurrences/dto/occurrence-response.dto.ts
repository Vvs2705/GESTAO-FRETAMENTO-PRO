import type { Occurrence } from '@gestao-fretamento-pro/database';

export interface OccurrenceResponseDto {
  id: string;
  tenantId: string;
  tripId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  clientId: string | null;
  type: string;
  severity: string;
  description: string;
  status: string;
  responsibleUserId: string | null;
  actionTaken: string | null;
  resolvedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toOccurrenceDto(occurrence: Occurrence): OccurrenceResponseDto {
  return {
    id: occurrence.id,
    tenantId: occurrence.tenantId,
    tripId: occurrence.tripId,
    vehicleId: occurrence.vehicleId,
    driverId: occurrence.driverId,
    clientId: occurrence.clientId,
    type: occurrence.type,
    severity: occurrence.severity,
    description: occurrence.description,
    status: occurrence.status,
    responsibleUserId: occurrence.responsibleUserId,
    actionTaken: occurrence.actionTaken,
    resolvedAt: occurrence.resolvedAt,
    notes: occurrence.notes,
    createdAt: occurrence.createdAt,
    updatedAt: occurrence.updatedAt,
  };
}
