import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateReconciliationDto, ReconciliationResponseDto } from './dto/reconciliation.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class FuelReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async reconcile(tenantId: string, dto: CreateReconciliationDto, actorId: string): Promise<ReconciliationResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch and validate tank
      const tank = await tx.fuelTank.findFirst({
        where: { id: dto.fuelTankId, tenantId, deletedAt: null },
      });
      if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });
      if (tank.status !== 'ACTIVE') throw new BadRequestException({ error: 'FUEL_TANK_INACTIVE', message: 'Tanque não está ativo para reconciliação' });

      const bookStockLiters = Number(tank.currentStockLiters);
      const measuredLiters = dto.measuredLiters;
      const differenceLiters = measuredLiters - bookStockLiters;
      const occurredAt = new Date();

      let status = 'aligned';

      if (differenceLiters !== 0) {
        status = 'adjusted';

        // Update tank current stock
        await tx.fuelTank.update({
          where: { id: tank.id },
          data: { currentStockLiters: measuredLiters },
        });

        // Create a unique source ID for this reconciliation
        const reconciliationId = randomUUID();

        // Create ledger entry (FuelInventoryMovement)
        const movement = await tx.fuelInventoryMovement.create({
          data: {
            tenantId,
            branchId: tank.branchId,
            fuelTankId: tank.id,
            fuelProductId: tank.fuelProductId,
            movementType: 'audit_difference',
            sourceType: 'reconciliation',
            sourceId: reconciliationId,
            quantityLiters: Math.abs(differenceLiters),
            stockBefore: bookStockLiters,
            stockAfter: measuredLiters,
            occurredAt,
            createdByUserId: actorId,
            reason: dto.notes ?? 'Reconciliação física periódica',
          },
        });

        // Create OutboxEvent
        await tx.outboxEvent.create({
          data: {
            tenantId,
            aggregateId: tank.id,
            eventType: 'fuel.stock.reconciled',
            payload: {
              fuelTankId: tank.id,
              reconciliationId,
              differenceLiters,
              stockBefore: bookStockLiters,
              stockAfter: measuredLiters,
            },
          },
        });

        // Log audit
        await this.audit.log({
          tenantId,
          actorUserId: actorId,
          action: 'fuel.reconciliation.created',
          entityType: 'FuelTank',
          entityId: tank.id,
          before: { currentStockLiters: bookStockLiters },
          after: { currentStockLiters: measuredLiters, movementId: movement.id },
        });
      } else {
        // Log aligned reconciliation audit
        await this.audit.log({
          tenantId,
          actorUserId: actorId,
          action: 'fuel.reconciliation.created',
          entityType: 'FuelTank',
          entityId: tank.id,
          after: { status: 'aligned', currentStockLiters: bookStockLiters },
        });
      }

      return {
        fuelTankId: tank.id,
        bookStockLiters,
        measuredLiters,
        differenceLiters,
        status,
        occurredAt,
      };
    });
  }

  async getHistory(tenantId: string, fuelTankId?: string) {
    return this.prisma.fuelInventoryMovement.findMany({
      where: {
        tenantId,
        sourceType: 'reconciliation',
        ...(fuelTankId ? { fuelTankId } : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: 100,
    });
  }
}
