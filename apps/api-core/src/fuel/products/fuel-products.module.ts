import { Module } from '@nestjs/common';
import { FuelProductsController } from './fuel-products.controller';
import { FuelProductsService } from './fuel-products.service';

@Module({
  controllers: [FuelProductsController],
  providers: [FuelProductsService],
  exports: [FuelProductsService],
})
export class FuelProductsModule {}
