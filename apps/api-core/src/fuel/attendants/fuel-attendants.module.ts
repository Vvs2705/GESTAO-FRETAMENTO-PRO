import { Module } from '@nestjs/common';
import { FuelAttendantsController } from './fuel-attendants.controller';
import { FuelAttendantsService } from './fuel-attendants.service';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FuelAttendantsController],
  providers: [FuelAttendantsService],
  exports: [FuelAttendantsService],
})
export class FuelAttendantsModule {}
