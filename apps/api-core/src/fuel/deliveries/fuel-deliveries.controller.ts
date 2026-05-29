import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FuelDeliveriesService } from './fuel-deliveries.service';
import { CreateFuelDeliveryDto, RegisterDeliveryReceiptDto } from './dto/fuel-delivery.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/deliveries')
export class FuelDeliveriesController {
  constructor(private readonly service: FuelDeliveriesService) {}

  @Get()
  @RequirePermission('fuel.delivery.read')
  findAll(@CurrentUser() u: AuthenticatedUser, @Query('branchId') branchId?: string) {
    return this.service.findAll(u.tenantId, branchId);
  }

  @Get(':id')
  @RequirePermission('fuel.delivery.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.delivery.create')
  create(@Body() dto: CreateFuelDeliveryDto, @CurrentUser() u: AuthenticatedUser) {
    const extUser = u as AuthenticatedUser & { branchId?: string };
    return this.service.create(u.tenantId, extUser.branchId ?? '', u.id, dto);
  }

  @Post(':id/receipt')
  @RequirePermission('fuel.delivery.create')
  registerReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegisterDeliveryReceiptDto,
    @CurrentUser() u: AuthenticatedUser,
  ) {
    return this.service.registerReceipt(id, u.tenantId, u.id, dto);
  }

  @Post(':id/approve')
  @RequirePermission('fuel.delivery.approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.approve(id, u.tenantId, u.id);
  }

  @Post(':id/evidence')
  @RequirePermission('fuel.delivery.create')
  addEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() body: { type: string; fileUrl: string; metadata?: unknown },
  ) {
    return this.service.addEvidence(id, u.tenantId, u.id, body);
  }
}
