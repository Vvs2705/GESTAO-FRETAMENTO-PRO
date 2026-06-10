import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { CostCentersModule } from './cost-centers/cost-centers.module';

@Module({
  imports: [CostCentersModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService, CostCentersModule],
})
export class FinanceModule {}
