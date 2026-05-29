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
import { OccurrencesService } from './occurrences.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateOccurrenceSchema,
  ResolveOccurrenceSchema,
  type CreateOccurrenceDto,
  type ResolveOccurrenceDto,
} from './dto/create-occurrence.dto';
import {
  UpdateOccurrenceSchema,
  type UpdateOccurrenceDto,
} from './dto/update-occurrence.dto';
import {
  OccurrenceFiltersSchema,
  type OccurrenceFiltersDto,
} from './dto/occurrence-filters.dto';
import { z } from 'zod';

const ChangeStatusSchema = z.object({
  status: z.enum(['IN_ANALYSIS', 'RESOLVED', 'CRITICAL']),
  actionTaken: z.string().max(5000).optional(),
});

@ApiTags('occurrences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'occurrences', version: '1' })
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Get()
  @RequirePermission('occurrence.read')
  @ApiOperation({ summary: 'List all occurrences with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(OccurrenceFiltersSchema))
    filters: OccurrenceFiltersDto,
  ) {
    return this.occurrencesService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('occurrence.create')
  @ApiOperation({ summary: 'Create a new occurrence' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateOccurrenceSchema)) dto: CreateOccurrenceDto,
  ) {
    return this.occurrencesService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('occurrence.read')
  @ApiOperation({ summary: 'Get occurrence by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.occurrencesService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('occurrence.update')
  @ApiOperation({ summary: 'Update occurrence fields (not status)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateOccurrenceSchema)) dto: UpdateOccurrenceDto,
  ) {
    return this.occurrencesService.update(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/status')
  @RequirePermission('occurrence.update')
  @ApiOperation({ summary: 'Change occurrence status' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ChangeStatusSchema))
    body: { status: 'IN_ANALYSIS' | 'RESOLVED' | 'CRITICAL'; actionTaken?: string },
  ) {
    return this.occurrencesService.changeStatus(
      id,
      user.tenantId,
      body.status,
      user.id,
      body.actionTaken,
    );
  }

  @Patch(':id/resolve')
  @RequirePermission('occurrence.resolve')
  @ApiOperation({ summary: 'Resolve an occurrence with action taken' })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ResolveOccurrenceSchema)) dto: ResolveOccurrenceDto,
  ) {
    return this.occurrencesService.resolve(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/escalate')
  @RequirePermission('occurrence.update')
  @ApiOperation({ summary: 'Escalate occurrence to CRITICAL' })
  escalate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.occurrencesService.escalate(id, user.tenantId, user.id);
  }
}
