import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateFuelIncidentDto, ResolveFuelIncidentDto } from './dto/fuel-incident.dto';

@Injectable()
export class FuelIncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, filters?: { branchId?: string | undefined; severity?: string | undefined; status?: string | undefined }) {
    return this.prisma.fuelIncident.findMany({
      where: {
        tenantId,
        ...(filters?.branchId ? { branchId: filters.branchId } : {}),
        ...(filters?.severity ? { severity: filters.severity } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  async findById(id: string, tenantId: string) {
    const incident = await this.prisma.fuelIncident.findFirst({ where: { id, tenantId } });
    if (!incident) throw new NotFoundException({ error: 'FUEL_INCIDENT_NOT_FOUND', message: 'Incidente não encontrado' });
    return incident;
  }

  async create(tenantId: string, actorId: string, dto: CreateFuelIncidentDto) {
    // Validate branch
    const branch = await this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId } });
    if (!branch) throw new NotFoundException({ error: 'BRANCH_NOT_FOUND', message: 'Filial não encontrada' });

    const incident = await this.prisma.fuelIncident.create({
      data: {
        tenantId,
        branchId: dto.branchId,
        relatedInternalFuelingId: dto.relatedInternalFuelingId ?? null,
        relatedExternalFuelingId: dto.relatedExternalFuelingId ?? null,
        relatedFuelDeliveryId: dto.relatedFuelDeliveryId ?? null,
        vehicleId: dto.vehicleId ?? null,
        fuelTankId: dto.fuelTankId ?? null,
        attendantUserId: actorId,
        severity: dto.severity,
        type: dto.type,
        description: dto.description,
        status: 'open',
        responsibleUserId: dto.responsibleUserId ?? actorId,
      },
    });

    await this.audit.log({
      tenantId, actorUserId: actorId, action: 'fuel.incident.created',
      entityType: 'FuelIncident', entityId: incident.id,
      after: { severity: dto.severity, type: dto.type },
    });

    return incident;
  }

  async resolve(id: string, tenantId: string, resolverUserId: string, dto: ResolveFuelIncidentDto) {
    const incident = await this.findById(id, tenantId);
    if (['resolved', 'dismissed'].includes(incident.status)) {
      throw new BadRequestException({ error: 'INCIDENT_ALREADY_CLOSED', message: 'Incidente já foi encerrado' });
    }

    const updated = await this.prisma.fuelIncident.update({
      where: { id },
      data: { status: 'resolved', resolution: dto.resolution, resolvedAt: new Date(), responsibleUserId: resolverUserId },
    });

    await this.audit.log({
      tenantId, actorUserId: resolverUserId, action: 'fuel.incident.resolved',
      entityType: 'FuelIncident', entityId: id, after: { resolution: dto.resolution },
    });

    return updated;
  }

  /**
   * Automatically creates a critical incident from a business rule violation.
   * Called internally by other services.
   */
  async createAutomatic(tenantId: string, branchId: string, params: {
    type: string;
    description: string;
    severity: string;
    relatedInternalFuelingId?: string;
    relatedExternalFuelingId?: string;
    relatedFuelDeliveryId?: string;
    vehicleId?: string;
    fuelTankId?: string;
  }) {
    return this.prisma.fuelIncident.create({
      data: {
        tenantId, branchId,
        type: params.type,
        description: params.description,
        severity: params.severity,
        status: 'open',
        relatedInternalFuelingId: params.relatedInternalFuelingId ?? null,
        relatedExternalFuelingId: params.relatedExternalFuelingId ?? null,
        relatedFuelDeliveryId: params.relatedFuelDeliveryId ?? null,
        vehicleId: params.vehicleId ?? null,
        fuelTankId: params.fuelTankId ?? null,
      },
    });
  }
}
