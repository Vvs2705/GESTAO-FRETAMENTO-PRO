import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditQueryService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  AuditFiltersSchema,
  type AuditFiltersDto,
} from './dto/audit-filters.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly auditQueryService: AuditQueryService) {}

  @Get()
  @RequirePermission('audit.read')
  @ApiOperation({
    summary: 'List audit logs for the current tenant (CEO/Manager only)',
    description:
      'Cursor-based pagination ordered by createdAt DESC. Strictly tenant-isolated — cannot access other tenant data.',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(AuditFiltersSchema)) filters: AuditFiltersDto,
  ) {
    return this.auditQueryService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  @RequirePermission('audit.read')
  @ApiOperation({ summary: 'Get audit log entry by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditQueryService.findById(id, user.tenantId);
  }
}
