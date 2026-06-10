import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
} from '@nestjs/common';
import { tap, of, type Observable } from 'rxjs';
import { RedisService } from '../../redis/redis.service';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours
const IDEMPOTENCY_HEADER = 'x-idempotency-key';
const REPLAY_HEADER = 'x-idempotency-replay';

/**
 * IdempotencyInterceptor — caches POST/PATCH responses by X-Idempotency-Key header.
 *
 * Per-tenant isolation: the Redis cache key is scoped to (tenantId, idempotencyKey)
 * to prevent cross-tenant collisions even if the same key value is used by two
 * different tenants.
 *
 * When a cached response is returned the header `X-Idempotency-Replay: true` is
 * added so the client can distinguish a replayed response from a fresh one.
 *
 * TTL: 24 hours (IDEMPOTENCY_TTL_SECONDS).
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly redis: RedisService) {}

  intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest<Request & Partial<AuthenticatedRequest>>();
    const idempotencyKey = req.headers[IDEMPOTENCY_HEADER] as string | undefined;

    // Only apply to mutating requests with an idempotency key
    if (!idempotencyKey || !['POST', 'PATCH', 'PUT'].includes(req.method)) {
      return next.handle();
    }

    // Resolve tenantId — either from JWT-populated user or from header/param
    const tenantId: string =
      (req as AuthenticatedRequest).tenantId ??
      (req.headers['x-tenant-id'] as string | undefined) ??
      'global';

    return this.processWithIdempotency(idempotencyKey, tenantId, ctx, next);
  }

  private async processWithIdempotency(
    key: string,
    tenantId: string,
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const redisKey = `idem:${tenantId}:${key}`;
    const cached = await this.tryGetCached(redisKey, key);

    if (cached !== null) {
      this.logger.debug({ key, tenantId }, 'Idempotency cache hit — replaying response');

      // Set replay header on the response
      const res = ctx.switchToHttp().getResponse<Response>();
      res.setHeader(REPLAY_HEADER, 'true');

      return of(cached);
    }

    return next.handle().pipe(
      tap((body) => {
        void this.cacheResponse(redisKey, body, key, tenantId);
      }),
    );
  }

  private async tryGetCached(redisKey: string, key: string): Promise<unknown> {
    try {
      const raw = await this.redis.get(redisKey);
      if (raw !== null) return JSON.parse(raw) as unknown;
    } catch (err) {
      this.logger.warn({ err, key }, 'Idempotency cache read error — proceeding without cache');
    }
    return null;
  }

  private async cacheResponse(
    redisKey: string,
    body: unknown,
    key: string,
    tenantId: string,
  ): Promise<void> {
    try {
      await this.redis.set(
        redisKey,
        JSON.stringify(body),
        'EX',
        IDEMPOTENCY_TTL_SECONDS,
      );
    } catch (err) {
      // Cache write failure must not fail the response
      this.logger.error({ err, key, tenantId }, 'Failed to cache idempotency response');
    }
  }
}
