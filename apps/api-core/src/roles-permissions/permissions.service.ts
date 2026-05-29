import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all permissions defined in the system (global table, not tenant-scoped).
   */
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Returns true if the user's role includes ALL of the required permissions.
   */
  async hasAll(
    userId: string,
    tenantId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    if (requiredPermissions.length === 0) return true;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null, status: 'ACTIVE' },
      select: {
        employee: {
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: { permission: { select: { key: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    const userPermissions =
      user.employee?.role?.rolePermissions.map((rp) => rp.permission.key) ?? [];

    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }

  /**
   * Returns true if the user's role includes ANY of the given permissions.
   */
  async hasAny(
    userId: string,
    tenantId: string,
    permissions: string[],
  ): Promise<boolean> {
    if (permissions.length === 0) return true;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null, status: 'ACTIVE' },
      select: {
        employee: {
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: { permission: { select: { key: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    const userPermissions =
      user.employee?.role?.rolePermissions.map((rp) => rp.permission.key) ?? [];

    return permissions.some((perm) => userPermissions.includes(perm));
  }
}
