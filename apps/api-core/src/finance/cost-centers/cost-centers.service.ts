import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateCostCenterDto, UpdateCostCenterDto, CostCenterResponseDto } from './dto/cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string): Promise<CostCenterResponseDto[]> {
    const list = await this.prisma.costCenter.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { code: 'asc' },
    });
    return list.map((c) => this.toDto(c as unknown as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<CostCenterResponseDto> {
    const c = await this.prisma.costCenter.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!c) throw new NotFoundException({ error: 'COST_CENTER_NOT_FOUND', message: 'Centro de custo não encontrado' });
    return this.toDto(c as unknown as Record<string, unknown>);
  }

  async create(tenantId: string, dto: CreateCostCenterDto, actorId: string): Promise<CostCenterResponseDto> {
    const exists = await this.prisma.costCenter.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null },
    });
    if (exists) throw new ConflictException({ error: 'COST_CENTER_CODE_EXISTS', message: 'Centro de custo com este código já cadastrado' });

    const c = await this.prisma.costCenter.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        active: dto.active ?? true,
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'finance.costcenter.created',
      entityType: 'CostCenter',
      entityId: c.id,
      after: c,
    });

    return this.toDto(c as unknown as Record<string, unknown>);
  }

  async update(id: string, tenantId: string, dto: UpdateCostCenterDto, actorId: string): Promise<CostCenterResponseDto> {
    const existing = await this.findById(id, tenantId);

    const c = await this.prisma.costCenter.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description: dto.description !== undefined ? dto.description : (existing.description ?? null),
        active: dto.active !== undefined ? dto.active : existing.active,
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'finance.costcenter.updated',
      entityType: 'CostCenter',
      entityId: id,
      before: existing,
      after: c,
    });

    return this.toDto(c as unknown as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.findById(id, tenantId);

    await this.prisma.costCenter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'finance.costcenter.deleted',
      entityType: 'CostCenter',
      entityId: id,
      before: existing,
    });
  }

  private toDto(c: Record<string, unknown>): CostCenterResponseDto {
    return {
      id: c['id'] as string,
      tenantId: c['tenantId'] as string,
      code: c['code'] as string,
      name: c['name'] as string,
      description: c['description'] as string | null,
      active: c['active'] as boolean,
      createdAt: c['createdAt'] as Date,
      updatedAt: c['updatedAt'] as Date,
    };
  }
}
