/**
 * tenant-context.ts
 * AsyncLocalStorage store for propagating tenant context through
 * async call chains without threading through every function parameter.
 *
 * Set by TenantIsolationInterceptor, consumed by PrismaService middleware
 * to automatically inject tenantId in all queries.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  tenantId: string;
  userId: string;
  traceId?: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContextStore>();
