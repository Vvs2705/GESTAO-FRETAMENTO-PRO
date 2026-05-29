import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DriversService } from '../drivers/drivers.service';
import type { CreateTripDto, AddPassengerDto, CancelTripDto } from './dto/create-trip.dto';
import type { UpdateTripDto } from './dto/update-trip.dto';
import type { TripFiltersDto } from './dto/trip-filters.dto';
import {
  toTripDto,
  toPassengerDto,
  type TripResponseDto,
  type TripPassengerResponseDto,
} from './dto/trip-response.dto';

type TripStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELED';

// State machine: defines allowed transitions
const ALLOWED_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  DRAFT: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELED'],
  IN_PROGRESS: ['COMPLETED', 'DELAYED', 'CANCELED'],
  DELAYED: ['IN_PROGRESS', 'COMPLETED'],
  COMPLETED: [],
  CANCELED: [],
};

const TRIP_INCLUDE = {
  vehicle: true,
  driver: { include: { employee: true } },
  route: true,
  client: true,
  tripPassengers: true,
} as const;

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
  ) {}

  private validateTransition(current: TripStatus, next: TripStatus): void {
    const allowed = ALLOWED_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        error: 'INVALID_STATUS_TRANSITION',
        message: `Não é possível mover de ${current} para ${next}`,
        details: { currentStatus: current, requestedStatus: next, allowed },
      });
    }
  }

  async findAll(
    tenantId: string,
    filters: TripFiltersDto,
  ): Promise<CursorPage<TripResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const trips = await this.prisma.trip.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters.driverId ? { driverId: filters.driverId } : {}),
        ...(filters.clientId ? { clientId: filters.clientId } : {}),
        ...(filters.routeId ? { routeId: filters.routeId } : {}),
        ...(filters.dateFrom || filters.dateTo
          ? {
              scheduledStartAt: {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {}),
              },
            }
          : {}),
      },
      include: TRIP_INCLUDE,
      orderBy: { scheduledStartAt: 'desc' },
      take,
    });

    const hasMore = trips.length > limit;
    const data = hasMore ? trips.slice(0, limit) : trips;

    return {
      data: data.map(toTripDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<TripResponseDto> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: TRIP_INCLUDE,
    });

    if (!trip) {
      throw new NotFoundException({
        error: 'TRIP_NOT_FOUND',
        message: 'Viagem não encontrada',
      });
    }

    return toTripDto(trip);
  }

  async findToday(tenantId: string): Promise<TripResponseDto[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const trips = await this.prisma.trip.findMany({
      where: {
        tenantId,
        deletedAt: null,
        scheduledStartAt: { gte: startOfDay, lte: endOfDay },
      },
      include: TRIP_INCLUDE,
      orderBy: { scheduledStartAt: 'asc' },
    });

    return trips.map(toTripDto);
  }

  async findDelayed(tenantId: string): Promise<TripResponseDto[]> {
    const now = new Date();

    const trips = await this.prisma.trip.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          { status: 'DELAYED' },
          {
            status: 'IN_PROGRESS',
            scheduledEndAt: { lt: now },
          },
        ],
      },
      include: TRIP_INCLUDE,
      orderBy: { scheduledStartAt: 'asc' },
    });

    return trips.map(toTripDto);
  }

  async create(
    tenantId: string,
    dto: CreateTripDto,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          tenantId,
          clientId: dto.clientId ?? null,
          routeId: dto.routeId ?? null,
          vehicleId: dto.vehicleId ?? null,
          driverId: dto.driverId ?? null,
          scheduledStartAt: dto.scheduledStartAt,
          scheduledEndAt: dto.scheduledEndAt ?? null,
          passengerCount: dto.passengerCount ?? null,
          notes: dto.notes ?? null,
          status: 'DRAFT',
          version: 0,
          createdBy: actorId,
          updatedBy: actorId,
        },
        include: TRIP_INCLUDE,
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: trip.id,
          eventType: 'TripCreated',
          payload: {
            tripId: trip.id,
            tenantId,
            vehicleId: trip.vehicleId,
            driverId: trip.driverId,
            scheduledStartAt: trip.scheduledStartAt,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toTripDto(trip);
    });
  }

  async confirm(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, tenantId, deletedAt: null },
      });

      if (!trip) {
        throw new NotFoundException({
          error: 'TRIP_NOT_FOUND',
          message: 'Viagem não encontrada',
        });
      }

      this.validateTransition(trip.status as TripStatus, 'CONFIRMED');

      // Validate vehicle availability if assigned
      if (trip.vehicleId) {
        const vehicleAvail = await this.vehiclesService.checkAvailability(
          trip.vehicleId,
          tenantId,
        );
        if (!vehicleAvail.available) {
          throw new BadRequestException({
            error: 'VEHICLE_UNAVAILABLE',
            message: 'Veículo não está disponível para alocação',
            details: { vehicleId: trip.vehicleId, reason: vehicleAvail.reason },
          });
        }
      }

      // Validate driver availability if assigned
      if (trip.driverId) {
        const driverAvail = await this.driversService.checkAvailability(
          trip.driverId,
          tenantId,
        );
        if (!driverAvail.available) {
          throw new BadRequestException({
            error: 'DRIVER_UNAVAILABLE',
            message: 'Motorista não está disponível para alocação',
            details: { driverId: trip.driverId, reason: driverAvail.reason },
          });
        }
      }

      // Optimistic locking: use updateMany with version check
      const updated = await tx.trip.updateMany({
        where: { id, tenantId, version: trip.version },
        data: {
          status: 'CONFIRMED',
          version: { increment: 1 },
          updatedBy: actorId,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException({
          error: 'CONCURRENT_MODIFICATION',
          message: 'A viagem foi modificada por outro processo. Tente novamente.',
        });
      }

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'TripConfirmed',
          payload: {
            tripId: id,
            tenantId,
            vehicleId: trip.vehicleId,
            driverId: trip.driverId,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const result = await tx.trip.findFirstOrThrow({
        where: { id, tenantId },
        include: TRIP_INCLUDE,
      });

      return toTripDto(result);
    });
  }

  async start(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, tenantId, deletedAt: null },
      });

      if (!trip) {
        throw new NotFoundException({
          error: 'TRIP_NOT_FOUND',
          message: 'Viagem não encontrada',
        });
      }

      this.validateTransition(trip.status as TripStatus, 'IN_PROGRESS');

      const actualStartAt = new Date();

      await tx.trip.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          actualStartAt,
          version: { increment: 1 },
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'TripStarted',
          payload: {
            tripId: id,
            tenantId,
            actualStartAt,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const result = await tx.trip.findFirstOrThrow({
        where: { id, tenantId },
        include: TRIP_INCLUDE,
      });

      return toTripDto(result);
    });
  }

  async complete(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, tenantId, deletedAt: null },
      });

      if (!trip) {
        throw new NotFoundException({
          error: 'TRIP_NOT_FOUND',
          message: 'Viagem não encontrada',
        });
      }

      this.validateTransition(trip.status as TripStatus, 'COMPLETED');

      const actualEndAt = new Date();

      await tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualEndAt,
          version: { increment: 1 },
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'TripCompleted',
          payload: {
            tripId: id,
            tenantId,
            actualEndAt,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const result = await tx.trip.findFirstOrThrow({
        where: { id, tenantId },
        include: TRIP_INCLUDE,
      });

      return toTripDto(result);
    });
  }

  async cancel(
    id: string,
    tenantId: string,
    dto: CancelTripDto,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, tenantId, deletedAt: null },
      });

      if (!trip) {
        throw new NotFoundException({
          error: 'TRIP_NOT_FOUND',
          message: 'Viagem não encontrada',
        });
      }

      this.validateTransition(trip.status as TripStatus, 'CANCELED');

      await tx.trip.update({
        where: { id },
        data: {
          status: 'CANCELED',
          cancelReason: dto.reason,
          version: { increment: 1 },
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'TripCanceled',
          payload: {
            tripId: id,
            tenantId,
            cancelReason: dto.reason,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const result = await tx.trip.findFirstOrThrow({
        where: { id, tenantId },
        include: TRIP_INCLUDE,
      });

      return toTripDto(result);
    });
  }

  async markDelayed(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<TripResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, tenantId, deletedAt: null },
      });

      if (!trip) {
        throw new NotFoundException({
          error: 'TRIP_NOT_FOUND',
          message: 'Viagem não encontrada',
        });
      }

      this.validateTransition(trip.status as TripStatus, 'DELAYED');

      await tx.trip.update({
        where: { id },
        data: {
          status: 'DELAYED',
          version: { increment: 1 },
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'TripDelayed',
          payload: {
            tripId: id,
            tenantId,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const result = await tx.trip.findFirstOrThrow({
        where: { id, tenantId },
        include: TRIP_INCLUDE,
      });

      return toTripDto(result);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateTripDto,
    actorId: string,
  ): Promise<TripResponseDto> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException({
        error: 'TRIP_NOT_FOUND',
        message: 'Viagem não encontrada',
      });
    }

    if (trip.status !== 'DRAFT') {
      throw new BadRequestException({
        error: 'TRIP_NOT_EDITABLE',
        message: 'Apenas viagens em rascunho podem ser editadas',
        details: { currentStatus: trip.status },
      });
    }

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        ...(dto.clientId !== undefined ? { clientId: dto.clientId } : {}),
        ...(dto.routeId !== undefined ? { routeId: dto.routeId } : {}),
        ...(dto.vehicleId !== undefined ? { vehicleId: dto.vehicleId } : {}),
        ...(dto.driverId !== undefined ? { driverId: dto.driverId } : {}),
        ...(dto.scheduledStartAt !== undefined
          ? { scheduledStartAt: dto.scheduledStartAt }
          : {}),
        ...(dto.scheduledEndAt !== undefined
          ? { scheduledEndAt: dto.scheduledEndAt }
          : {}),
        ...(dto.passengerCount !== undefined
          ? { passengerCount: dto.passengerCount }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
      include: TRIP_INCLUDE,
    });

    return toTripDto(updated);
  }

  async addPassenger(
    tripId: string,
    tenantId: string,
    dto: AddPassengerDto,
    _actorId: string,
  ): Promise<TripPassengerResponseDto> {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, tenantId, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException({
        error: 'TRIP_NOT_FOUND',
        message: 'Viagem não encontrada',
      });
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELED') {
      throw new BadRequestException({
        error: 'TRIP_ALREADY_FINISHED',
        message: 'Não é possível adicionar passageiro em viagem finalizada ou cancelada',
      });
    }

    const passenger = await this.prisma.tripPassenger.create({
      data: {
        tenantId,
        tripId,
        name: dto.name,
        document: dto.document ?? null,
        phone: dto.phone ?? null,
        boardingPoint: dto.boardingPoint ?? null,
        status: 'CONFIRMED',
      },
    });

    return toPassengerDto(passenger);
  }

  async removePassenger(
    tripId: string,
    passengerId: string,
    tenantId: string,
    _actorId: string,
  ): Promise<void> {
    const passenger = await this.prisma.tripPassenger.findFirst({
      where: { id: passengerId, tripId, tenantId },
    });

    if (!passenger) {
      throw new NotFoundException({
        error: 'PASSENGER_NOT_FOUND',
        message: 'Passageiro não encontrado nesta viagem',
      });
    }

    await this.prisma.tripPassenger.delete({ where: { id: passengerId } });
  }

  async changeStatus(
    id: string,
    tenantId: string,
    status: TripStatus,
    actorId: string,
    reason?: string,
  ): Promise<TripResponseDto> {
    switch (status) {
      case 'CONFIRMED':
        return this.confirm(id, tenantId, actorId);
      case 'IN_PROGRESS':
        return this.start(id, tenantId, actorId);
      case 'COMPLETED':
        return this.complete(id, tenantId, actorId);
      case 'CANCELED':
        return this.cancel(id, tenantId, { reason: reason ?? 'Cancelado pelo operador' }, actorId);
      case 'DELAYED':
        return this.markDelayed(id, tenantId, actorId);
      default:
        throw new BadRequestException({
          error: 'INVALID_STATUS',
          message: `Status inválido: ${status}`,
        });
    }
  }
}
