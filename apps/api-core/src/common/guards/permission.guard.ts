import {
  Injectable,
  type ExecutionContext,
  ForbiddenException,
  type CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@gestao-fretamento-pro/types';
import { PERMISSIONS_KEY } from '../constants/permissions.constants';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

/**
 * PermissionGuard — verifies that the authenticated user's role
 * includes ALL permissions required by the @RequirePermission() decorator.
 *
 * Must be used AFTER JwtAuthGuard (req.user must already be set).
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // No permissions required — allow through
    if (!required?.length) return true;

    const { user } = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (!user) {
      throw new ForbiddenException({ error: 'FORBIDDEN', message: 'Acesso negado' });
    }

    const hasAll = required.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAll) {
      throw new ForbiddenException({
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Você não tem permissão para realizar esta ação',
        details: { required },
      });
    }

    return true;
  }
}
