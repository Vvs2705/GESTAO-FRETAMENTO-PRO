import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [VehiclesModule, DriversModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
