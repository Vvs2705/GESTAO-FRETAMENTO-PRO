import type {
  Trip,
  Vehicle,
  Driver,
  Route,
  Client,
  TripPassenger,
  Employee,
} from '@gestao-fretamento-pro/database';

export interface TripPassengerResponseDto {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  boardingPoint: string | null;
  status: string;
}

export interface TripResponseDto {
  id: string;
  tenantId: string;
  clientId: string | null;
  routeId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  scheduledStartAt: Date;
  scheduledEndAt: Date | null;
  actualStartAt: Date | null;
  actualEndAt: Date | null;
  status: string;
  passengerCount: number | null;
  notes: string | null;
  cancelReason: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: {
    id: string;
    plate: string;
    prefix: string | null;
    type: string;
  } | null;
  driver?: {
    id: string;
    licenseNumber: string;
    employee?: { id: string; name: string } | null;
  } | null;
  route?: {
    id: string;
    name: string;
    origin: string;
    destination: string;
  } | null;
  client?: { id: string; name: string } | null;
  tripPassengers?: TripPassengerResponseDto[];
}

type TripFull = Trip & {
  vehicle?: (Vehicle) | null;
  driver?: (Driver & { employee?: Employee | null }) | null;
  route?: Route | null;
  client?: Client | null;
  tripPassengers?: TripPassenger[];
};

export function toPassengerDto(p: TripPassenger): TripPassengerResponseDto {
  return {
    id: p.id,
    name: p.name,
    document: p.document,
    phone: p.phone,
    boardingPoint: p.boardingPoint,
    status: p.status,
  };
}

export function toTripDto(trip: TripFull): TripResponseDto {
  const dto: TripResponseDto = {
    id: trip.id,
    tenantId: trip.tenantId,
    clientId: trip.clientId,
    routeId: trip.routeId,
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    scheduledStartAt: trip.scheduledStartAt,
    scheduledEndAt: trip.scheduledEndAt,
    actualStartAt: trip.actualStartAt,
    actualEndAt: trip.actualEndAt,
    status: trip.status,
    passengerCount: trip.passengerCount,
    notes: trip.notes,
    cancelReason: trip.cancelReason,
    version: trip.version,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    vehicle: trip.vehicle
      ? {
          id: trip.vehicle.id,
          plate: trip.vehicle.plate,
          prefix: trip.vehicle.prefix,
          type: trip.vehicle.type,
        }
      : null,
    driver: trip.driver
      ? {
          id: trip.driver.id,
          licenseNumber: trip.driver.licenseNumber,
          employee: trip.driver.employee
            ? { id: trip.driver.employee.id, name: trip.driver.employee.name }
            : null,
        }
      : null,
    route: trip.route
      ? {
          id: trip.route.id,
          name: trip.route.name,
          origin: trip.route.origin,
          destination: trip.route.destination,
        }
      : null,
    client: trip.client ? { id: trip.client.id, name: trip.client.name } : null,
  };

  if (trip.tripPassengers) {
    dto.tripPassengers = trip.tripPassengers.map(toPassengerDto);
  }

  return dto;
}
