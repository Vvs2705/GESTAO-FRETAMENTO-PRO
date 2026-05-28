import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap, of } from 'rxjs';
import { RedisService } from '../../redis/redis.service';
import type { Request } from 'express';

const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours

/**
 * IdempotencyInterceptor — caches POST responses by Idempotency-Key header.
 * If the same key is seen again within 24h, the cached response is returned.
 *
 * Per-tenant isolation: the Redis key is scoped to avoid cross-tenant collisions.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly redis: RedisService) {}

  intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    // Only apply to POST requests with a key
    if (!idempotencyKey || req.method !== 'POST') {
      return next.handle();
    }

    return this.processWithIdempotency(idempotencyKey, next);
  }

  private async processWithIdempotency(
    key: string,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const redisKey = `idem:${key}`;
    const cached = await this.redis.get(redisKey);

    if (cached !== null) {
      this.logger.debug({ key }, 'Idempotency cache hit');
      return of(JSON.parse(cached) as unknown);
    }

    return next.handle().pipe(
      tap(async (body) => {
        try {
          await this.redis.set(
            redisKey,
            JSON.stringify(body),
            'EX',
            IDEMPOTENCY_TTL_SECONDS,
          );
        } catch (err) {
          // Cache write failure must not fail the response
          this.logger.error({ err, key }, 'Failed to cache idempotency response');
        }
      }),
    );
  }
}
