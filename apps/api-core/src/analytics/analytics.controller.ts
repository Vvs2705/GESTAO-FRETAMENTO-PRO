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
  AnalyticsFiltersSchema,
  type FuelDashboardFiltersDto,
  type AnalyticsFiltersDto,
} from './dto/analytics-filters.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // -------------------------------------------------------------------------
  // Legacy /dashboards routes — kept for backwards compatibility
  // -------------------------------------------------------------------------

  @Get('dashboards/executive')
  @RequirePermission('dashboard.executive')
  @ApiOperation({ summary: 'Executive dashboard KPIs', description: 'Real-time executive metrics. Cache TTL: 60 seconds.' })
  getExecutiveDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getExecutiveDashboard(user.tenantId);
  }

  @Get('dashboards/operation')
  @RequirePermission('dashboard.operation')
  @ApiOperation({ summary: 'Operation dashboard — today trips, occurrences, delays' })
  getOperationDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getOperationDashboard(user.tenantId);
  }

  @Get('dashboards/fleet')
  @RequirePermission('dashboard.fleet')
  @ApiOperation({ summary: 'Fleet dashboard — vehicle status, maintenance, documents' })
  getFleetDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getFleetDashboard(user.tenantId);
  }

  @Get('dashboards/fuel')
  @RequirePermission('dashboard.fuel')
  @ApiOperation({ summary: 'Fuel dashboard — consumption, costs, anomalies' })
  getFuelDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FuelDashboardFiltersSchema)) filters: FuelDashboardFiltersDto,
  ) {
    return this.analyticsService.getFuelDashboard(user.tenantId, filters);
  }

  // -------------------------------------------------------------------------
  // NEW /analytics routes (TAREFA 1)
  // -------------------------------------------------------------------------

  @Get('analytics/executive')
  @RequirePermission('analytics.executive.read')
  @ApiOperation({
    summary: 'Executive summary analytics',
    description: 'Tenant-level KPIs: total trips, vehicles, fuel cost, fuel liters, anomalies, active drivers & contracts. Filterable by dateFrom/dateTo/branchId.',
  })
  getExecutiveSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(AnalyticsFiltersSchema)) filters: AnalyticsFiltersDto,
  ) {
    return this.analyticsService.getExecutiveSummary(user.tenantId, filters);
  }

  @Get('analytics/fuel')
  @RequirePermission('analytics.fuel.read')
  @ApiOperation({
    summary: 'Fuel analytics',
    description: 'Fuel KPIs: cost by period, liters by product, cost by vehicle, km/l average, tank stock, deliveries, anomalies, attendant performance.',
  })
  getFuelAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(AnalyticsFiltersSchema)) filters: AnalyticsFiltersDto,
  ) {
    return this.analyticsService.getFuelAnalytics(user.tenantId, filters);
  }

  @Get('analytics/fleet')
  @RequirePermission('analytics.fleet.read')
  @ApiOperation({
    summary: 'Fleet analytics',
    description: 'Fleet metrics: vehicles by status, km by vehicle, fuel efficiency ranking, maintenance costs, expiring documents.',
  })
  getFleetAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(AnalyticsFiltersSchema)) filters: AnalyticsFiltersDto,
  ) {
    return this.analyticsService.getFleetAnalytics(user.tenantId, filters);
  }

  @Get('analytics/operations')
  @RequirePermission('analytics.operations.read')
  @ApiOperation({
    summary: 'Operations analytics',
    description: 'Trip metrics: total, by status, on-time rate, average duration, occurrences count.',
  })
  getOperationsAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(AnalyticsFiltersSchema)) filters: AnalyticsFiltersDto,
  ) {
    return this.analyticsService.getOperationsAnalytics(user.tenantId, filters);
  }
}
