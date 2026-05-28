import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EnvSchema } from '@gestao-fretamento-pro/config';
import type { Env } from '@gestao-fretamento-pro/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';

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
    RedisModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesPermissionsModule,
  ],
})
export class AppModule {}
