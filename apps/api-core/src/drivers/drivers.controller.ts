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
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateDriverSchema, type CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverSchema, type UpdateDriverDto } from './dto/update-driver.dto';
import { DriverFiltersSchema, type DriverFiltersDto } from './dto/driver-filters.dto';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'drivers', version: '1' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @RequirePermission('driver.read')
  @ApiOperation({ summary: 'List all drivers with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(DriverFiltersSchema)) filters: DriverFiltersDto,
  ) {
    return this.driversService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('driver.create')
  @ApiOperation({ summary: 'Create a new driver' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateDriverSchema)) dto: CreateDriverDto,
  ) {
    return this.driversService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('driver.read')
  @ApiOperation({ summary: 'Get driver by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('driver.update')
  @ApiOperation({ summary: 'Update driver' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateDriverSchema)) dto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, user.tenantId, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('driver.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a driver' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.softDelete(id, user.tenantId, user.id);
  }

  @Get(':id/availability')
  @RequirePermission('driver.read')
  @ApiOperation({ summary: 'Check driver availability' })
  checkAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.checkAvailability(id, user.tenantId);
  }

  @Get(':id/history')
  @RequirePermission('driver.read')
  @ApiOperation({ summary: 'Get driver trip history (last 20)' })
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.getHistory(id, user.tenantId);
  }
}
