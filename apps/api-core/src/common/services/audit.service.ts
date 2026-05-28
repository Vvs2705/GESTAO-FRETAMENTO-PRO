import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogEntry {
  tenantId: string;
  actorUserId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  traceId?: string;
}

/**
 * AuditService — writes immutable audit log entries to the database.
 * Failures are logged but never propagated — a failed audit write must
 * not fail the business operation that triggered it.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          actorUserId: entry.actorUserId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          before: entry.before as never,
          after: entry.after as never,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          traceId: entry.traceId,
        },
      });
    } catch (err) {
      // Audit failures must never block business operations
      this.logger.error({ err, entry }, 'Failed to write audit log');
    }
  }
}
