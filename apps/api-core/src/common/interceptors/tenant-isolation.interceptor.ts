import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../context/tenant-context';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';
import { trace } from '@opentelemetry/api';

/**
 * TenantIsolationInterceptor — wraps every request in an AsyncLocalStorage
 * run-context that provides tenantId and userId to the Prisma middleware.
 *
 * This guarantees that all database queries automatically include
 * tenantId filtering without requiring explicit parameters at every call site.
 */
@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const traceId = trace.getActiveSpan()?.spanContext().traceId;

    return new Observable((subscriber) => {
      tenantContext.run(
        {
          tenantId: req.tenantId ?? req.user?.tenantId ?? '',
          userId: req.user?.id ?? '',
          traceId: traceId ?? '',
        },
        () => {
          next.handle().subscribe({
            next: (v) => subscriber.next(v),
            error: (e: unknown) => subscriber.error(e),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
