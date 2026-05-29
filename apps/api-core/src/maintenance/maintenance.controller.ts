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
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateMaintenanceOrderSchema,
  type CreateMaintenanceOrderDto,
  AddMaintenanceItemSchema,
  type AddMaintenanceItemDto,
  CompleteMaintenanceSchema,
  type CompleteMaintenanceDto,
} from './dto/create-maintenance.dto';
import {
  UpdateMaintenanceOrderSchema,
  type UpdateMaintenanceOrderDto,
} from './dto/update-maintenance.dto';
import {
  MaintenanceFiltersSchema,
  type MaintenanceFiltersDto,
} from './dto/maintenance-filters.dto';

@ApiTags('maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'maintenance', version: '1' })
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @RequirePermission('maintenance.read')
  @ApiOperation({ summary: 'List maintenance orders with cursor pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(MaintenanceFiltersSchema)) filters: MaintenanceFiltersDto,
  ) {
    return this.maintenanceService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('maintenance.create')
  @ApiOperation({ summary: 'Create a new maintenance order' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateMaintenanceOrderSchema)) dto: CreateMaintenanceOrderDto,
  ) {
    return this.maintenanceService.create(user.tenantId, dto, user.id);
  }

  @Get('preventive-due')
  @RequirePermission('maintenance.read')
  @ApiOperation({ summary: 'List vehicles with overdue preventive maintenance (> 90 days)' })
  getPreventiveDue(@CurrentUser() user: AuthenticatedUser) {
    return this.maintenanceService.getPreventiveDue(user.tenantId);
  }

  @Get(':id')
  @RequirePermission('maintenance.read')
  @ApiOperation({ summary: 'Get maintenance order by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenanceService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('maintenance.update')
  @ApiOperation({ summary: 'Update maintenance order fields' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateMaintenanceOrderSchema)) dto: UpdateMaintenanceOrderDto,
  ) {
    return this.maintenanceService.update(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/complete')
  @RequirePermission('maintenance.complete')
  @ApiOperation({ summary: 'Mark maintenance order as completed' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CompleteMaintenanceSchema)) dto: CompleteMaintenanceDto,
  ) {
    return this.maintenanceService.complete(id, user.tenantId, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('maintenance.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel maintenance order' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenanceService.cancel(id, user.tenantId, user.id);
  }

  @Post(':id/items')
  @RequirePermission('maintenance.update')
  @ApiOperation({ summary: 'Add item to maintenance order' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(AddMaintenanceItemSchema)) dto: AddMaintenanceItemDto,
  ) {
    return this.maintenanceService.addItem(id, user.tenantId, dto, user.id);
  }

  @Delete(':id/items/:itemId')
  @RequirePermission('maintenance.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from maintenance order' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenanceService.removeItem(id, itemId, user.tenantId, user.id);
  }
}
