import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateRouteDto, RoutePointDto } from './dto/create-route.dto';
import type { UpdateRouteDto } from './dto/update-route.dto';
import type { RouteFiltersDto } from './dto/route-filters.dto';
import {
  toRouteDto,
  type RouteResponseDto,
} from './dto/route-response.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: RouteFiltersDto,
  ): Promise<CursorPage<RouteResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const routes = await this.prisma.route.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.clientId ? { clientId: filters.clientId } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { origin: { contains: filters.search, mode: 'insensitive' } },
                {
                  destination: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      include: { routePoints: { orderBy: { sequence: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = routes.length > limit;
    const data = hasMore ? routes.slice(0, limit) : routes;

    return {
      data: data.map(toRouteDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<RouteResponseDto> {
    const route = await this.prisma.route.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { routePoints: { orderBy: { sequence: 'asc' } } },
    });

    if (!route) {
      throw new NotFoundException({
        error: 'ROUTE_NOT_FOUND',
        message: 'Rota não encontrada',
      });
    }

    return toRouteDto(route);
  }

  async create(
    tenantId: string,
    dto: CreateRouteDto,
    actorId: string,
  ): Promise<RouteResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          tenantId,
          clientId: dto.clientId ?? null,
          name: dto.name,
          origin: dto.origin,
          destination: dto.destination,
          estimatedDistanceKm: dto.estimatedDistanceKm ?? null,
          estimatedDurationMinutes: dto.estimatedDurationMinutes ?? null,
          notes: dto.notes ?? null,
          status: 'ACTIVE',
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      if (dto.routePoints && dto.routePoints.length > 0) {
        await tx.routePoint.createMany({
          data: dto.routePoints.map((point) => ({
            tenantId,
            routeId: route.id,
            sequence: point.sequence,
            name: point.name,
            address: point.address ?? null,
            latitude: point.latitude ?? null,
            longitude: point.longitude ?? null,
            plannedTime: point.plannedTime ?? null,
            type: point.type,
          })),
        });
      }

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: route.id,
          eventType: 'RouteCreated',
          payload: {
            routeId: route.id,
            tenantId,
            name: route.name,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      const created = await tx.route.findFirstOrThrow({
        where: { id: route.id },
        include: { routePoints: { orderBy: { sequence: 'asc' } } },
      });

      return toRouteDto(created);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateRouteDto,
    actorId: string,
  ): Promise<RouteResponseDto> {
    await this.findById(id, tenantId);

    const route = await this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.clientId !== undefined ? { clientId: dto.clientId } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.origin !== undefined ? { origin: dto.origin } : {}),
        ...(dto.destination !== undefined
          ? { destination: dto.destination }
          : {}),
        ...(dto.estimatedDistanceKm !== undefined
          ? { estimatedDistanceKm: dto.estimatedDistanceKm }
          : {}),
        ...(dto.estimatedDurationMinutes !== undefined
          ? { estimatedDurationMinutes: dto.estimatedDurationMinutes }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
      include: { routePoints: { orderBy: { sequence: 'asc' } } },
    });

    return toRouteDto(route);
  }

  async updatePoints(
    routeId: string,
    tenantId: string,
    points: RoutePointDto[],
    actorId: string,
  ): Promise<RouteResponseDto> {
    await this.findById(routeId, tenantId);

    return this.prisma.$transaction(async (tx) => {
      // Delete all existing points
      await tx.routePoint.deleteMany({ where: { routeId } });

      // Create new points
      if (points.length > 0) {
        await tx.routePoint.createMany({
          data: points.map((point) => ({
            tenantId,
            routeId,
            sequence: point.sequence,
            name: point.name,
            address: point.address ?? null,
            latitude: point.latitude ?? null,
            longitude: point.longitude ?? null,
            plannedTime: point.plannedTime ?? null,
            type: point.type,
          })),
        });
      }

      await tx.route.update({
        where: { id: routeId },
        data: { updatedBy: actorId },
      });

      const updated = await tx.route.findFirstOrThrow({
        where: { id: routeId },
        include: { routePoints: { orderBy: { sequence: 'asc' } } },
      });

      return toRouteDto(updated);
    });
  }

  async softDelete(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<void> {
    await this.findById(id, tenantId);

    // Cannot delete route if there are active trips using it
    const activeTrip = await this.prisma.trip.findFirst({
      where: {
        routeId: id,
        tenantId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    });

    if (activeTrip) {
      throw new BadRequestException({
        error: 'ROUTE_IN_USE',
        message:
          'Não é possível excluir uma rota com viagens confirmadas ou em andamento',
        details: { tripId: activeTrip.id, tripStatus: activeTrip.status },
      });
    }

    await this.prisma.route.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
}
