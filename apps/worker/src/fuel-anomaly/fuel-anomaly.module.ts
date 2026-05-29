import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FuelAnomalyProcessor } from './fuel-anomaly.processor';
import { QUEUES } from '../outbox/outbox.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.FUEL })],
  providers: [FuelAnomalyProcessor],
})
export class FuelAnomalyModule {}
