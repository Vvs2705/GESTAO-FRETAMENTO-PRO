/**
 * role.types.ts
 * Role and Permission interfaces for RBAC.
 */

import type { TenantId } from './common.types';

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------

export interface Role {
  id: string;
  tenantId: TenantId;
  name: string;
  department?: string;
  hierarchyLevel: number;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: string;
  department?: string;
  hierarchyLevel: number;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  department?: string;
  hierarchyLevel?: number;
  description?: string;
}

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

export interface Permission {
  id: string;
  key: string;
  module: string;
  action: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// RolePermission
// ---------------------------------------------------------------------------

export interface RolePermission {
  id: string;
  tenantId: TenantId;
  roleId: string;
  permissionId: string;
  scope?: string;
}

export interface AssignPermissionDto {
  permissionId: string;
  scope?: string;
}
