import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FuelService } from './fuel.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateFuelRecordSchema,
  type CreateFuelRecordDto,
} from './dto/create-fuel.dto';
import {
  UpdateFuelRecordSchema,
  type UpdateFuelRecordDto,
} from './dto/update-fuel.dto';
import {
  FuelFiltersSchema,
  FuelStatsFiltersSchema,
  type FuelFiltersDto,
  type FuelStatsFiltersDto,
} from './dto/fuel-filters.dto';

@ApiTags('fuel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'fuel-records', version: '1' })
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  @RequirePermission('fuel.read')
  @ApiOperation({ summary: 'List all fuel records with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FuelFiltersSchema)) filters: FuelFiltersDto,
  ) {
    return this.fuelService.findAll(user.tenantId, filters);
  }

  @Get('anomalies')
  @RequirePermission('fuel.read')
  @ApiOperation({ summary: 'List fuel records with anomaly flag' })
  findAnomalies(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FuelFiltersSchema)) filters: FuelFiltersDto,
  ) {
    return this.fuelService.findAnomalies(user.tenantId, filters);
  }

  @Get('stats')
  @RequirePermission('fuel.read')
  @ApiOperation({ summary: 'Get fuel consumption statistics' })
  getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FuelStatsFiltersSchema)) filters: FuelStatsFiltersDto,
  ) {
    return this.fuelService.getStats(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('fuel.create')
  @ApiOperation({ summary: 'Create a fuel record — validates odometer, detects anomaly' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateFuelRecordSchema)) dto: CreateFuelRecordDto,
  ) {
    return this.fuelService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('fuel.read')
  @ApiOperation({ summary: 'Get fuel record by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.fuelService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('fuel.update')
  @ApiOperation({ summary: 'Update non-critical fuel record fields' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateFuelRecordSchema)) dto: UpdateFuelRecordDto,
  ) {
    return this.fuelService.update(id, user.tenantId, dto, user.id);
  }
}
