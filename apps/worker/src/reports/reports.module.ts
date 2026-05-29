import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportProcessor } from './report.processor';
import { QUEUES } from '../outbox/outbox.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.REPORTS })],
  providers: [ReportProcessor],
})
export class ReportsModule {}
