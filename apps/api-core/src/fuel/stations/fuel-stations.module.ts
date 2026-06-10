import { Module } from '@nestjs/common';
import { FuelStationsController } from './fuel-stations.controller';
import { FuelStationsService } from './fuel-stations.service';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FuelStationsController],
  providers: [FuelStationsService],
  exports: [FuelStationsService],
})
export class FuelStationsModule {}
