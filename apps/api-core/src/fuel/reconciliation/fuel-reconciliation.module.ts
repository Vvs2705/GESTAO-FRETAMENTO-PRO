import { Module } from '@nestjs/common';
import { FuelReconciliationController } from './fuel-reconciliation.controller';
import { FuelReconciliationService } from './fuel-reconciliation.service';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FuelReconciliationController],
  providers: [FuelReconciliationService],
  exports: [FuelReconciliationService],
})
export class FuelReconciliationModule {}
