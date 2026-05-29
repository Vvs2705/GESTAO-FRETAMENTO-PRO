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
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateClientSchema,
  CreateContractSchema,
  type CreateClientDto,
  type CreateContractDto,
} from './dto/create-client.dto';
import {
  UpdateClientSchema,
  UpdateContractSchema,
  type UpdateClientDto,
  type UpdateContractDto,
} from './dto/update-client.dto';
import { ClientFiltersSchema, type ClientFiltersDto } from './dto/client-filters.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'clients', version: '1' })
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermission('client.read')
  @ApiOperation({ summary: 'List all clients with cursor-based pagination' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(ClientFiltersSchema)) filters: ClientFiltersDto,
  ) {
    return this.clientsService.findAll(user.tenantId, filters);
  }

  @Post()
  @RequirePermission('client.create')
  @ApiOperation({ summary: 'Create a new client' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateClientSchema)) dto: CreateClientDto,
  ) {
    return this.clientsService.create(user.tenantId, dto, user.id);
  }

  @Get(':id')
  @RequirePermission('client.read')
  @ApiOperation({ summary: 'Get client by ID with contracts' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @RequirePermission('client.update')
  @ApiOperation({ summary: 'Update client' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateClientSchema)) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, user.tenantId, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('client.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a client' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.softDelete(id, user.tenantId, user.id);
  }

  @Post(':id/contracts')
  @RequirePermission('client.create')
  @ApiOperation({ summary: 'Create a contract for client' })
  createContract(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateContractSchema)) dto: CreateContractDto,
  ) {
    return this.clientsService.createContract(id, user.tenantId, dto, user.id);
  }

  @Patch(':id/contracts/:contractId')
  @RequirePermission('client.update')
  @ApiOperation({ summary: 'Update a client contract' })
  updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateContractSchema)) dto: UpdateContractDto,
  ) {
    return this.clientsService.updateContract(contractId, id, user.tenantId, dto, user.id);
  }

  @Get(':id/stats')
  @RequirePermission('client.read')
  @ApiOperation({ summary: 'Get client statistics' })
  getStats(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.getStats(id, user.tenantId);
  }
}
