/**
 * tenant.types.ts
 * Interfaces for Tenant and Branch entities — no Prisma internals exposed.
 */

import type { TenantId } from './common.types';

// ---------------------------------------------------------------------------
// Tenant settings (stored as JSONB in the database)
// ---------------------------------------------------------------------------

export interface TenantSettings {
  timezone?: string;
  currency?: string;
  locale?: string;
  logoUrl?: string;
  primaryColor?: string;
  fuelAnomalyThresholdPercent?: number;
  documentExpiryAlertDays?: number[];
  features?: Record<string, boolean>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

export interface Tenant {
  id: TenantId;
  name: string;
  tradeName?: string;
  document: string;
  plan: string;
  status: string;
  settings?: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTenantDto {
  name?: string;
  tradeName?: string;
  plan?: string;
  status?: string;
  settings?: TenantSettings;
}

// ---------------------------------------------------------------------------
// Branch
// ---------------------------------------------------------------------------

export interface Branch {
  id: string;
  tenantId: TenantId;
  name: string;
  city: string;
  state: string;
  address?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBranchDto {
  name: string;
  city: string;
  state: string;
  address?: string;
}

export interface UpdateBranchDto {
  name?: string;
  city?: string;
  state?: string;
  address?: string;
  status?: string;
}
