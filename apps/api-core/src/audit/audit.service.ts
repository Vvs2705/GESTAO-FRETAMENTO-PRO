import { Injectable, NotFoundException } from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditFiltersDto } from './dto/audit-filters.dto';

export interface AuditLogDto {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  traceId: string | null;
  createdAt: Date;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function toAuditLogDto(log: {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  traceId: string | null;
  createdAt: Date;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}): AuditLogDto {
  return {
    id: log.id,
    tenantId: log.tenantId,
    actorUserId: log.actorUserId,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    before: log.before,
    after: log.after,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    traceId: log.traceId,
    createdAt: log.createdAt,
    actor: log.actor ?? null,
  };
}

@Injectable()
export class AuditQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: AuditFiltersDto,
  ): Promise<CursorPage<AuditLogDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    // Cursor-based pagination on createdAt DESC (cursor is the id of the last item)
    let cursorCondition: { createdAt: { lt: Date } } | undefined;
    if (filters.cursor) {
      const cursorRecord = await this.prisma.auditLog.findFirst({
        where: { id: filters.cursor, tenantId },
        select: { createdAt: true },
      });
      if (cursorRecord) {
        cursorCondition = { createdAt: { lt: cursorRecord.createdAt } };
      }
    }

    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId, // NEVER allow cross-tenant access
        ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
        ...(filters.action ? { action: { contains: filters.action, mode: 'insensitive' } } : {}),
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
        ...(filters.from || filters.to
          ? {
              createdAt: {
                ...(filters.from ? { gte: filters.from } : {}),
                ...(filters.to ? { lte: filters.to } : {}),
              },
            }
          : {}),
        ...(cursorCondition ?? {}),
      },
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = logs.length > limit;
    const data = hasMore ? logs.slice(0, limit) : logs;

    return {
      data: data.map(toAuditLogDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<AuditLogDto> {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, tenantId }, // strict tenant check
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!log) {
      throw new NotFoundException({
        error: 'AUDIT_LOG_NOT_FOUND',
        message: 'Registro de auditoria não encontrado',
      });
    }

    return toAuditLogDto(log);
  }
}
