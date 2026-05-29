import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  FuelDashboardFiltersSchema,
  type FuelDashboardFiltersDto,
} from './dto/analytics-filters.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'dashboards', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('executive')
  @RequirePermission('dashboard.executive')
  @ApiOperation({
    summary: 'Executive dashboard KPIs',
    description: 'Real-time executive metrics. Cache TTL: 60 seconds.',
  })
  getExecutiveDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getExecutiveDashboard(user.tenantId);
  }

  @Get('operation')
  @RequirePermission('dashboard.operation')
  @ApiOperation({
    summary: 'Operation dashboard — today trips, occurrences, delays',
    description: 'Operational view for dispatchers. Cache TTL: 60 seconds.',
  })
  getOperationDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getOperationDashboard(user.tenantId);
  }

  @Get('fleet')
  @RequirePermission('dashboard.fleet')
  @ApiOperation({
    summary: 'Fleet dashboard — vehicle status, maintenance, documents',
    description: 'Fleet management overview. Cache TTL: 60 seconds.',
  })
  getFleetDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getFleetDashboard(user.tenantId);
  }

  @Get('fuel')
  @RequirePermission('dashboard.fuel')
  @ApiOperation({
    summary: 'Fuel dashboard — consumption, costs, anomalies',
    description: 'Fuel analytics for the given period (defaults to current month). Cache TTL: 60 seconds.',
  })
  getFuelDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FuelDashboardFiltersSchema)) filters: FuelDashboardFiltersDto,
  ) {
    return this.analyticsService.getFuelDashboard(user.tenantId, filters);
  }
}
