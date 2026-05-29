import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OutboxProcessor, QUEUES } from './outbox.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.TRIPS },
      { name: QUEUES.OCCURRENCES },
      { name: QUEUES.VEHICLES },
      { name: QUEUES.FUEL },
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.MAINTENANCE },
      { name: QUEUES.DOCUMENTS },
      { name: QUEUES.REPORTS },
    ),
  ],
  providers: [OutboxProcessor],
  // Export BullModule so other modules can inject queues registered here
  exports: [BullModule],
})
export class OutboxModule {}
