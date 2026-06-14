import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EnvSchema, type Env } from '@gestao-fretamento-pro/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
// Phase 5 — Operational modules
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { RoutesModule } from './routes/routes.module';
import { ClientsModule } from './clients/clients.module';
import { TripsModule } from './trips/trips.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { FuelModule } from './fuel/fuel.module';
// Phase 6 — Support modules
import { MaintenanceModule } from './maintenance/maintenance.module';
import { FinanceModule } from './finance/finance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';

@Module({
  imports: [
    // Config global — validates all env vars at bootstrap (fail-fast)
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const result = EnvSchema.safeParse(config);
        if (!result.success) {
          throw new Error(
            `Invalid environment variables:\n${result.error.toString()}`,
          );
        }
        return result.data;
      },
    }),

    // Global rate limiting — per-IP sliding window via Redis
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => [
        {
          ttl: config.get('RATE_LIMIT_WINDOW_MS') ?? 60000,
          limit: 200,
        },
      ],
    }),

    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    RedisModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesPermissionsModule,
    // Phase 5 — Operational modules
    VehiclesModule,
    DriversModule,
    RoutesModule,
    ClientsModule,
    TripsModule,
    OccurrencesModule,
    FuelModule,
    // Phase 6 — Support modules
    MaintenanceModule,
    FinanceModule,
    NotificationsModule,
    AuditModule,
    AnalyticsModule,
  ],
  providers: [
    // Global JWT guard — all routes require authentication unless @Public() is applied
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global permission guard — respects @RequirePermission() decorator
    { provide: APP_GUARD, useClass: PermissionGuard },
    // Global idempotency interceptor
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule {}
