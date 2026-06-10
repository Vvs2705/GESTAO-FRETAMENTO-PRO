import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { FuelStationsService } from './fuel-stations.service';
import { CreateFuelStationDto, UpdateFuelStationDto, FuelStationResponseDto } from './dto/fuel-station.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/stations')
export class FuelStationsController {
  constructor(private readonly service: FuelStationsService) {}

  @Get()
  @RequirePermission('fuel.station.read')
  findAll(@CurrentUser() u: AuthenticatedUser): Promise<FuelStationResponseDto[]> {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  @RequirePermission('fuel.station.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<FuelStationResponseDto> {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.station.create')
  create(@Body() dto: CreateFuelStationDto, @CurrentUser() u: AuthenticatedUser): Promise<FuelStationResponseDto> {
    return this.service.create(u.tenantId, dto, u.id);
  }

  @Patch(':id')
  @RequirePermission('fuel.station.create')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFuelStationDto,
    @CurrentUser() u: AuthenticatedUser,
  ): Promise<FuelStationResponseDto> {
    return this.service.update(id, u.tenantId, dto, u.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('fuel.station.create')
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<void> {
    return this.service.delete(id, u.tenantId, u.id);
  }
}
