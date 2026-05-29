import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { UpdateDriverDto } from './dto/update-driver.dto';
import type { DriverFiltersDto } from './dto/driver-filters.dto';
import {
  toDriverDto,
  type DriverResponseDto,
  type DriverAvailabilityDto,
} from './dto/driver-response.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: DriverFiltersDto,
  ): Promise<CursorPage<DriverResponseDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const drivers = await this.prisma.driver.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.availabilityStatus
          ? { availabilityStatus: filters.availabilityStatus }
          : {}),
        ...(filters.search
          ? {
              OR: [
                {
                  licenseNumber: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  employee: {
                    name: { contains: filters.search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = drivers.length > limit;
    const data = hasMore ? drivers.slice(0, limit) : drivers;

    return {
      data: data.map(toDriverDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<DriverResponseDto> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { employee: true },
    });

    if (!driver) {
      throw new NotFoundException({
        error: 'DRIVER_NOT_FOUND',
        message: 'Motorista não encontrado',
      });
    }

    return toDriverDto(driver);
  }

  async create(
    tenantId: string,
    dto: CreateDriverDto,
    actorId: string,
  ): Promise<DriverResponseDto> {
    // If employeeId provided, verify it belongs to this tenant
    if (dto.employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: dto.employeeId, tenantId, deletedAt: null },
      });

      if (!employee) {
        throw new BadRequestException({
          error: 'EMPLOYEE_NOT_FOUND',
          message: 'Funcionário não encontrado neste tenant',
        });
      }

      // Check if employee already has a driver profile
      const existingDriver = await this.prisma.driver.findFirst({
        where: { employeeId: dto.employeeId, deletedAt: null },
      });

      if (existingDriver) {
        throw new BadRequestException({
          error: 'EMPLOYEE_ALREADY_DRIVER',
          message: 'Este funcionário já possui um perfil de motorista',
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const driver = await tx.driver.create({
        data: {
          tenantId,
          employeeId: dto.employeeId ?? null,
          licenseNumber: dto.licenseNumber,
          licenseCategory: dto.licenseCategory,
          licenseExpiresAt: dto.licenseExpiresAt,
          availabilityStatus: dto.availabilityStatus ?? 'AVAILABLE',
          preferredVehicleId: dto.preferredVehicleId ?? null,
          notes: dto.notes ?? null,
          createdBy: actorId,
          updatedBy: actorId,
        },
        include: { employee: true },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: driver.id,
          eventType: 'DriverCreated',
          payload: {
            driverId: driver.id,
            tenantId,
            licenseNumber: driver.licenseNumber,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toDriverDto(driver);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateDriverDto,
    actorId: string,
  ): Promise<DriverResponseDto> {
    await this.findById(id, tenantId);

    const driver = await this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.licenseNumber !== undefined
          ? { licenseNumber: dto.licenseNumber }
          : {}),
        ...(dto.licenseCategory !== undefined
          ? { licenseCategory: dto.licenseCategory }
          : {}),
        ...(dto.licenseExpiresAt !== undefined
          ? { licenseExpiresAt: dto.licenseExpiresAt }
          : {}),
        ...(dto.availabilityStatus !== undefined
          ? { availabilityStatus: dto.availabilityStatus }
          : {}),
        ...(dto.preferredVehicleId !== undefined
          ? { preferredVehicleId: dto.preferredVehicleId }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
      include: { employee: true },
    });

    return toDriverDto(driver);
  }

  async softDelete(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<void> {
    await this.findById(id, tenantId);

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  async checkAvailability(
    driverId: string,
    tenantId: string,
  ): Promise<DriverAvailabilityDto> {
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, tenantId, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException({
        error: 'DRIVER_NOT_FOUND',
        message: 'Motorista não encontrado',
      });
    }

    if (driver.availabilityStatus !== 'AVAILABLE') {
      return {
        driverId,
        available: false,
        reason: `Motorista está com status: ${driver.availabilityStatus}`,
      };
    }

    // Check for expired license
    const now = new Date();
    if (driver.licenseExpiresAt <= now) {
      return {
        driverId,
        available: false,
        reason: 'CNH vencida',
      };
    }

    // Check for open CRITICAL occurrences linked to this driver
    const criticalOccurrence = await this.prisma.occurrence.findFirst({
      where: {
        driverId,
        tenantId,
        severity: 'CRITICAL',
        status: { in: ['OPEN', 'CRITICAL', 'IN_ANALYSIS'] },
        deletedAt: null,
      },
    });

    if (criticalOccurrence) {
      return {
        driverId,
        available: false,
        reason: 'Motorista possui ocorrência crítica em aberto',
      };
    }

    return { driverId, available: true };
  }

  async getHistory(
    driverId: string,
    tenantId: string,
  ): Promise<Record<string, unknown>[]> {
    await this.findById(driverId, tenantId);

    const trips = await this.prisma.trip.findMany({
      where: {
        driverId,
        tenantId,
        deletedAt: null,
      },
      include: {
        route: { select: { id: true, name: true, origin: true, destination: true } },
        vehicle: { select: { id: true, plate: true, prefix: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { scheduledStartAt: 'desc' },
      take: 20,
    });

    return trips.map((trip) => ({
      id: trip.id,
      status: trip.status,
      scheduledStartAt: trip.scheduledStartAt,
      scheduledEndAt: trip.scheduledEndAt,
      actualStartAt: trip.actualStartAt,
      actualEndAt: trip.actualEndAt,
      route: trip.route,
      vehicle: trip.vehicle,
      client: trip.client,
    }));
  }
}
