import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOccurrenceDto, ResolveOccurrenceDto } from './dto/create-occurrence.dto';
import type { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import type { OccurrenceFiltersDto } from './dto/occurrence-filters.dto';
import {
  toOccurrenceDto,
  type OccurrenceResponseDto,
} from './dto/occurrence-response.dto';

type OccurrenceStatus = 'OPEN' | 'IN_ANALYSIS' | 'RESOLVED' | 'CRITICAL';

// State machine transitions
const ALLOWED_STATUS_TRANSITIONS: Record<OccurrenceStatus, OccurrenceStatus[]> = {
  OPEN: ['IN_ANALYSIS', 'CRITICAL', 'RESOLVED'],
  CRITICAL: ['IN_ANALYSIS', 'RESOLVED'],
  IN_ANALYSIS: ['RESOLVED'],
  RESOLVED: [], // terminal state
};

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTransition(
    current: OccurrenceStatus,
    next: OccurrenceStatus,
  ): void {
    const allowed = ALLOWED_STATUS_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        error: 'INVALID_STATUS_TRANSITION',
        message: `Não é possível mover ocorrência de ${current} para ${next}`,
        details: { currentStatus: current, requestedStatus: next, allowed },
      });
    }
  }

  async findAll(
    tenantId: string,
    filters: OccurrenceFiltersDto,
  ): Promise<CursorPage<OccurrenceResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const occurrences = await this.prisma.occurrence.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.tripId ? { tripId: filters.tripId } : {}),
        ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters.driverId ? { driverId: filters.driverId } : {}),
        ...(filters.clientId ? { clientId: filters.clientId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = occurrences.length > limit;
    const data = hasMore ? occurrences.slice(0, limit) : occurrences;

    return {
      data: data.map(toOccurrenceDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<OccurrenceResponseDto> {
    const occurrence = await this.prisma.occurrence.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!occurrence) {
      throw new NotFoundException({
        error: 'OCCURRENCE_NOT_FOUND',
        message: 'Ocorrência não encontrada',
      });
    }

    return toOccurrenceDto(occurrence);
  }

  async create(
    tenantId: string,
    dto: CreateOccurrenceDto,
    actorId: string,
  ): Promise<OccurrenceResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // CRITICAL severity goes directly to CRITICAL status
      const initialStatus = dto.severity === 'CRITICAL' ? 'CRITICAL' : 'OPEN';

      const occurrence = await tx.occurrence.create({
        data: {
          tenantId,
          tripId: dto.tripId ?? null,
          vehicleId: dto.vehicleId ?? null,
          driverId: dto.driverId ?? null,
          clientId: dto.clientId ?? null,
          type: dto.type,
          severity: dto.severity,
          description: dto.description,
          status: initialStatus,
          responsibleUserId: dto.responsibleUserId ?? null,
          notes: dto.notes ?? null,
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: occurrence.id,
          eventType: 'OccurrenceCreated',
          payload: {
            occurrenceId: occurrence.id,
            tenantId,
            type: occurrence.type,
            severity: occurrence.severity,
            tripId: occurrence.tripId,
            vehicleId: occurrence.vehicleId,
            driverId: occurrence.driverId,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      // Additional event if severity is CRITICAL
      if (dto.severity === 'CRITICAL') {
        await tx.outboxEvent.create({
          data: {
            tenantId,
            aggregateId: occurrence.id,
            eventType: 'OccurrenceEscalated',
            payload: {
              occurrenceId: occurrence.id,
              tenantId,
              severity: occurrence.severity,
              actorUserId: actorId,
              occurredAt: new Date(),
            },
          },
        });
      }

      return toOccurrenceDto(occurrence);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateOccurrenceDto,
    actorId: string,
  ): Promise<OccurrenceResponseDto> {
    await this.findById(id, tenantId);

    const occurrence = await this.prisma.occurrence.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.responsibleUserId !== undefined
          ? { responsibleUserId: dto.responsibleUserId }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
    });

    return toOccurrenceDto(occurrence);
  }

  async changeStatus(
    id: string,
    tenantId: string,
    newStatus: OccurrenceStatus,
    actorId: string,
    actionTaken?: string,
  ): Promise<OccurrenceResponseDto> {
    const occurrence = await this.prisma.occurrence.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!occurrence) {
      throw new NotFoundException({
        error: 'OCCURRENCE_NOT_FOUND',
        message: 'Ocorrência não encontrada',
      });
    }

    this.validateTransition(occurrence.status as OccurrenceStatus, newStatus);

    // RESOLVED requires actionTaken
    if (newStatus === 'RESOLVED' && !actionTaken) {
      throw new BadRequestException({
        error: 'ACTION_TAKEN_REQUIRED',
        message: 'É necessário informar a ação tomada para resolver a ocorrência',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const resolvedAt = newStatus === 'RESOLVED' ? new Date() : undefined;

      const updated = await tx.occurrence.update({
        where: { id },
        data: {
          status: newStatus,
          ...(resolvedAt ? { resolvedAt } : {}),
          ...(actionTaken ? { actionTaken } : {}),
          updatedBy: actorId,
        },
      });

      // Emit corresponding event
      const eventType =
        newStatus === 'RESOLVED'
          ? 'OccurrenceResolved'
          : newStatus === 'CRITICAL'
            ? 'OccurrenceEscalated'
            : 'OccurrenceStatusChanged';

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType,
          payload: {
            occurrenceId: id,
            tenantId,
            previousStatus: occurrence.status,
            newStatus,
            actionTaken: actionTaken ?? null,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toOccurrenceDto(updated);
    });
  }

  async resolve(
    id: string,
    tenantId: string,
    dto: ResolveOccurrenceDto,
    actorId: string,
  ): Promise<OccurrenceResponseDto> {
    return this.changeStatus(id, tenantId, 'RESOLVED', actorId, dto.actionTaken);
  }

  async escalate(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<OccurrenceResponseDto> {
    return this.changeStatus(id, tenantId, 'CRITICAL', actorId);
  }
}
