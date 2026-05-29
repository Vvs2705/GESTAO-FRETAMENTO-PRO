import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getCurrent(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      throw new NotFoundException({
        error: 'TENANT_NOT_FOUND',
        message: 'Empresa não encontrada.',
      });
    }
    return tenant;
  }

  async update(tenantId: string, dto: UpdateTenantDto, actorId: string) {
    const before = await this.getCurrent(tenantId);

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.tradeName !== undefined && { tradeName: dto.tradeName }),
        ...(dto.settings !== undefined && { settings: dto.settings as never }),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'tenant.update',
      entityType: 'Tenant',
      entityId: tenantId,
      before: { name: before.name, tradeName: before.tradeName },
      after: { name: updated.name, tradeName: updated.tradeName },
    });

    return updated;
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createBranch(tenantId: string, dto: CreateBranchDto, actorId: string) {
    const branch = await this.prisma.branch.create({
      data: {
        tenantId,
        name: dto.name,
        city: dto.city,
        state: dto.state,
        phone: dto.phone ?? null,
        address: dto.address ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'branch.create',
      entityType: 'Branch',
      entityId: branch.id,
      after: dto,
    });

    return branch;
  }

  async updateBranch(
    branchId: string,
    tenantId: string,
    dto: Partial<CreateBranchDto>,
    actorId: string,
  ) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId, deletedAt: null },
    });
    if (!branch) {
      throw new NotFoundException({
        error: 'BRANCH_NOT_FOUND',
        message: 'Filial não encontrada.',
      });
    }

    const updated = await this.prisma.branch.update({
      where: { id: branchId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.phone !== undefined && { phone: dto.phone ?? null }),
        ...(dto.address !== undefined && { address: dto.address ?? null }),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'branch.update',
      entityType: 'Branch',
      entityId: branchId,
      before: { name: branch.name, city: branch.city, state: branch.state },
      after: dto,
    });

    return updated;
  }
}
