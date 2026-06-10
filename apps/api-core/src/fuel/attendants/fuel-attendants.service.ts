import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateFuelAttendantDto, UpdateFuelAttendantDto, FuelAttendantResponseDto } from './dto/fuel-attendant.dto';

@Injectable()
export class FuelAttendantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string): Promise<FuelAttendantResponseDto[]> {
    const list = await this.prisma.fuelAttendantProfile.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((a) => this.toDto(a as unknown as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<FuelAttendantResponseDto> {
    const a = await this.prisma.fuelAttendantProfile.findFirst({
      where: { id, tenantId },
    });
    if (!a) throw new NotFoundException({ error: 'FUEL_ATTENDANT_NOT_FOUND', message: 'Perfil de abastecedor não encontrado' });
    return this.toDto(a as unknown as Record<string, unknown>);
  }

  async findByUserId(userId: string, tenantId: string): Promise<FuelAttendantResponseDto> {
    const a = await this.prisma.fuelAttendantProfile.findFirst({
      where: { userId, tenantId },
    });
    if (!a) throw new NotFoundException({ error: 'FUEL_ATTENDANT_NOT_FOUND', message: 'Perfil de abastecedor não encontrado' });
    return this.toDto(a as unknown as Record<string, unknown>);
  }

  async create(tenantId: string, dto: CreateFuelAttendantDto, actorId: string): Promise<FuelAttendantResponseDto> {
    // Check if user exists in tenant
    const user = await this.prisma.user.findFirst({ where: { id: dto.userId, tenantId } });
    if (!user) throw new NotFoundException({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado neste tenant' });

    const exists = await this.prisma.fuelAttendantProfile.findUnique({
      where: { userId: dto.userId },
    });
    if (exists) throw new ConflictException({ error: 'ATTENDANT_PROFILE_EXISTS', message: 'Perfil de abastecedor já existe para este usuário' });

    const a = await this.prisma.fuelAttendantProfile.create({
      data: {
        tenantId,
        userId: dto.userId,
        employeeId: dto.employeeId ?? null,
        allowedBranchIds: (dto.allowedBranchIds ?? []) as never,
        allowedTankIds: (dto.allowedTankIds ?? []) as never,
        allowedPumpIds: (dto.allowedPumpIds ?? []) as never,
        shift: dto.shift ?? null,
        status: dto.status ?? 'ACTIVE',
        certificationExpiresAt: dto.certificationExpiresAt ? new Date(dto.certificationExpiresAt) : null,
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.attendant.created',
      entityType: 'FuelAttendantProfile',
      entityId: a.id,
      after: a,
    });

    return this.toDto(a as unknown as Record<string, unknown>);
  }

  async update(id: string, tenantId: string, dto: UpdateFuelAttendantDto, actorId: string): Promise<FuelAttendantResponseDto> {
    const existing = await this.findById(id, tenantId);

    const a = await this.prisma.fuelAttendantProfile.update({
      where: { id },
      data: {
        allowedBranchIds: dto.allowedBranchIds !== undefined ? (dto.allowedBranchIds as never) : (existing.allowedBranchIds as never),
        allowedTankIds: dto.allowedTankIds !== undefined ? (dto.allowedTankIds as never) : (existing.allowedTankIds as never),
        allowedPumpIds: dto.allowedPumpIds !== undefined ? (dto.allowedPumpIds as never) : (existing.allowedPumpIds as never),
        shift: dto.shift !== undefined ? dto.shift : (existing.shift ?? null),
        status: dto.status ?? existing.status,
        certificationExpiresAt: dto.certificationExpiresAt !== undefined
          ? (dto.certificationExpiresAt ? new Date(dto.certificationExpiresAt) : null)
          : (existing.certificationExpiresAt ?? null),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.attendant.updated',
      entityType: 'FuelAttendantProfile',
      entityId: id,
      before: existing,
      after: a,
    });

    return this.toDto(a as unknown as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.findById(id, tenantId);

    // FuelAttendantProfile does not have soft delete field in schema, so we do a hard delete
    await this.prisma.fuelAttendantProfile.delete({
      where: { id },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.attendant.deleted',
      entityType: 'FuelAttendantProfile',
      entityId: id,
      before: existing,
    });
  }

  private toDto(a: Record<string, unknown>): FuelAttendantResponseDto {
    const parseArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val as string[];
      if (typeof val === 'string') {
        try {
          return JSON.parse(val) as string[];
        } catch {
          return [];
        }
      }
      return [];
    };

    return {
      id: a['id'] as string,
      tenantId: a['tenantId'] as string,
      userId: a['userId'] as string,
      employeeId: a['employeeId'] as string | null,
      allowedBranchIds: parseArray(a['allowedBranchIds']),
      allowedTankIds: parseArray(a['allowedTankIds']),
      allowedPumpIds: parseArray(a['allowedPumpIds']),
      shift: a['shift'] as string | null,
      status: a['status'] as string,
      certificationExpiresAt: a['certificationExpiresAt'] as Date | null,
      createdAt: a['createdAt'] as Date,
      updatedAt: a['updatedAt'] as Date,
    };
  }
}
