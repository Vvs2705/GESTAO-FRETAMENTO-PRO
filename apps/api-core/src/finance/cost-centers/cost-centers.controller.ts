import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto, UpdateCostCenterDto, CostCenterResponseDto } from './dto/cost-center.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@Controller('v1/finance/cost-centers')
export class CostCentersController {
  constructor(private readonly service: CostCentersService) {}

  @Get()
  @RequirePermission('finance.read')
  findAll(@CurrentUser() u: AuthenticatedUser): Promise<CostCenterResponseDto[]> {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  @RequirePermission('finance.read')
  findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<CostCenterResponseDto> {
    return this.service.findById(id, u.tenantId);
  }

  @Post()
  @RequirePermission('finance.create')
  create(@Body() dto: CreateCostCenterDto, @CurrentUser() u: AuthenticatedUser): Promise<CostCenterResponseDto> {
    return this.service.create(u.tenantId, dto, u.id);
  }

  @Patch(':id')
  @RequirePermission('finance.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostCenterDto,
    @CurrentUser() u: AuthenticatedUser,
  ): Promise<CostCenterResponseDto> {
    return this.service.update(id, u.tenantId, dto, u.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('finance.update')
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser): Promise<void> {
    return this.service.delete(id, u.tenantId, u.id);
  }
}
