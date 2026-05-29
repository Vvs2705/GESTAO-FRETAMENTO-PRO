import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import type { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import type { AssignPermissionDto } from './dto/assign-permission.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ hierarchyLevel: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { rolePermissions: true } },
      },
    });
  }

  async findById(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException({
        error: 'ROLE_NOT_FOUND',
        message: 'Cargo não encontrado.',
      });
    }

    return role;
  }

  async create(tenantId: string, dto: CreateRoleDto, actorId: string) {
    const role = await this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        department: dto.department ?? null,
        hierarchyLevel: dto.hierarchyLevel,
        description: dto.description ?? null,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'role.create',
      entityType: 'Role',
      entityId: role.id,
      after: dto,
    });

    return role;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateRoleDto,
    actorId: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException({
        error: 'ROLE_NOT_FOUND',
        message: 'Cargo não encontrado.',
      });
    }

    if (role.isSystem) {
      throw new ForbiddenException({
        error: 'CANNOT_MODIFY_SYSTEM_ROLE',
        message: 'Não é possível modificar cargos do sistema.',
      });
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.hierarchyLevel !== undefined && { hierarchyLevel: dto.hierarchyLevel }),
        ...(dto.description !== undefined && { description: dto.description }),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'role.update',
      entityType: 'Role',
      entityId: id,
      before: { name: role.name, department: role.department, hierarchyLevel: role.hierarchyLevel },
      after: dto,
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string, actorId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException({
        error: 'ROLE_NOT_FOUND',
        message: 'Cargo não encontrado.',
      });
    }

    if (role.isSystem) {
      throw new ForbiddenException({
        error: 'CANNOT_DELETE_SYSTEM_ROLE',
        message: 'Não é possível excluir cargos do sistema.',
      });
    }

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'role.delete',
      entityType: 'Role',
      entityId: id,
      before: { name: role.name },
    });
  }

  async assignPermission(
    roleId: string,
    tenantId: string,
    dto: AssignPermissionDto,
    actorId: string,
  ) {
    // Verify role belongs to tenant
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException({
        error: 'ROLE_NOT_FOUND',
        message: 'Cargo não encontrado.',
      });
    }

    // Verify permission exists
    const permission = await this.prisma.permission.findFirst({
      where: { id: dto.permissionId },
    });

    if (!permission) {
      throw new NotFoundException({
        error: 'PERMISSION_NOT_FOUND',
        message: 'Permissão não encontrada.',
      });
    }

    // Upsert — idempotent (uses the tenantId_roleId_permissionId unique constraint)
    const rolePermission = await this.prisma.rolePermission.upsert({
      where: {
        tenantId_roleId_permissionId: {
          tenantId,
          roleId,
          permissionId: dto.permissionId,
        },
      },
      update: {
        scope: dto.scope ?? null,
      },
      create: {
        tenantId,
        roleId,
        permissionId: dto.permissionId,
        scope: dto.scope ?? null,
        createdAt: new Date(),
      },
      include: { permission: true },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'role.assign_permission',
      entityType: 'Role',
      entityId: roleId,
      after: { permissionId: dto.permissionId, permissionKey: permission.key, scope: dto.scope },
    });

    return rolePermission;
  }

  async removePermission(
    roleId: string,
    permissionId: string,
    tenantId: string,
    actorId: string,
  ) {
    // Verify role belongs to tenant
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException({
        error: 'ROLE_NOT_FOUND',
        message: 'Cargo não encontrado.',
      });
    }

    const existing = await this.prisma.rolePermission.findFirst({
      where: { tenantId, roleId, permissionId },
      include: { permission: true },
    });

    if (!existing) {
      throw new NotFoundException({
        error: 'ROLE_PERMISSION_NOT_FOUND',
        message: 'Esta permissão não está atribuída ao cargo.',
      });
    }

    await this.prisma.rolePermission.delete({
      where: { tenantId_roleId_permissionId: { tenantId, roleId, permissionId } },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'role.remove_permission',
      entityType: 'Role',
      entityId: roleId,
      before: { permissionId, permissionKey: existing.permission.key },
    });
  }
}
