import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Auditable } from '../common/decorators/auditable.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  FinanceSummaryFiltersSchema,
  type FinanceSummaryFiltersDto,
  FinanceClientFiltersSchema,
  type FinanceClientFiltersDto,
  FinanceVehicleFiltersSchema,
  type FinanceVehicleFiltersDto,
} from './dto/finance-filters.dto';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'finance', version: '1' })
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  @RequirePermission('finance.read')
  @Auditable('finance.viewed')
  @ApiOperation({ summary: 'Get financial summary for a period' })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FinanceSummaryFiltersSchema)) filters: FinanceSummaryFiltersDto,
  ) {
    return this.financeService.getSummary(user.tenantId, filters);
  }

  @Get('revenue-by-client')
  @RequirePermission('finance.read')
  @Auditable('finance.viewed')
  @ApiOperation({ summary: 'Get revenue breakdown by client' })
  getRevenueByClient(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FinanceClientFiltersSchema)) filters: FinanceClientFiltersDto,
  ) {
    return this.financeService.getRevenueByClient(user.tenantId, filters);
  }

  @Get('cost-by-vehicle')
  @RequirePermission('finance.read')
  @Auditable('finance.viewed')
  @ApiOperation({ summary: 'Get cost breakdown by vehicle' })
  getCostByVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(FinanceVehicleFiltersSchema)) filters: FinanceVehicleFiltersDto,
  ) {
    return this.financeService.getCostByVehicle(user.tenantId, filters);
  }
}
