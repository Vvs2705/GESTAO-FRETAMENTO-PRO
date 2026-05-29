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
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateRouteSchema, RoutePointSchema, type CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteSchema, type UpdateRouteDto } from './dto/update-route.dto';
import { RouteFiltersSchema, type RouteFiltersDto } from './dto/route-filters.dto';
import { z } from 'zod';

const UpdatePointsSchema = z.object({
  points: z.array(RoutePointSchema),
});

@ApiTags('routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'routes', version: '1' })
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @RequirePermission('route.read')
  @ApiOperation({ summary: 'List all routes with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(RouteFiltersSchema)) filters: RouteFiltersDto,
  ) {
    return this.routesService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('route.create')
  @ApiOperation({ summary: 'Create a new route' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateRouteSchema)) dto: CreateRouteDto,
  ) {
    return this.routesService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('route.read')
  @ApiOperation({ summary: 'Get route by ID with route points' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routesService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('route.update')
  @ApiOperation({ summary: 'Update route' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateRouteSchema)) dto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/points')
  @RequirePermission('route.update')
  @ApiOperation({ summary: 'Replace all route points' })
  updatePoints(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdatePointsSchema))
    body: { points: import('./dto/create-route.dto').RoutePointDto[] },
  ) {
    return this.routesService.updatePoints(id, user.tenantId, body.points, user.id);
  }

  @Delete(':id')
  @RequirePermission('route.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a route' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routesService.softDelete(id, user.tenantId, user.id);
  }
}
