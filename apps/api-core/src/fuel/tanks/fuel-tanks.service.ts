import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateFuelTankDto, UpdateFuelTankDto, FuelTankResponseDto } from './dto/fuel-tank.dto';

@Injectable()
export class FuelTanksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, branchId?: string): Promise<FuelTankResponseDto[]> {
    const tanks = await this.prisma.fuelTank.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
    });
    return tanks.map(this.toDto);
  }

  async findById(id: string, tenantId: string): Promise<FuelTankResponseDto> {
    const tank = await this.prisma.fuelTank.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!tank) {
      throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });
    }
    return this.toDto(tank);
  }

  async getStock(id: string, tenantId: string) {
    const tank = await this.findById(id, tenantId);
    return {
      tankId: id,
      name: tank.name,
      currentStockLiters: tank.currentStockLiters,
      capacityLiters: tank.capacityLiters,
      stockPercent: tank.stockPercent,
      minimumStockLiters: tank.minimumStockLiters,
      warningStockLiters: tank.warningStockLiters,
      isLow: tank.isLow,
      isCritical: tank.isCritical,
      status: tank.status,
      lastMovement: await this.getLastMovement(id, tenantId),
    };
  }

  async create(tenantId: string, dto: CreateFuelTankDto, actorId: string): Promise<FuelTankResponseDto> {
    // Validate branch belongs to tenant
    const branch = await this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId, deletedAt: null } });
    if (!branch) throw new NotFoundException({ error: 'BRANCH_NOT_FOUND', message: 'Filial não encontrada' });

    // Validate product exists
    const product = await this.prisma.fuelProduct.findFirst({ where: { id: dto.fuelProductId, active: true } });
    if (!product) throw new NotFoundException({ error: 'FUEL_PRODUCT_NOT_FOUND', message: 'Produto não encontrado' });

    // Validate code uniqueness in tenant
    const exists = await this.prisma.fuelTank.findFirst({ where: { tenantId, code: dto.code, deletedAt: null } });
    if (exists) throw new ConflictException({ error: 'FUEL_TANK_CODE_EXISTS', message: 'Código de tanque já existe' });

    if ((dto.minimumStockLiters ?? 0) >= dto.capacityLiters) {
      throw new BadRequestException({ error: 'INVALID_STOCK_LEVELS', message: 'Estoque mínimo não pode ser maior que a capacidade' });
    }

    const tank = await this.prisma.fuelTank.create({
      data: {
        tenantId,
        branchId: dto.branchId,
        fuelProductId: dto.fuelProductId,
        name: dto.name,
        code: dto.code,
        capacityLiters: dto.capacityLiters,
        currentStockLiters: 0,
        minimumStockLiters: dto.minimumStockLiters ?? 0,
        warningStockLiters: dto.warningStockLiters ?? 0,
        physicalLocation: dto.physicalLocation ?? null,
        notes: dto.notes ?? null,
        status: 'ACTIVE',
      },
    });

    await this.audit.log({
      tenantId,
      actorUserId: actorId,
      action: 'fuel.tank.created',
      entityType: 'FuelTank',
      entityId: tank.id,
      after: { ...dto, id: tank.id },
    });

    return this.toDto(tank);
  }

  async update(id: string, tenantId: string, dto: UpdateFuelTankDto, actorId: string): Promise<FuelTankResponseDto> {
    const before = await this.findById(id, tenantId);

    const tank = await this.prisma.fuelTank.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.minimumStockLiters !== undefined ? { minimumStockLiters: dto.minimumStockLiters } : {}),
        ...(dto.warningStockLiters !== undefined ? { warningStockLiters: dto.warningStockLiters } : {}),
        ...(dto.physicalLocation !== undefined ? { physicalLocation: dto.physicalLocation } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    await this.audit.log({ tenantId, actorUserId: actorId, action: 'fuel.tank.updated', entityType: 'FuelTank', entityId: id, before, after: dto });
    return this.toDto(tank);
  }

  private async getLastMovement(tankId: string, tenantId: string) {
    return this.prisma.fuelInventoryMovement.findFirst({
      where: { fuelTankId: tankId, tenantId },
      orderBy: { occurredAt: 'desc' },
      select: { movementType: true, quantityLiters: true, occurredAt: true },
    });
  }

  private toDto(t: {
    id: string; tenantId: string; branchId: string; fuelProductId: string;
    name: string; code: string; capacityLiters: unknown; currentStockLiters: unknown;
    minimumStockLiters: unknown; warningStockLiters: unknown; physicalLocation: string | null;
    status: string; lastCalibrationAt: Date | null; notes: string | null;
    createdAt: Date; updatedAt: Date;
  }): FuelTankResponseDto {
    const cap = Number(t.capacityLiters);
    const stock = Number(t.currentStockLiters);
    const min = Number(t.minimumStockLiters);
    const warn = Number(t.warningStockLiters);
    return {
      id: t.id, tenantId: t.tenantId, branchId: t.branchId, fuelProductId: t.fuelProductId,
      name: t.name, code: t.code,
      capacityLiters: cap, currentStockLiters: stock,
      minimumStockLiters: min, warningStockLiters: warn,
      physicalLocation: t.physicalLocation, status: t.status,
      stockPercent: cap > 0 ? Math.round((stock / cap) * 100) : 0,
      isLow: stock <= warn,
      isCritical: stock <= min,
      lastCalibrationAt: t.lastCalibrationAt, notes: t.notes,
      createdAt: t.createdAt, updatedAt: t.updatedAt,
    };
  }
}
