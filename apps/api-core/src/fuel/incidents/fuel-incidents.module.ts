import { Module } from '@nestjs/common';
import { FuelIncidentsController } from './fuel-incidents.controller';
import { FuelIncidentsService } from './fuel-incidents.service';

@Module({
  controllers: [FuelIncidentsController],
  providers: [FuelIncidentsService],
  exports: [FuelIncidentsService],
})
export class FuelIncidentsModule {}
