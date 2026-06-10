import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { FuelReconciliationService } from './fuel-reconciliation.service';
import { CreateReconciliationDto, ReconciliationResponseDto } from './dto/reconciliation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/reconciliation')
export class FuelReconciliationController {
  constructor(private readonly service: FuelReconciliationService) {}

  @Post()
  @RequirePermission('fuel.reconciliation.create')
  reconcile(@Body() dto: CreateReconciliationDto, @CurrentUser() u: AuthenticatedUser): Promise<ReconciliationResponseDto> {
    return this.service.reconcile(u.tenantId, dto, u.id);
  }

  @Get('history')
  @RequirePermission('fuel.reconciliation.read')
  getHistory(@Query('fuelTankId') fuelTankId: string | undefined, @CurrentUser() u: AuthenticatedUser) {
    return this.service.getHistory(u.tenantId, fuelTankId);
  }
}
