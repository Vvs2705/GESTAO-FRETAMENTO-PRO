import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateVehicleSchema, type CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleSchema, type UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFiltersSchema, type VehicleFiltersDto } from './dto/vehicle-filters.dto';
import { z } from 'zod';

const UpdateStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'IN_MAINTENANCE', 'UNAVAILABLE', 'RETIRED']),
});

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'vehicles', version: '1' })
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @RequirePermission('vehicle.read')
  @ApiOperation({ summary: 'List all vehicles with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(VehicleFiltersSchema)) filters: VehicleFiltersDto,
  ) {
    return this.vehiclesService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('vehicle.create')
  @ApiOperation({ summary: 'Create a new vehicle' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateVehicleSchema)) dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('vehicle.read')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('vehicle.update')
  @ApiOperation({ summary: 'Update vehicle' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateVehicleSchema)) dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/status')
  @RequirePermission('vehicle.update')
  @ApiOperation({ summary: 'Update vehicle status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateStatusSchema))
    body: { status: 'AVAILABLE' | 'IN_MAINTENANCE' | 'UNAVAILABLE' | 'RETIRED' },
  ) {
    return this.vehiclesService.updateStatus(id, user.tenantId, body.status, user.id);
  }

  @Delete(':id')
  @RequirePermission('vehicle.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a vehicle' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.softDelete(id, user.tenantId, user.id);
  }

  @Get(':id/availability')
  @RequirePermission('vehicle.read')
  @ApiOperation({ summary: 'Check vehicle availability' })
  checkAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.checkAvailability(id, user.tenantId);
  }
}
