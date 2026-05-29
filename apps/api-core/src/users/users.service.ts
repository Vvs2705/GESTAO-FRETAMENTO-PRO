import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { hashPassword } from '@gestao-fretamento-pro/auth';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import type { CreateUserDto } from './dto/create-user.dto';
import {
  toUserResponse,
  type UserResponseDto,
  type UserWithPermissionsDto,
} from './dto/user-response.dto';

export interface UserListFilters {
  limit?: number;
  cursor?: string;
  status?: string;
  search?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(
    tenantId: string,
    filters: UserListFilters,
  ): Promise<CursorPage<UserResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (filters.status) {
      where['status'] = filters.status;
    }

    if (filters.search) {
      where['OR'] = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.cursor) {
      where['id'] = { gt: filters.cursor };
    }

    const users = await this.prisma.user.findMany({
      where: where as never,
      take: limit + 1,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        tenantId: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = users.length > limit;
    const data = users.slice(0, limit).map(toUserResponse);
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    return {
      data,
      pagination: { nextCursor, hasMore, limit },
    };
  }

  async findById(id: string, tenantId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }

    return toUserResponse(user);
  }

  async findMe(userId: string, tenantId: string): Promise<UserWithPermissionsDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                rolePermissions: {
                  select: {
                    permission: { select: { key: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }

    const permissions =
      user.employee?.role?.rolePermissions.map((rp) => rp.permission.key) ?? [];

    const base = toUserResponse(user);
    const dto: UserWithPermissionsDto = {
      ...base,
      permissions,
    };
    if (user.employee?.role?.id) {
      dto.roleId = user.employee.role.id;
    }
    if (user.employee?.role?.name) {
      dto.roleName = user.employee.role.name;
    }
    return dto;
  }

  async create(
    tenantId: string,
    dto: CreateUserDto,
    actorId: string,
  ): Promise<UserResponseDto> {
    // Check email uniqueness within tenant
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), tenantId, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException({
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'Já existe um usuário com este e-mail nesta empresa.',
      });
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        phone: dto.phone ?? null,
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'user.create',
      entityType: 'User',
      entityId: user.id,
      after: { name: user.name, email: user.email },
    });

    return toUserResponse(user);
  }

  async update(
    id: string,
    tenantId: string,
    dto: Partial<Omit<CreateUserDto, 'password'>>,
    actorId: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const conflict = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase(), tenantId, deletedAt: null },
      });
      if (conflict) {
        throw new ConflictException({
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Já existe um usuário com este e-mail nesta empresa.',
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'user.update',
      entityType: 'User',
      entityId: id,
      before: { name: user.name, email: user.email, phone: user.phone },
      after: dto,
    });

    return toUserResponse(updated);
  }

  async changeStatus(
    id: string,
    tenantId: string,
    status: string,
    actorId: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'user.change_status',
      entityType: 'User',
      entityId: id,
      before: { status: user.status },
      after: { status },
    });

    return toUserResponse(updated);
  }
}
