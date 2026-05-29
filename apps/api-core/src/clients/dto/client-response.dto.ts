import type { Client, Contract } from '@gestao-fretamento-pro/database';

export interface ContractResponseDto {
  id: string;
  number: string | null;
  description: string | null;
  value: number | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export interface ClientResponseDto {
  id: string;
  tenantId: string;
  name: string;
  document: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  contracts?: ContractResponseDto[];
}

export interface ClientStatsDto {
  clientId: string;
  totalTrips: number;
  tripsCompleted: number;
  totalRevenue: number;
  activeContracts: number;
}

type ClientWithContracts = Client & { contracts?: Contract[] };

export function toContractDto(contract: Contract): ContractResponseDto {
  return {
    id: contract.id,
    number: contract.number,
    description: contract.description,
    value: contract.value ? Number(contract.value) : null,
    startDate: contract.startDate,
    endDate: contract.endDate,
    status: contract.status,
    notes: contract.notes,
    createdAt: contract.createdAt,
  };
}

export function toClientDto(client: ClientWithContracts): ClientResponseDto {
  const dto: ClientResponseDto = {
    id: client.id,
    tenantId: client.tenantId,
    name: client.name,
    document: client.document,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    address: client.address,
    notes: client.notes,
    status: client.status,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };

  if (client.contracts) {
    dto.contracts = client.contracts.map(toContractDto);
  }

  return dto;
}
