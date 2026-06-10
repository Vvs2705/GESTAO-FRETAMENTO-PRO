import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { FuelAttendantsService } from './fuel-attendants.service';
import { CreateFuelAttendantDto, UpdateFuelAttendantDto, FuelAttendantResponseDto } from './dto/fuel-attendant.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/fuel/attendants')
export class FuelAttendantsController {
  constructor(private readonly service: FuelAttendantsService) {}

  @Get()
  @RequirePermission('fuel.stock.adjust')
  findAll(@CurrentUser() u: AuthenticatedUser): Promise<FuelAttendantResponseDto[]> {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  @RequirePermission('fuel.stock.adjust')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<FuelAttendantResponseDto> {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('fuel.stock.adjust')
  create(@Body() dto: CreateFuelAttendantDto, @CurrentUser() u: AuthenticatedUser): Promise<FuelAttendantResponseDto> {
    return this.service.create(u.tenantId, dto, u.id);
  }

  @Patch(':id')
  @RequirePermission('fuel.stock.adjust')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFuelAttendantDto,
    @CurrentUser() u: AuthenticatedUser,
  ): Promise<FuelAttendantResponseDto> {
    return this.service.update(id, u.tenantId, dto, u.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('fuel.stock.adjust')
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<void> {
    return this.service.delete(id, u.tenantId, u.id);
  }
}
