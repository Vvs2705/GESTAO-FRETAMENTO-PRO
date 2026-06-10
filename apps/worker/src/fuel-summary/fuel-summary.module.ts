import { Module } from '@nestjs/common';
import { FuelSummaryService } from './fuel-summary.service';

@Module({
  providers: [FuelSummaryService],
  exports: [FuelSummaryService],
})
export class FuelSummaryModule {}
