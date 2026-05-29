import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, AuditService],
  exports: [TenantsService],
})
export class TenantsModule {}
