import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { InternalFuelingService } from './internal-fueling.service';
import { CreateInternalFuelingDto } from './dto/internal-fueling.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/internal')
export class InternalFuelingController {
  constructor(private readonly service: InternalFuelingService) {}

  @Get()
  @RequirePermission('fuel.internal.read')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('branchId') branchId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(user.tenantId, { branchId, vehicleId, status });
  }

  @Get(':id')
  @RequirePermission('fuel.internal.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermission('fuel.internal.create')
  create(@Body() dto: CreateInternalFuelingDto, @CurrentUser() user: AuthenticatedUser) {
    // branchId resolved from the fuelTank's branch during service execution
    const extUser = user as AuthenticatedUser & { branchId?: string };
    const branchId = extUser.branchId ?? '';
    return this.service.create(user.tenantId, branchId, user.id, dto);
  }

  @Post(':id/approve')
  @RequirePermission('fuel.internal.approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approve(id, user.tenantId, user.id);
  }

  @Post(':id/evidence')
  @RequirePermission('fuel.internal.create')
  addEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { type: string; fileUrl: string; metadata?: unknown },
  ) {
    return this.service.addEvidence(id, user.tenantId, user.id, body);
  }
}
