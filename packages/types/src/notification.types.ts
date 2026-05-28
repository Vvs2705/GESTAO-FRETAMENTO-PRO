/**
 * notification.types.ts
 * In-app notification interfaces and filters.
 */

import type { TenantId, PaginationQuery } from './common.types';

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  tenantId: TenantId;
  userId: string;
  type: string;
  title: string;
  body: string;
  /** Arbitrary metadata stored as JSONB. */
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface NotificationListFilters extends PaginationQuery {
  unreadOnly?: boolean;
}
