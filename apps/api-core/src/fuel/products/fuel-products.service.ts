import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateFuelProductDto, FuelProductResponseDto } from './dto/fuel-product.dto';

@Injectable()
export class FuelProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<FuelProductResponseDto[]> {
    const products = await this.prisma.fuelProduct.findMany({
      where: {
        active: true,
        OR: [{ tenantId }, { tenantId: null }],
      },
      orderBy: { name: 'asc' },
    });
    return products.map((item) => this.toDto(item));
  }

  async findById(id: string, tenantId: string): Promise<FuelProductResponseDto> {
    const product = await this.prisma.fuelProduct.findFirst({
      where: { id, active: true, OR: [{ tenantId }, { tenantId: null }] },
    });
    if (!product) {
      throw new NotFoundException({ error: 'FUEL_PRODUCT_NOT_FOUND', message: 'Produto de combustível não encontrado' });
    }
    return this.toDto(product);
  }

  async create(tenantId: string, dto: CreateFuelProductDto): Promise<FuelProductResponseDto> {
    const exists = await this.prisma.fuelProduct.findFirst({
      where: { code: dto.code, active: true },
    });
    if (exists) {
      throw new ConflictException({ error: 'FUEL_PRODUCT_CODE_EXISTS', message: 'Código de produto já existe' });
    }
    const product = await this.prisma.fuelProduct.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        unit: dto.unit ?? 'liter',
        active: true,
      },
    });
    return this.toDto(product);
  }

  private toDto(p: { id: string; tenantId: string | null; code: string; name: string; type: string; unit: string; active: boolean }): FuelProductResponseDto {
    return { id: p.id, tenantId: p.tenantId, code: p.code, name: p.name, type: p.type, unit: p.unit, active: p.active };
  }
}
