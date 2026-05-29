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
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTripSchema,
  AddPassengerSchema,
  CancelTripSchema,
  type CreateTripDto,
  type AddPassengerDto,
} from './dto/create-trip.dto';
import { UpdateTripSchema, type UpdateTripDto } from './dto/update-trip.dto';
import { TripFiltersSchema, type TripFiltersDto } from './dto/trip-filters.dto';
import { z } from 'zod';

const ChangeStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELED']),
  reason: z.string().max(2000).optional(),
});

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'trips', version: '1' })
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @RequirePermission('trip.read')
  @ApiOperation({ summary: 'List all trips with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(TripFiltersSchema)) filters: TripFiltersDto,
  ) {
    return this.tripsService.findAll(user.tenantId, filters);
  }

  @Get('today')
  @RequirePermission('trip.read')
  @ApiOperation({ summary: 'Get all trips scheduled for today' })
  findToday(@CurrentUser() user: AuthenticatedUser) {
    return this.tripsService.findToday(user.tenantId);
  }

  @Get('delayed')
  @RequirePermission('trip.read')
  @ApiOperation({ summary: 'Get all delayed trips' })
  findDelayed(@CurrentUser() user: AuthenticatedUser) {
    return this.tripsService.findDelayed(user.tenantId);
  }

  @Post()
  @RequirePermission('trip.create')
  @ApiOperation({ summary: 'Create a new trip (DRAFT status)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateTripSchema)) dto: CreateTripDto,
  ) {
    return this.tripsService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('trip.read')
  @ApiOperation({ summary: 'Get trip by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('trip.update')
  @ApiOperation({ summary: 'Update trip (only DRAFT trips can be edited)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateTripSchema)) dto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/status')
  @RequirePermission('trip.update')
  @ApiOperation({ summary: 'Change trip status' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ChangeStatusSchema))
    body: { status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELED'; reason?: string },
  ) {
    return this.tripsService.changeStatus(id, user.tenantId, body.status, user.id, body.reason);
  }

  @Delete(':id')
  @RequirePermission('trip.cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a trip' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CancelTripSchema)) dto: { reason: string },
  ) {
    return this.tripsService.cancel(id, user.tenantId, dto, user.id);
  }

  @Post(':id/passengers')
  @RequirePermission('trip.update')
  @ApiOperation({ summary: 'Add a passenger to the trip' })
  addPassenger(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(AddPassengerSchema)) dto: AddPassengerDto,
  ) {
    return this.tripsService.addPassenger(id, user.tenantId, dto, user.id);
  }

  @Delete(':id/passengers/:passengerId')
  @RequirePermission('trip.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a passenger from the trip' })
  removePassenger(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('passengerId', ParseUUIDPipe) passengerId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.removePassenger(id, passengerId, user.tenantId, user.id);
  }
}
