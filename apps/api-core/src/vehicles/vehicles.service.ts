import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';
import type { VehicleFiltersDto } from './dto/vehicle-filters.dto';
import {
  toVehicleDto,
  type VehicleResponseDto,
  type VehicleAvailabilityDto,
} from './dto/vehicle-response.dto';

type VehicleStatus = 'AVAILABLE' | 'IN_MAINTENANCE' | 'UNAVAILABLE' | 'RETIRED';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: VehicleFiltersDto,
  ): Promise<CursorPage<VehicleResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
        ...(filters.search
          ? {
              OR: [
                { plate: { contains: filters.search, mode: 'insensitive' } },
                { prefix: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = vehicles.length > limit;
    const data = hasMore ? vehicles.slice(0, limit) : vehicles;

    return {
      data: data.map(toVehicleDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException({
        error: 'VEHICLE_NOT_FOUND',
        message: 'Veículo não encontrado',
      });
    }

    return toVehicleDto(vehicle);
  }

  async create(
    tenantId: string,
    dto: CreateVehicleDto,
    actorId: string,
  ): Promise<VehicleResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // Check plate uniqueness within tenant
      const existing = await tx.vehicle.findFirst({
        where: { tenantId, plate: dto.plate.toUpperCase(), deletedAt: null },
      });

      if (existing) {
        throw new ConflictException({
          error: 'VEHICLE_PLATE_DUPLICATE',
          message: `Já existe um veículo com a placa ${dto.plate}`,
        });
      }

      const vehicle = await tx.vehicle.create({
        data: {
          tenantId,
          plate: dto.plate.toUpperCase(),
          prefix: dto.prefix ?? null,
          type: dto.type,
          capacity: dto.capacity,
          brand: dto.brand ?? null,
          model: dto.model ?? null,
          year: dto.year ?? null,
          fuelType: dto.fuelType ?? null,
          currentOdometer: dto.currentOdometer ?? null,
          branchId: dto.branchId ?? null,
          notes: dto.notes ?? null,
          status: 'AVAILABLE',
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: vehicle.id,
          eventType: 'VehicleCreated',
          payload: {
            vehicleId: vehicle.id,
            tenantId,
            plate: vehicle.plate,
            type: vehicle.type,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toVehicleDto(vehicle);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateVehicleDto,
    actorId: string,
  ): Promise<VehicleResponseDto> {
    await this.findById(id, tenantId);

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.plate !== undefined ? { plate: dto.plate.toUpperCase() } : {}),
        ...(dto.prefix !== undefined ? { prefix: dto.prefix } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.brand !== undefined ? { brand: dto.brand } : {}),
        ...(dto.model !== undefined ? { model: dto.model } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.fuelType !== undefined ? { fuelType: dto.fuelType } : {}),
        ...(dto.branchId !== undefined ? { branchId: dto.branchId } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
    });

    return toVehicleDto(vehicle);
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: VehicleStatus,
    actorId: string,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException({
        error: 'VEHICLE_NOT_FOUND',
        message: 'Veículo não encontrado',
      });
    }

    // Cannot set AVAILABLE if there are open/in-progress maintenance orders
    if (status === 'AVAILABLE') {
      const activeMaintenance = await this.prisma.maintenanceOrder.findFirst({
        where: {
          vehicleId: id,
          tenantId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          deletedAt: null,
        },
      });

      if (activeMaintenance) {
        throw new BadRequestException({
          error: 'VEHICLE_HAS_OPEN_MAINTENANCE',
          message:
            'Não é possível definir veículo como disponível enquanto houver ordem de manutenção aberta',
          details: { maintenanceOrderId: activeMaintenance.id },
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id },
        data: { status, updatedBy: actorId },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'VehicleStatusChanged',
          payload: {
            vehicleId: id,
            tenantId,
            previousStatus: vehicle.status,
            newStatus: status,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toVehicleDto(updated);
    });
  }

  async softDelete(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<void> {
    await this.findById(id, tenantId);

    await this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  async checkAvailability(
    vehicleId: string,
    tenantId: string,
  ): Promise<VehicleAvailabilityDto> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException({
        error: 'VEHICLE_NOT_FOUND',
        message: 'Veículo não encontrado',
      });
    }

    if (vehicle.status === 'IN_MAINTENANCE') {
      return { vehicleId, available: false, reason: 'IN_MAINTENANCE' };
    }

    if (vehicle.status === 'UNAVAILABLE') {
      return { vehicleId, available: false, reason: 'UNAVAILABLE' };
    }

    if (vehicle.status === 'RETIRED') {
      return { vehicleId, available: false, reason: 'RETIRED' };
    }

    // Double-check for open maintenance orders even if status looks OK
    const activeMaintenance = await this.prisma.maintenanceOrder.findFirst({
      where: {
        vehicleId,
        tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    });

    if (activeMaintenance) {
      return { vehicleId, available: false, reason: 'IN_MAINTENANCE' };
    }

    return { vehicleId, available: true };
  }
}
