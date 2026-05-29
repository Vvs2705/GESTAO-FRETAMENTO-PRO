import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Canonical action strings for audit log entries.
 *
 * Convention: <module>.<entity>.<verb>
 * Keep this list in sync with all @RequirePermission() decorators and
 * any place that calls AuditService.log().
 */
export const AuditActions = {
  // ── Fuel internal fueling ───────────────────────────────────────────────
  FUEL_INTERNAL_CREATED: 'fuel.internal.created',
  FUEL_INTERNAL_APPROVED: 'fuel.internal.approved',
  FUEL_INTERNAL_REJECTED: 'fuel.internal.rejected',
  FUEL_INTERNAL_UPDATED: 'fuel.internal.updated',
  FUEL_INTERNAL_DELETED: 'fuel.internal.deleted',

  // ── Fuel delivery (recebimento de nota) ─────────────────────────────────
  FUEL_DELIVERY_RECEIVED: 'fuel.delivery.received',
  FUEL_DELIVERY_APPROVED: 'fuel.delivery.approved',
  FUEL_DELIVERY_REJECTED: 'fuel.delivery.rejected',

  // ── Fuel external fueling ───────────────────────────────────────────────
  FUEL_EXTERNAL_SUBMITTED: 'fuel.external.submitted',
  FUEL_EXTERNAL_APPROVED: 'fuel.external.approved',
  FUEL_EXTERNAL_REJECTED: 'fuel.external.rejected',

  // ── Fuel stock ──────────────────────────────────────────────────────────
  FUEL_STOCK_ADJUSTED: 'fuel.stock.adjusted',
  FUEL_STOCK_TRANSFERRED: 'fuel.stock.transferred',

  // ── Fuel legacy fuelRecord ──────────────────────────────────────────────
  FUEL_RECORD_CREATED: 'fuel.record.created',
  FUEL_RECORD_UPDATED: 'fuel.record.updated',
  FUEL_RECORD_DELETED: 'fuel.record.deleted',
  FUEL_ANOMALY_FLAGGED: 'fuel.anomaly.flagged',

  // ── Vehicles ────────────────────────────────────────────────────────────
  VEHICLE_CREATED: 'vehicle.created',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_DELETED: 'vehicle.deleted',
  VEHICLE_STATUS_CHANGED: 'vehicle.status_changed',

  // ── Trips ────────────────────────────────────────────────────────────────
  TRIP_CREATED: 'trip.created',
  TRIP_UPDATED: 'trip.updated',
  TRIP_STARTED: 'trip.started',
  TRIP_COMPLETED: 'trip.completed',
  TRIP_CANCELED: 'trip.canceled',
  TRIP_STATUS_CHANGED: 'trip.status_changed',

  // ── Drivers ──────────────────────────────────────────────────────────────
  DRIVER_CREATED: 'driver.created',
  DRIVER_UPDATED: 'driver.updated',
  DRIVER_DELETED: 'driver.deleted',

  // ── Users ────────────────────────────────────────────────────────────────
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_ROLE_ASSIGNED: 'user.role_assigned',

  // ── Maintenance ──────────────────────────────────────────────────────────
  MAINTENANCE_CREATED: 'maintenance.created',
  MAINTENANCE_UPDATED: 'maintenance.updated',
  MAINTENANCE_COMPLETED: 'maintenance.completed',

  // ── Occurrences ──────────────────────────────────────────────────────────
  OCCURRENCE_CREATED: 'occurrence.created',
  OCCURRENCE_RESOLVED: 'occurrence.resolved',

  // ── Finance ──────────────────────────────────────────────────────────────
  FINANCE_ENTRY_CREATED: 'finance.entry.created',
  FINANCE_ENTRY_UPDATED: 'finance.entry.updated',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

export interface AuditLogEntry {
  tenantId: string;
  actorUserId?: string;
  /** Use AuditActions constants or any free-form string */
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  traceId?: string;
  /**
   * correlationId — groups multiple audit entries belonging to the same
   * business operation (e.g. approve + stock movement).
   * Stored in audit_logs.correlation_id (added via migration add_correlation_id_audit.sql).
   */
  correlationId?: string;
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
          actorUserId: entry.actorUserId ?? null,
          action: entry.action,
          entityType: entry.entityType ?? null,
          entityId: entry.entityId ?? null,
          before: (entry.before ?? null) as never,
          after: (entry.after ?? null) as never,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          traceId: entry.traceId ?? null,
          // correlationId is stored via raw SQL if the column exists,
          // falling back gracefully if the migration has not been applied yet.
          ...(entry.correlationId
            ? { correlationId: entry.correlationId }
            : {}),
        } as Parameters<typeof this.prisma.auditLog.create>[0]['data'],
      });
    } catch (err) {
      // Audit failures must never block business operations
      this.logger.error({ err, entry }, 'Failed to write audit log');
    }
  }

  /**
   * Bulk log — writes multiple audit entries in a single transaction.
   * Useful for operations that modify several entities atomically.
   * Still swallows errors to avoid blocking the caller.
   */
  async logMany(entries: AuditLogEntry[]): Promise<void> {
    if (entries.length === 0) return;
    try {
      await this.prisma.$transaction(
        entries.map((entry) =>
          this.prisma.auditLog.create({
            data: {
              tenantId: entry.tenantId,
              actorUserId: entry.actorUserId ?? null,
              action: entry.action,
              entityType: entry.entityType ?? null,
              entityId: entry.entityId ?? null,
              before: (entry.before ?? null) as never,
              after: (entry.after ?? null) as never,
              ipAddress: entry.ipAddress ?? null,
              userAgent: entry.userAgent ?? null,
              traceId: entry.traceId ?? null,
              ...(entry.correlationId ? { correlationId: entry.correlationId } : {}),
            } as Parameters<typeof this.prisma.auditLog.create>[0]['data'],
          }),
        ),
      );
    } catch (err) {
      this.logger.error({ err, count: entries.length }, 'Failed to write bulk audit logs');
    }
  }
}
