import { Module } from '@nestjs/common';
import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';
import { FuelProductsModule } from './products/fuel-products.module';
import { FuelTanksModule } from './tanks/fuel-tanks.module';
import { FuelPumpsModule } from './pumps/fuel-pumps.module';
import { FuelSuppliersModule } from './suppliers/fuel-suppliers.module';
import { InternalFuelingModule } from './internal/internal-fueling.module';
import { FuelDeliveriesModule } from './deliveries/fuel-deliveries.module';
import { ExternalFuelingModule } from './external/external-fueling.module';
import { FuelIncidentsModule } from './incidents/fuel-incidents.module';
import { FuelStationsModule } from './stations/fuel-stations.module';
import { FuelAttendantsModule } from './attendants/fuel-attendants.module';
import { FuelReconciliationModule } from './reconciliation/fuel-reconciliation.module';

@Module({
  imports: [
    FuelProductsModule,
    FuelTanksModule,
    FuelPumpsModule,
    FuelSuppliersModule,
    InternalFuelingModule,
    FuelDeliveriesModule,
    ExternalFuelingModule,
    FuelIncidentsModule,
    FuelStationsModule,
    FuelAttendantsModule,
    FuelReconciliationModule,
  ],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [
    FuelService,
    FuelProductsModule,
    FuelTanksModule,
    FuelPumpsModule,
    FuelSuppliersModule,
    InternalFuelingModule,
    FuelDeliveriesModule,
    ExternalFuelingModule,
    FuelIncidentsModule,
    FuelStationsModule,
    FuelAttendantsModule,
    FuelReconciliationModule,
  ],
})
export class FuelModule {}
