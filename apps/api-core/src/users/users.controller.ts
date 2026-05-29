import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangeUserStatusSchema,
  UserListFiltersSchema,
} from '@gestao-fretamento-pro/validators';
import { UsersService } from './users.service';
import { UserResponseDto, UserWithPermissionsDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import type { AuthenticatedUser, CreateUserDto } from '@gestao-fretamento-pro/types';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário', type: UserWithPermissionsDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getMe(
    @CurrentUser() user: AuthenticatedUser,
    @TenantId() tenantId: string,
  ): Promise<UserWithPermissionsDto> {
    return this.usersService.findMe(user.id, tenantId);
  }

  @Get()
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'Listar usuários da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuários paginada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@TenantId() tenantId: string, @Query() query: unknown) {
    const parsed = UserListFiltersSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Parâmetros de busca inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const { limit, status, cursor, search } = parsed.data;
    return this.usersService.findAll(tenantId, {
      limit,
      ...(status && { status }),
      ...(cursor && { cursor }),
      ...(search && { search }),
    });
  }

  @Post()
  @RequirePermission('user.create')
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.usersService.create(tenantId, parsed.data, user.id);
  }

  @Get(':id')
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  @ApiResponse({ status: 200, description: 'Dados do usuário', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const dto: Partial<Omit<CreateUserDto, 'password'>> = {};
    if (parsed.data.name !== undefined) dto.name = parsed.data.name;
    if (parsed.data.email !== undefined) dto.email = parsed.data.email;
    if (parsed.data.phone !== undefined) dto.phone = parsed.data.phone;
    if (parsed.data.employeeId !== undefined) dto.employeeId = parsed.data.employeeId;
    if (parsed.data.roleId !== undefined) dto.roleId = parsed.data.roleId;

    return this.usersService.update(id, tenantId, dto, user.id);
  }

  @Patch(':id/status')
  @RequirePermission('user.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar status do usuário' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  changeStatus(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = ChangeUserStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    return this.usersService.changeStatus(id, tenantId, parsed.data.status, user.id);
  }
}
