import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type {
  CreateFuelDeliveryDto,
  RegisterDeliveryReceiptDto,
  FuelDeliveryResponseDto,
} from './dto/fuel-delivery.dto';

const DIVERGENCE_ALERT_PERCENT = 3; // alert if difference > 3%

@Injectable()
export class FuelDeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, branchId?: string) {
    const rows = await this.prisma.fuelDelivery.findMany({
      where: { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      orderBy: { deliveryDate: 'desc' },
      take: 100,
    });
    return rows.map((r) => this.toDto(r as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<FuelDeliveryResponseDto> {
    const row = await this.prisma.fuelDelivery.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!row) throw new NotFoundException({ error: 'FUEL_DELIVERY_NOT_FOUND', message: 'Entrega não encontrada' });
    return this.toDto(row as Record<string, unknown>);
  }

  async create(tenantId: string, branchId: string, actorId: string, dto: CreateFuelDeliveryDto): Promise<FuelDeliveryResponseDto> {
    // Supplier must be approved
    const supplier = await this.prisma.fuelSupplier.findFirst({ where: { id: dto.supplierId, tenantId, deletedAt: null } });
    if (!supplier) throw new NotFoundException({ error: 'FUEL_SUPPLIER_NOT_FOUND', message: 'Fornecedor não encontrado' });
    if (!supplier.approved) throw new BadRequestException({ error: 'SUPPLIER_NOT_APPROVED', message: 'Fornecedor não aprovado para recebimento' });

    // Tank must exist and match product
    const tank = await this.prisma.fuelTank.findFirst({ where: { id: dto.fuelTankId, tenantId, deletedAt: null } });
    if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });
    if (tank.status !== 'ACTIVE') throw new BadRequestException({ error: 'FUEL_TANK_INACTIVE', message: 'Tanque não está ativo' });
    if (tank.fuelProductId !== dto.fuelProductId) throw new BadRequestException({ error: 'FUEL_PRODUCT_MISMATCH', message: 'Produto incompatível com o tanque' });

    // Duplicate invoice check
    const dupInvoice = await this.prisma.fuelDelivery.findFirst({
      where: { tenantId, supplierId: dto.supplierId, invoiceNumber: dto.invoiceNumber, deletedAt: null },
    });
    if (dupInvoice) throw new ConflictException({ error: 'DUPLICATE_INVOICE', message: 'Nota fiscal já registrada para este fornecedor', details: { existingId: dupInvoice.id } });

    const delivery = await this.prisma.fuelDelivery.create({
      data: {
        tenantId, branchId,
        supplierId: dto.supplierId,
        fuelProductId: dto.fuelProductId,
        fuelTankId: dto.fuelTankId,
        deliveryDate: new Date(dto.deliveryDate),
        invoiceNumber: dto.invoiceNumber,
        invoiceAccessKey: dto.invoiceAccessKey ?? null,
        contractedLiters: dto.contractedLiters,
        declaredLiters: dto.declaredLiters,
        unitPrice: dto.unitPrice,
        totalAmount: dto.totalAmount,
        carrierName: dto.carrierName ?? null,
        carrierDocument: dto.carrierDocument ?? null,
        tankerPlate: dto.tankerPlate ?? null,
        tankerTrailerPlate: dto.tankerTrailerPlate ?? null,
        tankerDriverName: dto.tankerDriverName ?? null,
        tankerDriverDocument: dto.tankerDriverDocument ?? null,
        sealNumbers: (dto.sealNumbers ?? null) as never,
        notes: dto.notes ?? null,
        status: 'arrived',
        receivedByUserId: actorId,
      },
    });

    await this.audit.log({
      tenantId, actorUserId: actorId, action: 'fuel.delivery.received',
      entityType: 'FuelDelivery', entityId: delivery.id,
      after: { invoiceNumber: dto.invoiceNumber, declaredLiters: dto.declaredLiters },
    });

    return this.toDto(delivery as Record<string, unknown>);
  }

  async registerReceipt(id: string, tenantId: string, actorId: string, dto: RegisterDeliveryReceiptDto): Promise<FuelDeliveryResponseDto> {
    const delivery = await this.prisma.fuelDelivery.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!delivery) throw new NotFoundException({ error: 'FUEL_DELIVERY_NOT_FOUND', message: 'Entrega não encontrada' });
    if (!['arrived', 'unloading'].includes(delivery.status)) {
      throw new BadRequestException({ error: 'INVALID_STATUS', message: `Status '${delivery.status}' não permite registro de recebimento` });
    }

