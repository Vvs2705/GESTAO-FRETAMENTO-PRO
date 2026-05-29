import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { FuelSuppliersService } from './fuel-suppliers.service';
import { CreateFuelSupplierDto, ApproveFuelSupplierDto } from './dto/fuel-supplier.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/suppliers')
export class FuelSuppliersController {
  constructor(private readonly service: FuelSuppliersService) {}

  @Get()
  @RequirePermission('fuel.supplier.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermission('fuel.supplier.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermission('fuel.supplier.create')
  create(@Body() dto: CreateFuelSupplierDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.tenantId, dto, user.id);
  }

  @Patch(':id/approve')
  @RequirePermission('fuel.supplier.approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveFuelSupplierDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approve(id, user.tenantId, dto.approved, user.id);
  }
}
