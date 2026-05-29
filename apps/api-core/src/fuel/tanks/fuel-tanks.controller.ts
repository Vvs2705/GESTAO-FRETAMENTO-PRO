import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FuelTanksService } from './fuel-tanks.service';
import { CreateFuelTankDto, UpdateFuelTankDto } from './dto/fuel-tank.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/tanks')
export class FuelTanksController {
  constructor(private readonly service: FuelTanksService) {}

  @Get()
  @RequirePermission('fuel.tank.read')
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('branchId') branchId?: string) {
    return this.service.findAll(user.tenantId, branchId);
  }

  @Get(':id')
  @RequirePermission('fuel.tank.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findById(id, user.tenantId);
  }

  @Get(':id/stock')
  @RequirePermission('fuel.stock.read')
  getStock(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.getStock(id, user.tenantId);
  }

  @Post()
  @RequirePermission('fuel.tank.create')
  create(@Body() dto: CreateFuelTankDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.tenantId, dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('fuel.tank.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFuelTankDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.update(id, user.tenantId, dto, user.id);
  }
}
