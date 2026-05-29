import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  NotificationFiltersSchema,
  type NotificationFiltersDto,
} from './dto/notification-filters.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('notification.read')
  @ApiOperation({ summary: 'List notifications for the authenticated user' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(NotificationFiltersSchema)) filters: NotificationFiltersDto,
  ) {
    return this.notificationsService.findAll(user.id, user.tenantId, filters);
  }

  @Get('unread-count')
  @RequirePermission('notification.read')
  @ApiOperation({ summary: 'Get count of unread notifications for the authenticated user' })
  findUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findUnreadCount(user.id, user.tenantId);
  }

  @Patch('read-all')
  @RequirePermission('notification.read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for the authenticated user' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id, user.tenantId);
  }

  @Patch(':id/read')
  @RequirePermission('notification.read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markAsRead(id, user.id, user.tenantId);
  }
}
