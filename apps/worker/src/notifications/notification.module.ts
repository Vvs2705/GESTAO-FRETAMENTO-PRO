import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import {
  FuelNotificationProcessor,
  OccurrenceNotificationProcessor,
  TripNotificationProcessor,
} from './notification.processor';
import { QUEUES } from '../outbox/outbox.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.FUEL },
      { name: QUEUES.OCCURRENCES },
      { name: QUEUES.TRIPS },
    ),
  ],
  providers: [
    FuelNotificationProcessor,
    OccurrenceNotificationProcessor,
    TripNotificationProcessor,
  ],
})
export class NotificationModule {}