    const tank = await this.prisma.fuelTank.findFirst({ where: { id: delivery.fuelTankId, tenantId } });
    if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });

    // Capacity check
    const currentStock = Number(tank.currentStockLiters);
    if (currentStock + dto.receivedLiters > Number(tank.capacityLiters)) {
      throw new BadRequestException({
        error: 'TANK_CAPACITY_EXCEEDED',
        message: `Tanque sem capacidade. Disponível: ${(Number(tank.capacityLiters) - currentStock).toFixed(3)}L, Tentativa: ${dto.receivedLiters}L`,
      });
    }

    const differenceLiters = dto.receivedLiters - Number(delivery.declaredLiters);
    const differencePercent = (differenceLiters / Number(delivery.declaredLiters)) * 100;
    const status = Math.abs(differencePercent) > DIVERGENCE_ALERT_PERCENT ? 'under_review' : 'received';

    const updated = await this.prisma.fuelDelivery.update({
      where: { id },
      data: {
        receivedLiters: dto.receivedLiters,
        acceptedLiters: dto.receivedLiters,
        beforeTankLevelLiters: dto.beforeTankLevelLiters,
        afterTankLevelLiters: dto.afterTankLevelLiters,
        differenceLiters,
        differencePercent,
        status,
        notes: dto.notes ?? delivery.notes,
      },
    });

    if (differencePercent !== 0) {
      await this.prisma.outboxEvent.create({
        data: {
          tenantId, aggregateId: id, eventType: 'fuel.stock.divergence_detected',
          payload: { fuelDeliveryId: id, differenceLiters, differencePercent: differencePercent.toFixed(2) },
        },
      });
    }

    return this.toDto(updated as Record<string, unknown>);
  }

  async approve(id: string, tenantId: string, approverUserId: string): Promise<FuelDeliveryResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const delivery = await tx.fuelDelivery.findFirst({ where: { id, tenantId, deletedAt: null } });
      if (!delivery) throw new NotFoundException({ error: 'FUEL_DELIVERY_NOT_FOUND', message: 'Entrega não encontrada' });
      if (!['received', 'under_review'].includes(delivery.status)) {
        throw new BadRequestException({ error: 'INVALID_STATUS_FOR_APPROVAL', message: `Status '${delivery.status}' não permite aprovação` });
      }
      if (!delivery.receivedLiters) throw new BadRequestException({ error: 'RECEIVED_LITERS_MISSING', message: 'Litros recebidos não registrados' });

      const acceptedLiters = Number(delivery.receivedLiters);
      const tank = await tx.fuelTank.findFirst({ where: { id: delivery.fuelTankId, tenantId } });
      if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });

      const stockBefore = Number(tank.currentStockLiters);
      const newStock = stockBefore + acceptedLiters;

      // Update delivery
      const updated = await tx.fuelDelivery.update({
        where: { id },
        data: { status: 'approved', acceptedLiters, approvedByUserId: approverUserId, approvedAt: new Date() },
      });

      // Update tank stock
      await tx.fuelTank.update({ where: { id: delivery.fuelTankId }, data: { currentStockLiters: newStock } });

      // Livro razão — delivery_in
      await tx.fuelInventoryMovement.create({
        data: {
          tenantId,
          branchId: delivery.branchId,
          fuelTankId: delivery.fuelTankId,
          fuelProductId: delivery.fuelProductId,
          movementType: 'delivery_in',
          sourceType: 'delivery',
          sourceId: id,
          quantityLiters: acceptedLiters,
          unitCost: Number(delivery.unitPrice),
          totalCost: Number(delivery.unitPrice) * acceptedLiters,
          stockBefore,
          stockAfter: newStock,
          occurredAt: new Date(),
          createdByUserId: approverUserId,
          reason: `Entrega aprovada — NF ${delivery.invoiceNumber}`,
        },
      });

      // OutboxEvent
      await tx.outboxEvent.create({
        data: {
          tenantId, aggregateId: id, eventType: 'fuel.delivery.approved',
          payload: { fuelDeliveryId: id, fuelTankId: delivery.fuelTankId, acceptedLiters, stockAfter: newStock },
        },
      });

      await this.audit.log({
        tenantId, actorUserId: approverUserId, action: 'fuel.delivery.approved',
        entityType: 'FuelDelivery', entityId: id,
        after: { acceptedLiters, stockAfter: newStock },
      });

      return this.toDto(updated as Record<string, unknown>);
    });
  }

  async addEvidence(id: string, tenantId: string, uploaderUserId: string, body: { type: string; fileUrl: string; metadata?: unknown }) {
    await this.findById(id, tenantId);
    return this.prisma.fuelDeliveryEvidence.create({
      data: {
        tenantId, fuelDeliveryId: id, type: body.type, fileUrl: body.fileUrl,
        metadata: (body.metadata ?? null) as never, uploadedByUserId: uploaderUserId,
      },
    });
  }

  private toDto(r: Record<string, unknown>): FuelDeliveryResponseDto {
    const n = (v: unknown) => (v !== null && v !== undefined ? Number(v) : null);
    return {
      ...(r as FuelDeliveryResponseDto),
      contractedLiters: Number(r['contractedLiters']),
      declaredLiters: Number(r['declaredLiters']),
      receivedLiters: n(r['receivedLiters']),
      acceptedLiters: n(r['acceptedLiters']),
      rejectedLiters: n(r['rejectedLiters']),
      unitPrice: Number(r['unitPrice']),
      totalAmount: Number(r['totalAmount']),
      beforeTankLevelLiters: n(r['beforeTankLevelLiters']),
      afterTankLevelLiters: n(r['afterTankLevelLiters']),
      differenceLiters: n(r['differenceLiters']),
      differencePercent: n(r['differencePercent']),
    };
  }
}
