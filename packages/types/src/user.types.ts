/**
 * user.types.ts
 * User and Employee interfaces — password_hash is never exposed.
 */

import type { TenantId, UserId, EmployeeId, PaginationQuery } from './common.types';

// ---------------------------------------------------------------------------
// Authenticated user (derived from JWT payload)
// ---------------------------------------------------------------------------

export interface AuthenticatedUser {
  id: UserId;
  tenantId: TenantId;
  email: string;
  name: string;
  roleId?: string;
  permissions: string[];
}

// ---------------------------------------------------------------------------
// User (public representation — never includes password_hash)
// ---------------------------------------------------------------------------

export interface User {
  id: UserId;
  tenantId: TenantId;
  employeeId?: EmployeeId;
  name: string;
  email: string;
  phone?: string;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------

export interface Employee {
  id: EmployeeId;
  tenantId: TenantId;
  branchId?: string;
  roleId?: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  department?: string;
  admissionDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  employeeId?: string;
  roleId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  employeeId?: string;
  roleId?: string;
  status?: string;
}

export interface UserListFilters extends PaginationQuery {
  status?: string;
  search?: string;
}
