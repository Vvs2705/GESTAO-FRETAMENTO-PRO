import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClientDto, CreateContractDto } from './dto/create-client.dto';
import type { UpdateClientDto, UpdateContractDto } from './dto/update-client.dto';
import type { ClientFiltersDto } from './dto/client-filters.dto';
import {
  toClientDto,
  toContractDto,
  type ClientResponseDto,
  type ContractResponseDto,
  type ClientStatsDto,
} from './dto/client-response.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: ClientFiltersDto,
  ): Promise<CursorPage<ClientResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const clients = await this.prisma.client.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { document: { contains: filters.search, mode: 'insensitive' } },
                {
                  contactEmail: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = clients.length > limit;
    const data = hasMore ? clients.slice(0, limit) : clients;

    return {
      data: data.map(toClientDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { contracts: { where: { deletedAt: null } } },
    });

    if (!client) {
      throw new NotFoundException({
        error: 'CLIENT_NOT_FOUND',
        message: 'Cliente não encontrado',
      });
    }

    return toClientDto(client);
  }

  async create(
    tenantId: string,
    dto: CreateClientDto,
    actorId: string,
  ): Promise<ClientResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          tenantId,
          name: dto.name,
          document: dto.document ?? null,
          contactName: dto.contactName ?? null,
          contactEmail: dto.contactEmail ?? null,
          contactPhone: dto.contactPhone ?? null,
          address: dto.address ?? null,
          notes: dto.notes ?? null,
          status: 'ACTIVE',
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: client.id,
          eventType: 'ClientCreated',
          payload: {
            clientId: client.id,
            tenantId,
            name: client.name,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toClientDto(client);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateClientDto,
    actorId: string,
  ): Promise<ClientResponseDto> {
    await this.findById(id, tenantId);

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.document !== undefined ? { document: dto.document } : {}),
        ...(dto.contactName !== undefined
          ? { contactName: dto.contactName }
          : {}),
        ...(dto.contactEmail !== undefined
          ? { contactEmail: dto.contactEmail }
          : {}),
        ...(dto.contactPhone !== undefined
          ? { contactPhone: dto.contactPhone }
          : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
      include: { contracts: { where: { deletedAt: null } } },
    });

    return toClientDto(client);
  }

  async softDelete(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<void> {
    await this.findById(id, tenantId);

    // Cannot delete client with active trips
    const activeTrip = await this.prisma.trip.findFirst({
      where: {
        clientId: id,
        tenantId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'DELAYED'] },
        deletedAt: null,
      },
    });

    if (activeTrip) {
      throw new BadRequestException({
        error: 'CLIENT_HAS_ACTIVE_TRIPS',
        message: 'Não é possível excluir um cliente com viagens ativas',
        details: { tripId: activeTrip.id },
      });
    }

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  async createContract(
    clientId: string,
    tenantId: string,
    dto: CreateContractDto,
    actorId: string,
  ): Promise<ContractResponseDto> {
    await this.findById(clientId, tenantId);

    const contract = await this.prisma.contract.create({
      data: {
        tenantId,
        clientId,
        number: dto.number ?? null,
        description: dto.description ?? null,
        value: dto.value ?? null,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
        notes: dto.notes ?? null,
        status: 'ACTIVE',
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    return toContractDto(contract);
  }

  async updateContract(
    contractId: string,
    clientId: string,
    tenantId: string,
    dto: UpdateContractDto,
    actorId: string,
  ): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, clientId, tenantId, deletedAt: null },
    });

    if (!contract) {
      throw new NotFoundException({
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contrato não encontrado',
      });
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        ...(dto.number !== undefined ? { number: dto.number } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
    });

    return toContractDto(updated);
  }

  async getStats(
    clientId: string,
    tenantId: string,
  ): Promise<ClientStatsDto> {
    await this.findById(clientId, tenantId);

    const [totalTrips, tripsCompleted, activeContracts, revenueResult] =
      await Promise.all([
        this.prisma.trip.count({
          where: { clientId, tenantId, deletedAt: null },
        }),
        this.prisma.trip.count({
          where: { clientId, tenantId, status: 'COMPLETED', deletedAt: null },
        }),
        this.prisma.contract.count({
          where: { clientId, tenantId, status: 'ACTIVE', deletedAt: null },
        }),
        this.prisma.contract.aggregate({
          where: { clientId, tenantId, deletedAt: null },
          _sum: { value: true },
        }),
      ]);

    return {
      clientId,
      totalTrips,
      tripsCompleted,
      totalRevenue: revenueResult._sum.value
        ? Number(revenueResult._sum.value)
        : 0,
      activeContracts,
    };
  }
}
