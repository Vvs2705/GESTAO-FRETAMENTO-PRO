/**
 * client.types.ts
 * Client and Contract interfaces and DTOs.
 * All monetary values are `number` (NUMERIC(19,4) in DB).
 */

import type { TenantId, ClientId, ContractStatus } from './common.types';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export interface Client {
  id: ClientId;
  tenantId: TenantId;
  name: string;
  document?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateClientDto {
  name: string;
  document?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateClientDto {
  name?: string;
  document?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export interface Contract {
  id: string;
  tenantId: TenantId;
  clientId: ClientId;
  name: string;
  /** Contract value — NUMERIC(19,4) in DB, number here. */
  value?: number;
  startDate: Date;
  endDate?: Date;
  status: ContractStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ClientWithContracts extends Client {
  contracts: Contract[];
}

export interface CreateContractDto {
  name: string;
  value?: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface UpdateContractDto {
  name?: string;
  value?: number;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
  notes?: string;
}
