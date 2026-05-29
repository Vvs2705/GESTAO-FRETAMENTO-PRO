import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Decimal } from '@prisma/client/runtime/library';
import type { CursorPage } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMaintenanceOrderDto, AddMaintenanceItemDto, CompleteMaintenanceDto } from './dto/create-maintenance.dto';
import type { UpdateMaintenanceOrderDto } from './dto/update-maintenance.dto';
import type { MaintenanceFiltersDto } from './dto/maintenance-filters.dto';

type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

// State machine: OPEN → IN_PROGRESS → COMPLETED | OPEN → CANCELED
const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};

const MAINTENANCE_INCLUDE = {
  vehicle: true,
  items: true,
} as const;

export interface MaintenanceOrderDto {
  id: string;
  tenantId: string;
  vehicleId: string;
  type: string;
  description: string;
  supplierName: string | null;
  supplierDocument: string | null;
  expectedStartAt: Date | null;
  expectedEndAt: Date | null;
  actualEndAt: Date | null;
  totalCost: number | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  items: MaintenanceItemDto[];
  vehicle?: {
    id: string;
    plate: string;
    type: string;
    status: string;
  };
}

export interface MaintenanceItemDto {
  id: string;
  tenantId: string;
  maintenanceOrderId: string;
  description: string;
  partName: string | null;
  partCode: string | null;
  quantity: number;
  unitCost: number;
  totalCost: number;
  createdAt: Date;
}

function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return parseFloat(value.toString());
}

function toMaintenanceItemDto(item: {
  id: string;
  tenantId: string;
  maintenanceOrderId: string;
  description: string;
  partName: string | null;
  partCode: string | null;
  quantity: Decimal;
  unitCost: Decimal;
  totalCost: Decimal;
  createdAt: Date;
  updatedAt: Date;
}): MaintenanceItemDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    maintenanceOrderId: item.maintenanceOrderId,
    description: item.description,
    partName: item.partName,
    partCode: item.partCode,
    quantity: parseFloat(item.quantity.toString()),
    unitCost: parseFloat(item.unitCost.toString()),
    totalCost: parseFloat(item.totalCost.toString()),
    createdAt: item.createdAt,
  };
}

