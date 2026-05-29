import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationFiltersDto } from './dto/notification-filters.dto';

export interface NotificationDto {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: Date | null;
  data: unknown;
  createdAt: Date;
}

export interface CreateNotificationData {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}

function toNotificationDto(n: {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: Date | null;
  data: unknown;
  createdAt: Date;
}): NotificationDto {
  return {
    id: n.id,
    tenantId: n.tenantId,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    entityType: n.entityType,
    entityId: n.entityId,
    readAt: n.readAt,
    data: n.data,
    createdAt: n.createdAt,
  };
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    tenantId: string,
    filters: NotificationFiltersDto,
  ): Promise<CursorPage<NotificationDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const notifications = await this.prisma.notification.findMany({
      where: {
        tenantId,
        userId,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, limit) : notifications;

    return {
      data: data.map(toNotificationDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findUnreadCount(userId: string, tenantId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        tenantId,
        userId,
        readAt: null,
      },
    });

    return { count };
  }

  async markAsRead(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new NotFoundException({
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notificação não encontrada',
      });
    }

    // Security: user can only mark their own notifications as read
    if (notification.userId !== userId) {
      throw new ForbiddenException({
        error: 'FORBIDDEN',
        message: 'Você só pode marcar suas próprias notificações como lidas',
      });
    }

    if (notification.readAt) {
      // Already read — return as-is
      return toNotificationDto(notification);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return toNotificationDto(updated);
  }

  async markAllAsRead(
    userId: string,
    tenantId: string,
  ): Promise<{ updatedCount: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        tenantId,
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { updatedCount: result.count };
  }

  /**
   * Internal method for creating notifications from workers/processors.
   * Should NOT be exposed via HTTP directly.
   */
  async createInternal(data: CreateNotificationData): Promise<NotificationDto> {
    // Use object spread to avoid passing undefined to nullable JSON field
    const createData: Parameters<typeof this.prisma.notification.create>[0]['data'] = {
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
    };

    if (data.data !== undefined) {
      (createData as Record<string, unknown>)['data'] = data.data;
    }

    const notification = await this.prisma.notification.create({
      data: createData,
    });

    return toNotificationDto(notification);
  }
}
