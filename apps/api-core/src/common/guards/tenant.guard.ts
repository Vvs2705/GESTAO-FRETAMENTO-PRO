import {
  Injectable,
  type ExecutionContext,
  UnauthorizedException,
  type CanActivate,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

/**
 * TenantGuard — ensures the authenticated user has a tenantId in their JWT
 * and copies it to req.tenantId for convenience.
 *
 * Must be used AFTER JwtAuthGuard.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException({
        error: 'MISSING_TENANT',
        message: 'Token não contém informação de empresa',
      });
    }

    request.tenantId = tenantId;
    return true;
  }
}
