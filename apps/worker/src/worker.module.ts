import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { EnvSchema } from '@gestao-fretamento-pro/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { S3Module } from './s3/s3.module';
import { OutboxModule } from './outbox/outbox.module';
import { NotificationModule } from './notifications/notification.module';
import { DocumentExpiryModule } from './documents/document-expiry.module';
import { FuelAnomalyModule } from './fuel-anomaly/fuel-anomaly.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const result = EnvSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Invalid environment variables: ${result.error.toString()}`);
        }
        return result.data;
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    S3Module,
    OutboxModule,
    NotificationModule,
    DocumentExpiryModule,
    FuelAnomalyModule,
    ReportsModule,
  ],
})
export class WorkerModule {}
