import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleSchema, UpdateRoleSchema } from './dto/create-role.dto';
import { AssignPermissionSchema } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'Listar cargos da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de cargos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  findAll(@TenantId() tenantId: string) {
    return this.rolesService.findAll(tenantId);
  }

  @Post()
  @RequirePermission('role.create')
  @ApiOperation({ summary: 'Criar novo cargo' })
  @ApiResponse({ status: 201, description: 'Cargo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = CreateRoleSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.rolesService.create(tenantId, parsed.data, user.id);
  }

  @Get(':id')
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'Obter cargo por ID' })
  @ApiResponse({ status: 200, description: 'Dados do cargo com permissões' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.rolesService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Atualizar cargo' })
  @ApiResponse({ status: 200, description: 'Cargo atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = UpdateRoleSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.rolesService.update(id, tenantId, parsed.data, user.id);
  }

  @Delete(':id')
  @RequirePermission('role.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir cargo (soft delete)' })
  @ApiResponse({ status: 204, description: 'Cargo excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão ou cargo do sistema' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  async softDelete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.rolesService.softDelete(id, tenantId, user.id);
  }

  @Post(':id/permissions')
  @RequirePermission('permission.manage')
  @ApiOperation({ summary: 'Atribuir permissão ao cargo' })
  @ApiResponse({ status: 201, description: 'Permissão atribuída com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Cargo ou permissão não encontrada' })
  assignPermission(
    @Param('id') roleId: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = AssignPermissionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.rolesService.assignPermission(roleId, tenantId, parsed.data, user.id);
  }

  @Delete(':roleId/permissions/:permissionId')
  @RequirePermission('permission.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover permissão do cargo' })
  @ApiResponse({ status: 204, description: 'Permissão removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Cargo ou permissão não encontrada' })
  async removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.rolesService.removePermission(roleId, permissionId, tenantId, user.id);
  }
}
