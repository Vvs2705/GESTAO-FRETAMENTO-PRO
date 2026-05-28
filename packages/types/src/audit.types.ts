/**
 * audit.types.ts
 * AuditLog interface and filters.
 * audit_logs is partitioned by created_at (monthly) in production.
 */

import type { TenantId, PaginationQuery } from './common.types';

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  tenantId: TenantId;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  /** Snapshot of the entity before the action (JSONB in DB). */
  before?: Record<string, unknown>;
  /** Snapshot of the entity after the action (JSONB in DB). */
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  /** Partition key — immutable once written. */
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface AuditLogListFilters extends PaginationQuery {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: Date;
  to?: Date;
}
