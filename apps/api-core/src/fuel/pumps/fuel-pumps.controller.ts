import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FuelPumpsService } from './fuel-pumps.service';
import { CreateFuelPumpDto } from './dto/fuel-pump.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/pumps')
export class FuelPumpsController {
  constructor(private readonly service: FuelPumpsService) {}

  @Get()
  @RequirePermission('fuel.pump.read')
  findAll(@CurrentUser() u: AuthenticatedUser, @Query('branchId') branchId?: string, @Query('fuelTankId') fuelTankId?: string) {
    return this.service.findAll(u.tenantId, branchId, fuelTankId);
  }

  @Get(':id')
  @RequirePermission('fuel.pump.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.pump.create')
  create(@Body() dto: CreateFuelPumpDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.create(u.tenantId, dto, u.id);
  }
}
