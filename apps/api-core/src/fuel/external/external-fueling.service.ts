import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateExternalFuelingDto } from './dto/external-fueling.dto';

const ANOMALY_THRESHOLD = 0.8;
const HISTORY_SIZE = 10;

@Injectable()
export class ExternalFuelingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, filters?: { vehicleId?: string | undefined; driverId?: string | undefined; status?: string | undefined }) {
    const rows = await this.prisma.externalFueling.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters?.driverId ? { driverId: filters.driverId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => this.toDto(r as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string) {
    const row = await this.prisma.externalFueling.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!row) throw new NotFoundException({ error: 'EXTERNAL_FUELING_NOT_FOUND', message: 'Abastecimento externo não encontrado' });
    return this.toDto(row as Record<string, unknown>);
  }

  async create(tenantId: string, dto: CreateExternalFuelingDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Idempotency
      if (dto.idempotencyKey) {
        const existing = await tx.externalFueling.findFirst({ where: { tenantId, idempotencyKey: dto.idempotencyKey } });
        if (existing) return this.toDto(existing as Record<string, unknown>);
      }

      // Vehicle validation
      const vehicle = await tx.vehicle.findFirst({ where: { id: dto.vehicleId, tenantId, deletedAt: null } });
      if (!vehicle) throw new NotFoundException({ error: 'VEHICLE_NOT_FOUND', message: 'Veículo não encontrado' });

      // Driver validation
      const driver = await tx.driver.findFirst({ where: { id: dto.driverId, tenantId, deletedAt: null } });
      if (!driver) throw new NotFoundException({ error: 'DRIVER_NOT_FOUND', message: 'Motorista não encontrado' });

      // Odometer validation
      const lastRecord = await tx.externalFueling.findFirst({
        where: { vehicleId: dto.vehicleId, tenantId, deletedAt: null, status: { notIn: ['rejected'] } },
        orderBy: { odometer: 'desc' }, select: { odometer: true },
      });
      if (lastRecord && dto.odometer < Number(lastRecord.odometer)) {
        throw new BadRequestException({
          error: 'ODOMETER_INVALID',
          message: 'Hodômetro não pode ser menor que o último registro',
          details: { last: Number(lastRecord.odometer), submitted: dto.odometer },
        });
      }

      // Anomaly detection (km/l)
      let anomalyFlag = false;
      let anomalyReason: string | null = null;
      const prevFueling = await tx.externalFueling.findFirst({
        where: { vehicleId: dto.vehicleId, tenantId, status: 'approved', deletedAt: null },
        orderBy: { occurredAt: 'desc' }, select: { odometer: true },
      });
      if (prevFueling && dto.liters > 0) {
        const km = dto.odometer - Number(prevFueling.odometer);
        if (km > 0) {
          const currentKmL = km / dto.liters;
          const history = await tx.externalFueling.findMany({
            where: { vehicleId: dto.vehicleId, tenantId, anomalyFlag: false, status: 'approved' },
            orderBy: { occurredAt: 'desc' }, take: HISTORY_SIZE, select: { odometer: true, liters: true },
          });
          if (history.length >= 2) {
            const kmls: number[] = [];
            for (let i = 0; i < history.length - 1; i++) {
              const d = Number(history[i]!.odometer) - Number(history[i + 1]!.odometer);
              const l = Number(history[i]!.liters);
              if (d > 0 && l > 0) kmls.push(d / l);
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

      // Station validation: if station provided, check if approved
      let stationAnomalyFlag = false;
      if (dto.fuelStationId) {
        const station = await tx.fuelStation.findFirst({ where: { id: dto.fuelStationId, tenantId } });
        if (!station) throw new NotFoundException({ error: 'FUEL_STATION_NOT_FOUND', message: 'Posto não encontrado' });
        if (station.status !== 'ACTIVE') stationAnomalyFlag = true;
      } else if (!dto.stationNameFree) {
        // Emergency fueling — flag
        stationAnomalyFlag = true;
        if (!anomalyReason) anomalyReason = 'Posto não cadastrado — revisão necessária';
        anomalyFlag = true;
      }

      // Determine status
      const status = anomalyFlag || stationAnomalyFlag ? 'under_review' : 'submitted';

      const fueling = await tx.externalFueling.create({
        data: {
          tenantId,
          branchId: dto.branchId ?? null,
          vehicleId: dto.vehicleId,
          driverId: dto.driverId,
          fuelStationId: dto.fuelStationId ?? null,
          stationNameFree: dto.stationNameFree ?? null,
          fuelProductId: dto.fuelProductId,
          odometer: dto.odometer,
          liters: dto.liters,
          unitPrice: dto.unitPrice,
          totalAmount: dto.totalAmount,
          paymentMethod: dto.paymentMethod,
          receiptNumber: dto.receiptNumber ?? null,
          receiptPhotoUrl: dto.receiptPhotoUrl ?? null,
          receiptAccessKey: dto.receiptAccessKey ?? null,
          occurredAt: new Date(dto.occurredAt),
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          tripId: dto.tripId ?? null,
          status,
          anomalyFlag,
          anomalyReason,
          clientGeneratedId: dto.clientGeneratedId ?? null,
          deviceId: dto.deviceId ?? null,
          localCreatedAt: dto.localCreatedAt ? new Date(dto.localCreatedAt) : null,
          idempotencyKey: dto.idempotencyKey ?? null,
        },
      });

      // Update vehicle odometer
      await tx.vehicle.update({ where: { id: dto.vehicleId }, data: { currentOdometer: dto.odometer } });

      // OutboxEvent
      await tx.outboxEvent.create({
        data: {
          tenantId, aggregateId: fueling.id, eventType: 'fuel.external.submitted',
          payload: { externalFuelingId: fueling.id, vehicleId: dto.vehicleId, liters: dto.liters, status, anomalyFlag },
        },
      });

      await this.audit.log({
        tenantId, actorUserId: actorId, action: 'fuel.external.submitted',
        entityType: 'ExternalFueling', entityId: fueling.id,
        after: { liters: dto.liters, vehicleId: dto.vehicleId, status, anomalyFlag },
      });

      return this.toDto(fueling as Record<string, unknown>);
    });
  }

  async approve(id: string, tenantId: string, approverUserId: string) {
    const fueling = await this.prisma.externalFueling.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!fueling) throw new NotFoundException({ error: 'EXTERNAL_FUELING_NOT_FOUND', message: 'Abastecimento não encontrado' });
    if (!['submitted', 'under_review'].includes(fueling.status)) {
      throw new BadRequestException({ error: 'INVALID_STATUS_FOR_APPROVAL', message: `Status '${fueling.status}' não permite aprovação` });
    }

    const updated = await this.prisma.externalFueling.update({
      where: { id },
      data: { status: 'approved', approvedByUserId: approverUserId, approvedAt: new Date() },
    });

    await this.audit.log({ tenantId, actorUserId: approverUserId, action: 'fuel.external.approved', entityType: 'ExternalFueling', entityId: id });
    await this.prisma.outboxEvent.create({
      data: {
        tenantId, aggregateId: id, eventType: 'fuel.external.approved',
        payload: { externalFuelingId: id, approvedByUserId: approverUserId },
      },
    });

    return this.toDto(updated as Record<string, unknown>);
  }

  async addEvidence(id: string, tenantId: string, uploaderUserId: string, body: { type: string; fileUrl: string; metadata?: unknown }) {
    await this.findById(id, tenantId);
    return this.prisma.externalFuelingEvidence.create({
      data: {
        tenantId, externalFuelingId: id, type: body.type, fileUrl: body.fileUrl,
        metadata: (body.metadata ?? null) as never, uploadedByUserId: uploaderUserId,
      },
    });
  }

  private toDto(r: Record<string, unknown>) {
    const n = (v: unknown) => (v !== null && v !== undefined ? Number(v) : null);
    return {
      ...r,
      odometer: Number(r['odometer']),
      liters: Number(r['liters']),
      unitPrice: Number(r['unitPrice']),
      totalAmount: Number(r['totalAmount']),
      latitude: n(r['latitude']),
      longitude: n(r['longitude']),
    };
  }
}
