import { Module } from '@nestjs/common';
import { InternalFuelingController } from './internal-fueling.controller';
import { InternalFuelingService } from './internal-fueling.service';

@Module({
  controllers: [InternalFuelingController],
  providers: [InternalFuelingService],
  exports: [InternalFuelingService],
})
export class InternalFuelingModule {}
