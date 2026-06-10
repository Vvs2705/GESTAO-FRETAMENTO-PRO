import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateFuelPumpDto, FuelPumpResponseDto } from './dto/fuel-pump.dto';

@Injectable()
export class FuelPumpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, branchId?: string, fuelTankId?: string): Promise<FuelPumpResponseDto[]> {
    const pumps = await this.prisma.fuelPump.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
        ...(fuelTankId ? { fuelTankId } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return pumps.map((item) => this.toDto(item));
  }

  async findById(id: string, tenantId: string): Promise<FuelPumpResponseDto> {
    const pump = await this.prisma.fuelPump.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!pump) throw new NotFoundException({ error: 'FUEL_PUMP_NOT_FOUND', message: 'Bomba não encontrada' });
    return this.toDto(pump);
  }

  async create(tenantId: string, dto: CreateFuelPumpDto, actorId: string): Promise<FuelPumpResponseDto> {
    const tank = await this.prisma.fuelTank.findFirst({ where: { id: dto.fuelTankId, tenantId, deletedAt: null } });
    if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });

    const exists = await this.prisma.fuelPump.findFirst({ where: { tenantId, code: dto.code, deletedAt: null } });
    if (exists) throw new ConflictException({ error: 'FUEL_PUMP_CODE_EXISTS', message: 'Código de bomba já existe' });

    const pump = await this.prisma.fuelPump.create({
      data: {
        tenantId,
        branchId: dto.branchId,
        fuelTankId: dto.fuelTankId,
        name: dto.name,
        code: dto.code,
        meterType: dto.meterType,
        currentMeterReading: 0,
        status: 'ACTIVE',
        notes: dto.notes ?? null,
      },
    });

    await this.audit.log({ tenantId, actorUserId: actorId, action: 'fuel.pump.created', entityType: 'FuelPump', entityId: pump.id });
    return this.toDto(pump);
  }

  private toDto(p: { id: string; tenantId: string; branchId: string; fuelTankId: string; name: string; code: string; meterType: string; currentMeterReading: unknown; status: string; lastInspectionAt: Date | null; notes: string | null; createdAt: Date; updatedAt: Date }): FuelPumpResponseDto {
    return {
      id: p.id, tenantId: p.tenantId, branchId: p.branchId, fuelTankId: p.fuelTankId,
      name: p.name, code: p.code, meterType: p.meterType,
      currentMeterReading: Number(p.currentMeterReading),
      status: p.status, lastInspectionAt: p.lastInspectionAt, notes: p.notes,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    };
  }
}
