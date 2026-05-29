import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { FuelProductsService } from './fuel-products.service';
import { CreateFuelProductDto } from './dto/fuel-product.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/products')
export class FuelProductsController {
  constructor(private readonly service: FuelProductsService) {}

  @Get()
  @RequirePermission('fuel.product.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermission('fuel.product.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermission('fuel.product.create')
  create(@Body() dto: CreateFuelProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.tenantId, dto);
  }
}
