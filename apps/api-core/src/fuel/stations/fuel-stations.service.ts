import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateFuelStationDto, UpdateFuelStationDto, FuelStationResponseDto } from './dto/fuel-station.dto';

@Injectable()
export class FuelStationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string): Promise<FuelStationResponseDto[]> {
    const list = await this.prisma.fuelStation.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return list.map((s) => this.toDto(s as unknown as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<FuelStationResponseDto> {
    const s = await this.prisma.fuelStation.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!s) throw new NotFoundException({ error: 'FUEL_STATION_NOT_FOUND', message: 'Posto de combustível não encontrado' });
    return this.toDto(s as unknown as Record<string, unknown>);
  }

  async create(tenantId: string, dto: CreateFuelStationDto, actorId: string): Promise<FuelStationResponseDto> {
    if (dto.cnpj) {
      const exists = await this.prisma.fuelStation.findFirst({
        where: { tenantId, cnpj: dto.cnpj, deletedAt: null },
      });
      if (exists) throw new ConflictException({ error: 'FUEL_STATION_CNPJ_EXISTS', message: 'Posto com este CNPJ já cadastrado' });
    }

    const s = await this.prisma.fuelStation.create({
      data: {
        tenantId,
        name: dto.name,
        cnpj: dto.cnpj ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        address: dto.address ?? null,
        status: dto.status ?? 'ACTIVE',
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.station.created',
      entityType: 'FuelStation',
      entityId: s.id,
      after: s,
    });

    return this.toDto(s as unknown as Record<string, unknown>);
  }

  async update(id: string, tenantId: string, dto: UpdateFuelStationDto, actorId: string): Promise<FuelStationResponseDto> {
    const existing = await this.findById(id, tenantId);

    if (dto.cnpj && dto.cnpj !== existing.cnpj) {
      const exists = await this.prisma.fuelStation.findFirst({
        where: { tenantId, cnpj: dto.cnpj, deletedAt: null },
      });
      if (exists) throw new ConflictException({ error: 'FUEL_STATION_CNPJ_EXISTS', message: 'Posto com este CNPJ já cadastrado' });
    }

    const s = await this.prisma.fuelStation.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        cnpj: dto.cnpj !== undefined ? dto.cnpj : (existing.cnpj ?? null),
        city: dto.city !== undefined ? dto.city : (existing.city ?? null),
        state: dto.state !== undefined ? dto.state : (existing.state ?? null),
        address: dto.address !== undefined ? dto.address : (existing.address ?? null),
        status: dto.status ?? existing.status,
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.station.updated',
      entityType: 'FuelStation',
      entityId: id,
      before: existing,
      after: s,
    });

    return this.toDto(s as unknown as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.findById(id, tenantId);

    await this.prisma.fuelStation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.station.deleted',
      entityType: 'FuelStation',
      entityId: id,
      before: existing,
    });
  }

  private toDto(s: Record<string, unknown>): FuelStationResponseDto {
    return {
      id: s['id'] as string,
      tenantId: s['tenantId'] as string,
      name: s['name'] as string,
      cnpj: s['cnpj'] as string | null,
      brand: s['brand'] as string | null,
      city: s['city'] as string | null,
      state: s['state'] as string | null,
      address: s['address'] as string | null,
      phone: s['phone'] as string | null,
      email: s['email'] as string | null,
      status: s['status'] as string,
      notes: s['notes'] as string | null,
      createdAt: s['createdAt'] as Date,
      updatedAt: s['updatedAt'] as Date,
    };
  }
}
