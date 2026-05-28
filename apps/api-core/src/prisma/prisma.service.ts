import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@gestao-fretamento-pro/database';
import { tenantContext } from '../common/context/tenant-context';

/**
 * PrismaService — NestJS wrapper for PrismaClient with:
 *  - Automatic lifecycle management (connect/disconnect on module init/destroy)
 *  - Tenant isolation middleware: automatically injects tenantId + deletedAt=null
 *    on all read and create operations using AsyncLocalStorage context
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // Models that operate at the system level and must NOT be tenant-filtered
  private static readonly SYSTEM_MODELS = new Set(['Tenant', 'Permission']);

  // Operations that should receive automatic tenantId + deletedAt filters
  private static readonly FILTER_ACTIONS = new Set([
    'findMany',
    'findFirst',
    'findFirstOrThrow',
    'count',
    'aggregate',
    'groupBy',
  ]);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Tenant isolation middleware — injected before every query
    this.$use(async (params, next) => {
      const ctx = tenantContext.getStore();

      if (
        ctx?.tenantId &&
        params.model !== undefined &&
        !PrismaService.SYSTEM_MODELS.has(params.model)
      ) {
        if (PrismaService.FILTER_ACTIONS.has(params.action)) {
          params.args = params.args ?? {};
          params.args['where'] = {
            ...(params.args['where'] as Record<string, unknown> | undefined),
            tenantId: ctx.tenantId,
            deletedAt: null,
          };
        }

        if (params.action === 'create') {
          params.args['data'] = {
            ...(params.args['data'] as Record<string, unknown>),
            tenantId: ctx.tenantId,
          };
        }
      }

      return next(params);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
