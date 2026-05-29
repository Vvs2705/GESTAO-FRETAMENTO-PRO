import { Module } from '@nestjs/common';
import { FuelSuppliersController } from './fuel-suppliers.controller';
import { FuelSuppliersService } from './fuel-suppliers.service';

@Module({
  controllers: [FuelSuppliersController],
  providers: [FuelSuppliersService],
  exports: [FuelSuppliersService],
})
export class FuelSuppliersModule {}
