import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ExternalFuelingService } from './external-fueling.service';
import { CreateExternalFuelingDto } from './dto/external-fueling.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/external')
export class ExternalFuelingController {
  constructor(private readonly service: ExternalFuelingService) {}

  @Get()
  @RequirePermission('fuel.external.read')
  findAll(
    @CurrentUser() u: AuthenticatedUser,
    @Query('vehicleId') vehicleId?: string,
    @Query('driverId') driverId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(u.tenantId, { vehicleId, driverId, status });
  }

  @Get(':id')
  @RequirePermission('fuel.external.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.external.create')
  create(@Body() dto: CreateExternalFuelingDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.create(u.tenantId, dto, u.id);
  }

  @Post(':id/approve')
  @RequirePermission('fuel.external.approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.approve(id, u.tenantId, u.id);
  }

  @Post(':id/evidence')
  @RequirePermission('fuel.external.create')
  addEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() body: { type: string; fileUrl: string; metadata?: unknown },
  ) {
    return this.service.addEvidence(id, u.tenantId, u.id, body);
  }
}
