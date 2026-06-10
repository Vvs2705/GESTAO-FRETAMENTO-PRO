import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateInternalFuelingDto, InternalFuelingResponseDto } from './dto/internal-fueling.dto';

const ANOMALY_THRESHOLD = 0.8;
const HISTORY_SIZE = 10;

@Injectable()
export class InternalFuelingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, filters?: { branchId?: string | undefined; vehicleId?: string | undefined; status?: string | undefined }) {
    const rows = await this.prisma.internalFueling.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters?.branchId ? { branchId: filters.branchId } : {}),
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => this.toDto(r as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<InternalFuelingResponseDto> {
    const row = await this.prisma.internalFueling.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!row) throw new NotFoundException({ error: 'INTERNAL_FUELING_NOT_FOUND', message: 'Abastecimento interno não encontrado' });
    return this.toDto(row as Record<string, unknown>);
  }

  async create(
    tenantId: string,
    branchId: string,
    attendantUserId: string,
    dto: CreateInternalFuelingDto,
  ): Promise<InternalFuelingResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Idempotency
      if (dto.idempotencyKey) {
        const existing = await tx.internalFueling.findFirst({ where: { tenantId, idempotencyKey: dto.idempotencyKey } });
        if (existing) return this.toDto(existing as Record<string, unknown>);
      }

      // 2. Vehicle
      const vehicle = await tx.vehicle.findFirst({ where: { id: dto.vehicleId, tenantId, deletedAt: null } });
      if (!vehicle) throw new NotFoundException({ error: 'VEHICLE_NOT_FOUND', message: 'Veículo não encontrado' });
      if (vehicle.status === 'IN_MAINTENANCE') throw new BadRequestException({ error: 'VEHICLE_IN_MAINTENANCE', message: 'Veículo em manutenção' });
      if (vehicle.status === 'UNAVAILABLE' || vehicle.status === 'RETIRED') throw new BadRequestException({ error: 'VEHICLE_BLOCKED', message: 'Veículo bloqueado' });

      // 3. Tank
      const tank = await tx.fuelTank.findFirst({ where: { id: dto.fuelTankId, tenantId, deletedAt: null } });
      if (!tank) throw new NotFoundException({ error: 'FUEL_TANK_NOT_FOUND', message: 'Tanque não encontrado' });
      if (tank.status !== 'ACTIVE') throw new BadRequestException({ error: 'FUEL_TANK_INACTIVE', message: 'Tanque não está ativo' });
      if (tank.fuelProductId !== dto.fuelProductId) throw new BadRequestException({ error: 'FUEL_PRODUCT_MISMATCH', message: 'Produto incompatível com o tanque' });

      const currentStock = Number(tank.currentStockLiters);
      if (dto.liters > currentStock) {
        throw new BadRequestException({
          error: 'INSUFFICIENT_STOCK',
          message: `Estoque insuficiente. Disponível: ${currentStock.toFixed(3)}L, Solicitado: ${dto.liters}L`,
        });
      }

      // 4. Pump
      if (dto.fuelPumpId) {
        const pump = await tx.fuelPump.findFirst({ where: { id: dto.fuelPumpId, fuelTankId: dto.fuelTankId, tenantId } });
        if (!pump) throw new NotFoundException({ error: 'FUEL_PUMP_NOT_FOUND', message: 'Bomba não pertence ao tanque' });
        if (pump.status !== 'ACTIVE') throw new BadRequestException({ error: 'FUEL_PUMP_INACTIVE', message: 'Bomba inativa' });
      }

      // 5. Attendant ABAC
      const attendantProfile = await tx.fuelAttendantProfile.findFirst({ where: { userId: attendantUserId, tenantId } });
      if (attendantProfile) {
        const allowedTanks = attendantProfile.allowedTankIds as string[];
        const allowedBranches = attendantProfile.allowedBranchIds as string[];
        if (allowedTanks.length > 0 && !allowedTanks.includes(dto.fuelTankId))
          throw new ForbiddenException({ error: 'ATTENDANT_TANK_NOT_AUTHORIZED', message: 'Abastecedor não autorizado para este tanque' });
        if (allowedBranches.length > 0 && !allowedBranches.includes(branchId))
          throw new ForbiddenException({ error: 'ATTENDANT_BRANCH_NOT_AUTHORIZED', message: 'Abastecedor não autorizado para esta filial' });
      }

      // 6. Odometer
      const lastRecord = await tx.internalFueling.findFirst({
        where: { vehicleId: dto.vehicleId, tenantId, deletedAt: null, status: { notIn: ['rejected'] } },
        orderBy: { odometer: 'desc' },
        select: { odometer: true },
      });
      if (lastRecord && dto.odometer < Number(lastRecord.odometer)) {
        throw new BadRequestException({
          error: 'ODOMETER_INVALID',
          message: 'Hodômetro não pode ser menor que o último registro',
          details: { last: Number(lastRecord.odometer), submitted: dto.odometer },
        });
      }

      // 7. Duplicate detection
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      const duplicate = await tx.internalFueling.findFirst({
        where: { vehicleId: dto.vehicleId, fuelTankId: dto.fuelTankId, tenantId, occurredAt: { gte: thirtyMinAgo }, status: { notIn: ['rejected', 'corrected'] } },
      });
      if (duplicate) throw new ConflictException({ error: 'DUPLICATE_FUELING', message: 'Abastecimento duplicado detectado (mesmo veículo e tanque nos últimos 30 minutos)', details: { existingId: duplicate.id } });

      // 8. Anomaly detection
      let anomalyFlag = false;
      let anomalyReason: string | null = null;
      const prevFueling = await tx.internalFueling.findFirst({
        where: { vehicleId: dto.vehicleId, tenantId, status: 'approved', deletedAt: null },
        orderBy: { occurredAt: 'desc' }, select: { odometer: true },
      });
      if (prevFueling && dto.liters > 0) {
        const kmTraveled = dto.odometer - Number(prevFueling.odometer);
        if (kmTraveled > 0) {
          const currentKmL = kmTraveled / dto.liters;
          const history = await tx.internalFueling.findMany({
            where: { vehicleId: dto.vehicleId, tenantId, anomalyFlag: false, status: 'approved' },
            orderBy: { occurredAt: 'desc' }, take: HISTORY_SIZE, select: { odometer: true, liters: true },
          });
          if (history.length >= 2) {
            const kmls: number[] = [];
            for (let i = 0; i < history.length - 1; i++) {
              const km = Number(history[i]!.odometer) - Number(history[i + 1]!.odometer);
              const lit = Number(history[i]!.liters);
              if (km > 0 && lit > 0) kmls.push(km / lit);
            }
            if (kmls.length > 0) {
              const avg = kmls.reduce((a, b) => a + b, 0) / kmls.length;
              if (currentKmL < avg * ANOMALY_THRESHOLD) {
                anomalyFlag = true;
                anomalyReason = `km/l atual (${currentKmL.toFixed(2)}) abaixo de 80% da média histórica (${avg.toFixed(2)} km/l)`;
              }
            }
          }
        }
      }

      // 9. Unit cost from last approved delivery
      const lastDelivery = await tx.fuelDelivery.findFirst({
        where: { fuelTankId: dto.fuelTankId, tenantId, status: 'approved' },
        orderBy: { deliveryDate: 'desc' }, select: { unitPrice: true },
      });
      const unitCost = lastDelivery ? Number(lastDelivery.unitPrice) : null;
      const totalCost = unitCost !== null ? unitCost * dto.liters : null;
      const stockBefore = currentStock;
      const newStock = stockBefore - dto.liters;

      // 10. Create
      const fueling = await tx.internalFueling.create({
        data: {
          tenantId, branchId, vehicleId: dto.vehicleId, driverId: dto.driverId ?? null,
          attendantUserId, fuelTankId: dto.fuelTankId, fuelPumpId: dto.fuelPumpId ?? null,
          fuelProductId: dto.fuelProductId, odometer: dto.odometer, hourmeter: dto.hourmeter ?? null,
          liters: dto.liters, meterBefore: dto.meterBefore ?? null, meterAfter: dto.meterAfter ?? null,
          unitCostCalculated: unitCost, totalCostCalculated: totalCost,
          tripId: dto.tripId ?? null, routeId: dto.routeId ?? null,
          occurredAt: new Date(dto.occurredAt),
          latitude: dto.latitude ?? null, longitude: dto.longitude ?? null,
          status: anomalyFlag ? 'under_review' : 'completed',
          anomalyFlag, anomalyReason,
          clientGeneratedId: dto.clientGeneratedId ?? null, deviceId: dto.deviceId ?? null,
          localCreatedAt: dto.localCreatedAt ? new Date(dto.localCreatedAt) : null,
          idempotencyKey: dto.idempotencyKey ?? null,
        },
      });

      // 11. Stock update
      await tx.fuelTank.update({ where: { id: dto.fuelTankId }, data: { currentStockLiters: newStock } });

      // 12. Livro razão (append-only)
      await tx.fuelInventoryMovement.create({
        data: {
          tenantId, branchId, fuelTankId: dto.fuelTankId, fuelProductId: dto.fuelProductId,
          movementType: 'internal_fueling_out', sourceType: 'fueling', sourceId: fueling.id,
          quantityLiters: dto.liters, unitCost, totalCost,
          stockBefore, stockAfter: newStock,
          occurredAt: new Date(dto.occurredAt), createdByUserId: attendantUserId,
          reason: `Abastecimento interno — veículo ${dto.vehicleId}`,
        },
      });

      // 13. Vehicle odometer
      await tx.vehicle.update({ where: { id: dto.vehicleId }, data: { currentOdometer: dto.odometer } });

      // 14. Events
      await tx.outboxEvent.create({
        data: {
          tenantId, aggregateId: fueling.id, eventType: 'fuel.internal.completed',
          payload: { internalFuelingId: fueling.id, vehicleId: dto.vehicleId, fuelTankId: dto.fuelTankId, liters: dto.liters, stockAfter: newStock, anomalyFlag },
        },
      });
      if (newStock <= Number(tank.minimumStockLiters)) {
        await tx.outboxEvent.create({
          data: {
            tenantId, aggregateId: dto.fuelTankId, eventType: 'fuel.stock.low',
            payload: { fuelTankId: dto.fuelTankId, branchId, currentStock: newStock, minimumStock: Number(tank.minimumStockLiters) },
          },
        });
      }

      // 15. Audit
      await this.audit.log({
        tenantId, actorUserId: attendantUserId,
        action: 'fuel.internal.created', entityType: 'InternalFueling', entityId: fueling.id,
        after: { liters: dto.liters, vehicleId: dto.vehicleId, fuelTankId: dto.fuelTankId, anomalyFlag },
      });

      return this.toDto(fueling as Record<string, unknown>);
    });
  }

  async approve(id: string, tenantId: string, approverUserId: string): Promise<InternalFuelingResponseDto> {
    const fueling = await this.prisma.internalFueling.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!fueling) throw new NotFoundException({ error: 'INTERNAL_FUELING_NOT_FOUND', message: 'Abastecimento não encontrado' });
    if (!['completed', 'under_review'].includes(fueling.status)) {
      throw new BadRequestException({ error: 'INVALID_STATUS_FOR_APPROVAL', message: `Status '${fueling.status}' não permite aprovação` });
    }
    const updated = await this.prisma.internalFueling.update({
      where: { id },
      data: { status: 'approved', approvedByUserId: approverUserId, approvedAt: new Date() },
    });
    await this.audit.log({ tenantId, actorUserId: approverUserId, action: 'fuel.internal.approved', entityType: 'InternalFueling', entityId: id });
    await this.prisma.outboxEvent.create({
      data: {
        tenantId, aggregateId: id, eventType: 'fuel.internal.approved',
        payload: { internalFuelingId: id, approvedByUserId: approverUserId },
      },
    });
    return this.toDto(updated as Record<string, unknown>);
  }

  async addEvidence(id: string, tenantId: string, uploaderUserId: string, body: { type: string; fileUrl: string; metadata?: unknown }) {
    await this.findById(id, tenantId);
    return this.prisma.internalFuelingEvidence.create({
      data: {
        tenantId, internalFuelingId: id, type: body.type, fileUrl: body.fileUrl,
        metadata: (body.metadata ?? null) as never, uploadedByUserId: uploaderUserId,
      },
    });
  }

  private toDto(f: Record<string, unknown>): InternalFuelingResponseDto {
    const n = (v: unknown) => (v !== null && v !== undefined ? Number(v) : null);
    return {
      ...(f as unknown as InternalFuelingResponseDto),
      odometer: Number(f['odometer']),
      liters: Number(f['liters']),
      hourmeter: n(f['hourmeter']),
      meterBefore: n(f['meterBefore']),
      meterAfter: n(f['meterAfter']),
      unitCostCalculated: n(f['unitCostCalculated']),
      totalCostCalculated: n(f['totalCostCalculated']),
    };
  }
}