function toMaintenanceOrderDto(order: {
  id: string;
  tenantId: string;
  vehicleId: string;
  type: string;
  description: string;
  supplierName: string | null;
  supplierDocument: string | null;
  expectedStartAt: Date | null;
  expectedEndAt: Date | null;
  actualEndAt: Date | null;
  totalCost: Decimal | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  items: Array<{
    id: string;
    tenantId: string;
    maintenanceOrderId: string;
    description: string;
    partName: string | null;
    partCode: string | null;
    quantity: Decimal;
    unitCost: Decimal;
    totalCost: Decimal;
    createdAt: Date;
    updatedAt: Date;
  }>;
  vehicle?: {
    id: string;
    plate: string;
    type: string;
    status: string;
  } | null;
}): MaintenanceOrderDto {
  return {
    id: order.id,
    tenantId: order.tenantId,
    vehicleId: order.vehicleId,
    type: order.type,
    description: order.description,
    supplierName: order.supplierName,
    supplierDocument: order.supplierDocument,
    expectedStartAt: order.expectedStartAt,
    expectedEndAt: order.expectedEndAt,
    actualEndAt: order.actualEndAt,
    totalCost: decimalToNumber(order.totalCost),
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    createdBy: order.createdBy,
    updatedBy: order.updatedBy,
    items: order.items.map(toMaintenanceItemDto),
    ...(order.vehicle
      ? {
          vehicle: {
            id: order.vehicle.id,
            plate: order.vehicle.plate,
            type: order.vehicle.type,
            status: order.vehicle.status,
          },
        }
      : {}),
  };
}

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTransition(
    current: MaintenanceStatus,
    next: MaintenanceStatus,
  ): void {
    const allowed = ALLOWED_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        error: 'INVALID_STATUS_TRANSITION',
        message: `Não é possível mover de ${current} para ${next}`,
        details: { currentStatus: current, requestedStatus: next, allowed },
      });
    }
  }

  async findAll(
    tenantId: string,
    filters: MaintenanceFiltersDto,
  ): Promise<CursorPage<MaintenanceOrderDto>> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const take = limit + 1;

    const orders = await this.prisma.maintenanceOrder.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
        ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.dateFrom || filters.dateTo
          ? {
              createdAt: {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {}),
              },
            }
          : {}),
      },
      include: MAINTENANCE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = orders.length > limit;
    const data = hasMore ? orders.slice(0, limit) : orders;

    return {
      data: data.map(toMaintenanceOrderDto),
      pagination: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<MaintenanceOrderDto> {
    const order = await this.prisma.maintenanceOrder.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: MAINTENANCE_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException({
        error: 'MAINTENANCE_ORDER_NOT_FOUND',
        message: 'Ordem de manutenção não encontrada',
      });
    }

    return toMaintenanceOrderDto(order);
  }

  async create(
    tenantId: string,
    dto: CreateMaintenanceOrderDto,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    return this.prisma.$transaction(async (tx) => {
      // Verify vehicle exists and belongs to tenant
      const vehicle = await tx.vehicle.findFirst({
        where: { id: dto.vehicleId, tenantId, deletedAt: null },
      });

      if (!vehicle) {
        throw new NotFoundException({
          error: 'VEHICLE_NOT_FOUND',
          message: 'Veículo não encontrado',
        });
      }

      const order = await tx.maintenanceOrder.create({
        data: {
          tenantId,
          vehicleId: dto.vehicleId,
          type: dto.type,
          description: dto.description,
          supplierName: dto.supplierName ?? null,
          supplierDocument: dto.supplierDocument ?? null,
          expectedStartAt: dto.expectedStartAt ?? null,
          expectedEndAt: dto.expectedEndAt ?? null,
          status: 'OPEN',
          notes: dto.notes ?? null,
          createdBy: actorId,
          updatedBy: actorId,
        },
        include: MAINTENANCE_INCLUDE,
      });

      // Update vehicle status to IN_MAINTENANCE atomically
      await tx.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'IN_MAINTENANCE', updatedBy: actorId },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: order.id,
          eventType: 'MaintenanceOrderCreated',
          payload: {
            maintenanceOrderId: order.id,
            tenantId,
            vehicleId: dto.vehicleId,
            type: dto.type,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toMaintenanceOrderDto(order);
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateMaintenanceOrderDto,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    const existing = await this.prisma.maintenanceOrder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException({
        error: 'MAINTENANCE_ORDER_NOT_FOUND',
        message: 'Ordem de manutenção não encontrada',
      });
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELED') {
      throw new BadRequestException({
        error: 'MAINTENANCE_ORDER_ALREADY_FINISHED',
        message: 'Não é possível editar uma ordem de manutenção já finalizada ou cancelada',
      });
    }

    const updated = await this.prisma.maintenanceOrder.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.supplierName !== undefined ? { supplierName: dto.supplierName } : {}),
        ...(dto.supplierDocument !== undefined ? { supplierDocument: dto.supplierDocument } : {}),
        ...(dto.expectedStartAt !== undefined ? { expectedStartAt: dto.expectedStartAt } : {}),
        ...(dto.expectedEndAt !== undefined ? { expectedEndAt: dto.expectedEndAt } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: actorId,
      },
      include: MAINTENANCE_INCLUDE,
    });

    return toMaintenanceOrderDto(updated);
  }

  async addItem(
    orderId: string,
    tenantId: string,
    dto: AddMaintenanceItemDto,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.maintenanceOrder.findFirst({
        where: { id: orderId, tenantId, deletedAt: null },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException({
          error: 'MAINTENANCE_ORDER_NOT_FOUND',
          message: 'Ordem de manutenção não encontrada',
        });
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELED') {
        throw new BadRequestException({
          error: 'MAINTENANCE_ORDER_ALREADY_FINISHED',
          message: 'Não é possível adicionar itens em uma ordem de manutenção finalizada ou cancelada',
        });
      }

      const itemTotalCost = dto.quantity * dto.unitCost;

      await tx.maintenanceItem.create({
        data: {
          tenantId,
          maintenanceOrderId: orderId,
          description: dto.description,
          partName: dto.partName ?? null,
          partCode: dto.partCode ?? null,
          quantity: dto.quantity,
          unitCost: dto.unitCost,
          totalCost: itemTotalCost,
        },
      });

      // Recalculate total cost from all items
      const allItems = await tx.maintenanceItem.findMany({
        where: { maintenanceOrderId: orderId, tenantId },
      });

      const newTotalCost = allItems.reduce(
        (sum, item) => sum + parseFloat(item.totalCost.toString()),
        0,
      );

      const updated = await tx.maintenanceOrder.update({
        where: { id: orderId },
        data: {
          totalCost: newTotalCost,
          updatedBy: actorId,
        },
        include: MAINTENANCE_INCLUDE,
      });

      return toMaintenanceOrderDto(updated);
    });
  }

  async removeItem(
    orderId: string,
    itemId: string,
    tenantId: string,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.maintenanceOrder.findFirst({
        where: { id: orderId, tenantId, deletedAt: null },
      });

      if (!order) {
        throw new NotFoundException({
          error: 'MAINTENANCE_ORDER_NOT_FOUND',
          message: 'Ordem de manutenção não encontrada',
        });
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELED') {
        throw new BadRequestException({
          error: 'MAINTENANCE_ORDER_ALREADY_FINISHED',
          message: 'Não é possível remover itens de uma ordem de manutenção finalizada ou cancelada',
        });
      }

      const item = await tx.maintenanceItem.findFirst({
        where: { id: itemId, maintenanceOrderId: orderId, tenantId },
      });

      if (!item) {
        throw new NotFoundException({
          error: 'MAINTENANCE_ITEM_NOT_FOUND',
          message: 'Item de manutenção não encontrado',
        });
      }

      await tx.maintenanceItem.delete({ where: { id: itemId } });

      // Recalculate total cost after removal
      const remainingItems = await tx.maintenanceItem.findMany({
        where: { maintenanceOrderId: orderId, tenantId },
      });

      const newTotalCost = remainingItems.reduce(
        (sum, i) => sum + parseFloat(i.totalCost.toString()),
        0,
      );

      const updated = await tx.maintenanceOrder.update({
        where: { id: orderId },
        data: {
          totalCost: newTotalCost > 0 ? newTotalCost : null,
          updatedBy: actorId,
        },
        include: MAINTENANCE_INCLUDE,
      });

      return toMaintenanceOrderDto(updated);
    });
  }

  async complete(
    id: string,
    tenantId: string,
    dto: CompleteMaintenanceDto,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.maintenanceOrder.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException({
          error: 'MAINTENANCE_ORDER_NOT_FOUND',
          message: 'Ordem de manutenção não encontrada',
        });
      }

      this.validateTransition(order.status as MaintenanceStatus, 'COMPLETED');

      const actualEndAt = dto.actualEndAt ?? new Date();

      // Compute final total cost: use dto.totalCost if given, else sum of items
      let finalTotalCost: number | null = dto.totalCost ?? null;
      if (finalTotalCost === null && order.items.length > 0) {
        finalTotalCost = order.items.reduce(
          (sum, item) => sum + parseFloat(item.totalCost.toString()),
          0,
        );
      }

      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualEndAt,
          ...(finalTotalCost !== null ? { totalCost: finalTotalCost } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          updatedBy: actorId,
        },
        include: MAINTENANCE_INCLUDE,
      });

      // Restore vehicle status to AVAILABLE atomically
      await tx.vehicle.update({
        where: { id: order.vehicleId },
        data: { status: 'AVAILABLE', updatedBy: actorId },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'MaintenanceOrderCompleted',
          payload: {
            maintenanceOrderId: id,
            tenantId,
            vehicleId: order.vehicleId,
            actualEndAt,
            totalCost: finalTotalCost,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toMaintenanceOrderDto(updated);
    });
  }

  async cancel(
    id: string,
    tenantId: string,
    actorId: string,
  ): Promise<MaintenanceOrderDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.maintenanceOrder.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException({
          error: 'MAINTENANCE_ORDER_NOT_FOUND',
          message: 'Ordem de manutenção não encontrada',
        });
      }

      this.validateTransition(order.status as MaintenanceStatus, 'CANCELED');

      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: 'CANCELED',
          updatedBy: actorId,
        },
        include: MAINTENANCE_INCLUDE,
      });

      // If vehicle was set IN_MAINTENANCE due to this order, revert to AVAILABLE.
      // Check that there are no other open/in-progress maintenance orders for this vehicle.
      const otherActiveOrders = await tx.maintenanceOrder.count({
        where: {
          vehicleId: order.vehicleId,
          tenantId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          id: { not: id },
          deletedAt: null,
        },
      });

      if (otherActiveOrders === 0) {
        const vehicle = await tx.vehicle.findFirst({
          where: { id: order.vehicleId, tenantId },
        });

        if (vehicle?.status === 'IN_MAINTENANCE') {
          await tx.vehicle.update({
            where: { id: order.vehicleId },
            data: { status: 'AVAILABLE', updatedBy: actorId },
          });
        }
      }

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateId: id,
          eventType: 'MaintenanceOrderCanceled',
          payload: {
            maintenanceOrderId: id,
            tenantId,
            vehicleId: order.vehicleId,
            actorUserId: actorId,
            occurredAt: new Date(),
          },
        },
      });

      return toMaintenanceOrderDto(updated);
    });
  }

  /**
   * Returns vehicles that have overdue preventive maintenance:
   * no COMPLETED order of type PREVENTIVE in the last 90 days.
   */
  async getPreventiveDue(tenantId: string): Promise<
    Array<{
      vehicleId: string;
      plate: string;
      type: string;
      lastPreventiveAt: Date | null;
      daysSinceLastPreventive: number | null;
    }>
  > {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { not: 'RETIRED' },
      },
      select: {
        id: true,
        plate: true,
        type: true,
        maintenanceOrders: {
          where: {
            tenantId,
            type: 'PREVENTIVE',
            status: 'COMPLETED',
            deletedAt: null,
          },
          orderBy: { actualEndAt: 'desc' },
          take: 1,
          select: { actualEndAt: true, createdAt: true },
        },
      },
    });

    const now = new Date();
    const result: Array<{
      vehicleId: string;
      plate: string;
      type: string;
      lastPreventiveAt: Date | null;
      daysSinceLastPreventive: number | null;
    }> = [];

    for (const vehicle of vehicles) {
      const lastOrder = vehicle.maintenanceOrders[0] ?? null;
      const lastPreventiveAt = lastOrder?.actualEndAt ?? null;

      // If no preventive order ever OR last one was more than 90 days ago
      if (!lastPreventiveAt || lastPreventiveAt < ninetyDaysAgo) {
        const daysSince = lastPreventiveAt
          ? Math.floor((now.getTime() - lastPreventiveAt.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        result.push({
          vehicleId: vehicle.id,
          plate: vehicle.plate,
          type: vehicle.type,
          lastPreventiveAt,
          daysSinceLastPreventive: daysSince,
        });
      }
    }

    return result;
  }
}
