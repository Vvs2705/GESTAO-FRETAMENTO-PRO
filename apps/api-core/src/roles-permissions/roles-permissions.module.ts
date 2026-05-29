import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService, AuditService],
  exports: [RolesService, PermissionsService],
})
export class RolesPermissionsModule {}
