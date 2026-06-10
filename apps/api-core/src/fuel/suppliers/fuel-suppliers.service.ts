import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import type { CreateFuelSupplierDto, FuelSupplierResponseDto } from './dto/fuel-supplier.dto';

@Injectable()
export class FuelSuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string): Promise<FuelSupplierResponseDto[]> {
    const suppliers = await this.prisma.fuelSupplier.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { legalName: 'asc' },
    });
    return suppliers.map((s) => this.toDto(s as unknown as Record<string, unknown>));
  }

  async findById(id: string, tenantId: string): Promise<FuelSupplierResponseDto> {
    const s = await this.prisma.fuelSupplier.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!s) throw new NotFoundException({ error: 'FUEL_SUPPLIER_NOT_FOUND', message: 'Fornecedor não encontrado' });
    return this.toDto(s as unknown as Record<string, unknown>);
  }

  async create(tenantId: string, dto: CreateFuelSupplierDto, actorId: string): Promise<FuelSupplierResponseDto> {
    const exists = await this.prisma.fuelSupplier.findFirst({ where: { tenantId, document: dto.document, deletedAt: null } });
    if (exists) throw new ConflictException({ error: 'FUEL_SUPPLIER_DOCUMENT_EXISTS', message: 'Fornecedor com este CNPJ já cadastrado' });

    const supplier = await this.prisma.fuelSupplier.create({
      data: { tenantId, ...dto, approved: false, status: 'ACTIVE' },
    });

    await this.audit.log({ tenantId, actorUserId: actorId, action: 'fuel.supplier.created', entityType: 'FuelSupplier', entityId: supplier.id, after: supplier });
    return this.toDto(supplier as unknown as Record<string, unknown>);
  }

  async approve(id: string, tenantId: string, approved: boolean, actorId: string): Promise<FuelSupplierResponseDto> {
    await this.findById(id, tenantId);
    const supplier = await this.prisma.fuelSupplier.update({
      where: { id },
      data: { approved },
    });
    await this.audit.log({ tenantId, actorUserId: actorId, action: approved ? 'fuel.supplier.approved' : 'fuel.supplier.rejected', entityType: 'FuelSupplier', entityId: id });
    return this.toDto(supplier as unknown as Record<string, unknown>);
  }

  private toDto(s: Record<string, unknown>): FuelSupplierResponseDto {
    return s as unknown as FuelSupplierResponseDto;
  }
}
