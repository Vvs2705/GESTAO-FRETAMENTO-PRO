import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { UpdateTenantSchema } from './dto/update-tenant.dto';
import { CreateBranchSchema, type CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @RequirePermission('tenant.read')
  @ApiOperation({ summary: 'Obter dados da empresa atual' })
  @ApiResponse({ status: 200, description: 'Dados da empresa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  getCurrent(@TenantId() tenantId: string) {
    return this.tenantsService.getCurrent(tenantId);
  }

  @Patch('current')
  @RequirePermission('tenant.update')
  @ApiOperation({ summary: 'Atualizar dados da empresa atual' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = UpdateTenantSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.tenantsService.update(tenantId, parsed.data, user.id);
  }

  @Get('branches')
  @RequirePermission('branch.read')
  @ApiOperation({ summary: 'Listar filiais da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de filiais' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  getBranches(@TenantId() tenantId: string) {
    return this.tenantsService.getBranches(tenantId);
  }

  @Post('branches')
  @RequirePermission('branch.create')
  @ApiOperation({ summary: 'Criar nova filial' })
  @ApiResponse({ status: 201, description: 'Filial criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  createBranch(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = CreateBranchSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.tenantsService.createBranch(tenantId, parsed.data, user.id);
  }

  @Patch('branches/:id')
  @RequirePermission('branch.update')
  @ApiOperation({ summary: 'Atualizar filial' })
  @ApiResponse({ status: 200, description: 'Filial atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Filial não encontrada' })
  updateBranch(
    @Param('id') branchId: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = CreateBranchSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const dto: Partial<CreateBranchDto> = {};
    if (parsed.data.name !== undefined) dto.name = parsed.data.name;
    if (parsed.data.city !== undefined) dto.city = parsed.data.city;
    if (parsed.data.state !== undefined) dto.state = parsed.data.state;
    if (parsed.data.phone !== undefined) dto.phone = parsed.data.phone;
    if (parsed.data.address !== undefined) dto.address = parsed.data.address;

    return this.tenantsService.updateBranch(branchId, tenantId, dto, user.id);
  }
}
