import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FuelIncidentsService } from './fuel-incidents.service';
import { CreateFuelIncidentDto, ResolveFuelIncidentDto } from './dto/fuel-incident.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/incidents')
export class FuelIncidentsController {
  constructor(private readonly service: FuelIncidentsService) {}

  @Get()
  @RequirePermission('fuel.incident.read')
  findAll(
    @CurrentUser() u: AuthenticatedUser,
    @Query('branchId') branchId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(u.tenantId, { branchId, severity, status });
  }

  @Get(':id')
  @RequirePermission('fuel.incident.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.incident.create')
  create(@Body() dto: CreateFuelIncidentDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.create(u.tenantId, u.id, dto);
  }

  @Post(':id/resolve')
  @RequirePermission('fuel.incident.resolve')
  resolve(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveFuelIncidentDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.resolve(id, u.tenantId, u.id, dto);
  }
}
