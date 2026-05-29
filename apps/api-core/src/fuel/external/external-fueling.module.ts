import { Module } from '@nestjs/common';
import { ExternalFuelingController } from './external-fueling.controller';
import { ExternalFuelingService } from './external-fueling.service';

@Module({
  controllers: [ExternalFuelingController],
  providers: [ExternalFuelingService],
  exports: [ExternalFuelingService],
})
export class ExternalFuelingModule {}
