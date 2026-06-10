/**
 * fuel-features.spec.ts
 *
 * Integration tests for:
 *   - CostCenter CRUD operations
 *   - FuelStation CRUD operations
 *   - FuelAttendantProfile CRUD operations
 *   - FuelReconciliation Service (physical stock audit & ledger movements)
 *   - FuelSummary Worker Service (cron daily summaries & tank snapshots)
 *
 * REQUIREMENTS:
 *   - DATABASE_URL/TEST_DATABASE_URL must point to a real PostgreSQL database.
 *   - Run: pnpm test src/tests/fuel-features.spec.ts
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { CostCentersService } from '../finance/cost-centers/cost-centers.service';
import { FuelStationsService } from '../fuel/stations/fuel-stations.service';
import { FuelAttendantsService } from '../fuel/attendants/fuel-attendants.service';
import { FuelReconciliationService } from '../fuel/reconciliation/fuel-reconciliation.service';
import { FuelSummaryService } from '../../../worker/src/fuel-summary/fuel-summary.service';

jest.setTimeout(60000);

const dbUrl = process.env['DATABASE_URL'] ?? process.env['TEST_DATABASE_URL'];
const prisma = new PrismaClient({
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  log: process.env['PRISMA_LOG'] === 'true' ? ['query'] : [],
});

// Setup Services
const auditServiceMock = {
  log: jest.fn().mockResolvedValue(undefined),
  logMany: jest.fn().mockResolvedValue(undefined),
} as any;

const costCentersService = new CostCentersService(prisma as any, auditServiceMock);
const fuelStationsService = new FuelStationsService(prisma as any, auditServiceMock);
const fuelAttendantsService = new FuelAttendantsService(prisma as any, auditServiceMock);
const fuelReconciliationService = new FuelReconciliationService(prisma as any, auditServiceMock);
const fuelSummaryService = new FuelSummaryService(prisma as any);

const cleanupTenantIds: string[] = [];
const testActorId = randomUUID();

async function hashPw(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id, memoryCost: 1024, timeCost: 2, parallelism: 1 });
}

async function createTestTenant(nameSuffix: string) {
  const doc = `99.${randomUUID().slice(0, 8)}/0001-00`;
  const tenant = await prisma.tenant.create({
    data: {
      name: `TestTenant ${nameSuffix}`,
      document: doc,
      plan: 'STARTER',
      status: 'ACTIVE',
    },
  });
  const branch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Test Branch',
      city: 'Test City',
      state: 'SP',
      status: 'ACTIVE',
    },
  });
  return { tenant, branch };
}

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
});

afterAll(async () => {
  if (cleanupTenantIds.length > 0) {
    // Delete in dependency order
    await prisma.fuelDailySummary.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.tankStockSnapshot.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelInventoryMovement.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.outboxEvent.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.internalFueling.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.externalFueling.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelDelivery.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelPump.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelTank.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelProduct.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelSupplier.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelAttendantProfile.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.costCenter.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.fuelStation.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.vehicle.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.user.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.employee.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.branch.deleteMany({ where: { tenantId: { in: cleanupTenantIds } } }).catch(() => null);
    await prisma.tenant.deleteMany({ where: { id: { in: cleanupTenantIds } } }).catch(() => null);
  }
  await prisma.$disconnect();
});

describe('CostCenter CRUD Service', () => {
  it('should create, read, update, and soft-delete a CostCenter', async () => {
    const { tenant } = await createTestTenant('costcenter-crud');
    cleanupTenantIds.push(tenant.id);

    // Create
    const dto = {
      code: 'CC-001',
      name: 'Centro de Custos Administrativos',
      description: 'Custos da equipe administrativa',
      active: true,
    };
    const created = await costCentersService.create(tenant.id, dto, testActorId);
    expect(created.code).toBe(dto.code);
    expect(created.name).toBe(dto.name);
    expect(created.description).toBe(dto.description);

    // Read FindAll
    const list = await costCentersService.findAll(tenant.id);
    expect(list.length).toBe(1);
    expect(list[0]!.id).toBe(created.id);

    // Read FindById
    const found = await costCentersService.findById(created.id, tenant.id);
    expect(found.name).toBe(dto.name);

    // Update
    const updateDto = {
      name: 'Centro de Custos TI',
      description: 'Novo escopo de TI',
      active: false,
    };
    const updated = await costCentersService.update(created.id, tenant.id, updateDto, testActorId);
    expect(updated.name).toBe(updateDto.name);
    expect(updated.description).toBe(updateDto.description);
    expect(updated.active).toBe(false);

    // Delete
    await costCentersService.delete(created.id, tenant.id, testActorId);

    // Confirm is deleted (soft delete)
    await expect(costCentersService.findById(created.id, tenant.id)).rejects.toThrow();
    const dbRecord = await prisma.costCenter.findUnique({ where: { id: created.id } });
    expect(dbRecord?.deletedAt).not.toBeNull();
  });

  it('should reject creating duplicate cost center code for same tenant', async () => {
    const { tenant } = await createTestTenant('costcenter-dup');
    cleanupTenantIds.push(tenant.id);

    const dto = { code: 'DUP-123', name: 'Original', active: true };
    await costCentersService.create(tenant.id, dto, testActorId);

    await expect(costCentersService.create(tenant.id, dto, testActorId)).rejects.toThrow();
  });
});

describe('FuelStation CRUD Service', () => {
  it('should create, read, update, and soft-delete a FuelStation', async () => {
    const { tenant } = await createTestTenant('station-crud');
    cleanupTenantIds.push(tenant.id);

    // Create
    const dto = {
      name: 'Posto Petrobras Central',
      cnpj: '12345678901234',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000',
      status: 'ACTIVE',
    };
    const created = await fuelStationsService.create(tenant.id, dto, testActorId);
    expect(created.name).toBe(dto.name);
    expect(created.cnpj).toBe(dto.cnpj);

    // Read FindAll
    const list = await fuelStationsService.findAll(tenant.id);
    expect(list.length).toBe(1);
    expect(list[0]!.id).toBe(created.id);

    // Read FindById
    const found = await fuelStationsService.findById(created.id, tenant.id);
    expect(found.cnpj).toBe(dto.cnpj);

    // Update
    const updateDto = {
      name: 'Posto Petrobras Paulista',
      city: 'S. Paulo',
    };
    const updated = await fuelStationsService.update(created.id, tenant.id, updateDto, testActorId);
    expect(updated.name).toBe(updateDto.name);
    expect(updated.city).toBe(updateDto.city);

    // Delete
    await fuelStationsService.delete(created.id, tenant.id, testActorId);

    // Confirm is deleted (soft delete)
    await expect(fuelStationsService.findById(created.id, tenant.id)).rejects.toThrow();
    const dbRecord = await prisma.fuelStation.findUnique({ where: { id: created.id } });
    expect(dbRecord?.deletedAt).not.toBeNull();
  });
});

describe('FuelAttendantProfile CRUD Service', () => {
  it('should create, read, update, and hard-delete a FuelAttendantProfile', async () => {
    const { tenant, branch } = await createTestTenant('attendant-crud');
    cleanupTenantIds.push(tenant.id);

    // Create employee & user
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'Attendant Joe',
        email: `attendant-${randomUUID().slice(0, 5)}@test.com`,
        department: 'Operations',
        status: 'ACTIVE',
      },
    });
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        employeeId: employee.id,
        name: 'Attendant Joe',
        email: employee.email!,
        passwordHash: await hashPw('Pass@123'),
        status: 'ACTIVE',
      },
    });

    const dto = {
      userId: user.id,
      employeeId: employee.id,
      allowedBranchIds: [branch.id],
      allowedTankIds: [],
      allowedPumpIds: [],
      shift: 'DIURNO',
      status: 'ACTIVE',
      certificationExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    };

    // Create profile
    const created = await fuelAttendantsService.create(tenant.id, dto, testActorId);
    expect(created.userId).toBe(user.id);
    expect(created.shift).toBe(dto.shift);

    // Read FindAll
    const list = await fuelAttendantsService.findAll(tenant.id);
    expect(list.length).toBe(1);
    expect(list[0]!.id).toBe(created.id);

    // Read FindByUserId
    const found = await fuelAttendantsService.findByUserId(user.id, tenant.id);
    expect(found.id).toBe(created.id);

    // Update
    const updateDto = {
      shift: 'NOTURNO',
      allowedTankIds: ['tank-uuid-1'],
    };
    const updated = await fuelAttendantsService.update(created.id, tenant.id, updateDto, testActorId);
    expect(updated.shift).toBe(updateDto.shift);
    expect(updated.allowedTankIds).toContain('tank-uuid-1');

    // Delete
    await fuelAttendantsService.delete(created.id, tenant.id, testActorId);

    // Confirm is deleted (hard deleted from DB)
    await expect(fuelAttendantsService.findById(created.id, tenant.id)).rejects.toThrow();
    const dbRecord = await prisma.fuelAttendantProfile.findUnique({ where: { id: created.id } });
    expect(dbRecord).toBeNull();
  });
});

describe('FuelReconciliation Service', () => {
  it('should reconcile tank stock and create ledger movements', async () => {
    const { tenant, branch } = await createTestTenant('reconciliation');
    cleanupTenantIds.push(tenant.id);

    // Create product
    const product = await prisma.fuelProduct.create({
      data: {
        tenantId: tenant.id,
        code: `PRD-${randomUUID().slice(0, 5)}`,
        name: 'Diesel S10',
        type: 'diesel_s10',
      },
    });

    // Create tank
    const tank = await prisma.fuelTank.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        fuelProductId: product.id,
        name: 'Tanque Principal',
        code: `TNK-${randomUUID().slice(0, 5)}`,
        capacityLiters: 1000,
        currentStockLiters: 500,
        status: 'ACTIVE',
      },
    });

    // Reconcile: Measured 600 Liters (stock was 500) -> Adjusted (+100 difference)
    const res = await fuelReconciliationService.reconcile(tenant.id, {
      fuelTankId: tank.id,
      measuredLiters: 600,
      notes: 'Auditoria de estoque',
    }, testActorId);

    expect(res.status).toBe('adjusted');
    expect(res.bookStockLiters).toBe(500);
    expect(res.measuredLiters).toBe(600);
    expect(res.differenceLiters).toBe(100);

    // Verify tank stock in DB
    const dbTank = await prisma.fuelTank.findUnique({ where: { id: tank.id } });
    expect(Number(dbTank?.currentStockLiters)).toBe(600);

    // Verify FuelInventoryMovement ledger entry
    const movements = await fuelReconciliationService.getHistory(tenant.id, tank.id);
    expect(movements.length).toBe(1);
    expect(movements[0]!.movementType).toBe('audit_difference');
    expect(movements[0]!.sourceType).toBe('reconciliation');
    expect(Number(movements[0]!.quantityLiters)).toBe(100);
    expect(Number(movements[0]!.stockBefore)).toBe(500);
    expect(Number(movements[0]!.stockAfter)).toBe(600);

    // Verify OutboxEvent
    const outbox = await prisma.outboxEvent.findFirst({
      where: { tenantId: tenant.id, aggregateId: tank.id, eventType: 'fuel.stock.reconciled' },
    });
    expect(outbox).not.toBeNull();
    const payload = outbox?.payload as any;
    expect(payload?.differenceLiters).toBe(100);

    // Reconcile again: Measured 600 Liters (stock is now 600) -> Aligned (0 difference)
    const res2 = await fuelReconciliationService.reconcile(tenant.id, {
      fuelTankId: tank.id,
      measuredLiters: 600,
      notes: 'Auditoria de estoque 2',
    }, testActorId);

    expect(res2.status).toBe('aligned');
    expect(res2.differenceLiters).toBe(0);
  });
});

describe('FuelSummary Worker Service', () => {
  it('should aggregate daily summaries and generate tank stock snapshots', async () => {
    const { tenant, branch } = await createTestTenant('worker-summary');
    cleanupTenantIds.push(tenant.id);

    // Create product
    const product = await prisma.fuelProduct.create({
      data: {
        tenantId: tenant.id,
        code: `PRD-${randomUUID().slice(0, 5)}`,
        name: 'Diesel S10',
        type: 'diesel_s10',
      },
    });

    // Create tank
    const tank = await prisma.fuelTank.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        fuelProductId: product.id,
        name: 'Tanque Principal',
        code: `TNK-${randomUUID().slice(0, 5)}`,
        capacityLiters: 1000,
        currentStockLiters: 450,
        status: 'ACTIVE',
      },
    });

    const supplier = await prisma.fuelSupplier.create({
      data: {
        tenantId: tenant.id,
        legalName: 'Fornecedor A',
        document: '11111111111111',
        status: 'ACTIVE',
      },
    });

    // Create employee/driver
    const _employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'Driver Joe',
        email: `driver-${randomUUID().slice(0, 5)}@test.com`,
        department: 'Fleet',
        status: 'ACTIVE',
      },
    });

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        plate: `TST-${randomUUID().slice(0, 4).toUpperCase()}`,
        prefix: 'V-123',
        type: 'BUS',
        capacity: 44,
        brand: 'Mercedes',
        model: 'O500',
        year: 2022,
        fuelType: 'DIESEL',
        currentOdometer: 10000,
        status: 'AVAILABLE',
      },
    });

    const today = new Date();

    // 1. Create a FuelDelivery (liters in)
    await prisma.fuelDelivery.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        supplierId: supplier.id,
        fuelTankId: tank.id,
        fuelProductId: product.id,
        invoiceNumber: 'NF-1002',
        contractedLiters: 200,
        declaredLiters: 200,
        acceptedLiters: 200,
        unitPrice: 5.5,
        totalAmount: 1100,
        deliveryDate: today,
        status: 'approved',
      },
    });

    // 2. Create an Internal Fueling (liters out)
    await prisma.internalFueling.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        fuelTankId: tank.id,
        fuelProductId: product.id,
        vehicleId: vehicle.id,
        attendantUserId: randomUUID(),
        liters: 60,
        totalCostCalculated: 330,
        odometer: 10060,
        occurredAt: today,
        status: 'approved',
        anomalyFlag: false,
      },
    });

    // 3. Create an External Fueling (liters out)
    await prisma.externalFueling.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        vehicleId: vehicle.id,
        driverId: randomUUID(),
        fuelProductId: product.id,
        stationNameFree: 'Posto Rodovia',
        liters: 40,
        unitPrice: 6.0,
        totalAmount: 240,
        paymentMethod: 'corporate_card',
        odometer: 10100,
        occurredAt: today,
        status: 'approved',
        anomalyFlag: true, // anomaly flagged
      },
    });

    // Run summary generation
    await fuelSummaryService.generateDailySummary(today);

    // Verify Daily Summary
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const summary = await prisma.fuelDailySummary.findUnique({
      where: {
        tenantId_branchId_fuelProductId_summaryDate: {
          tenantId: tenant.id,
          branchId: branch.id,
          fuelProductId: product.id,
          summaryDate: startOfDay,
        },
      },
    });

    expect(summary).not.toBeNull();
    expect(Number(summary?.totalLitersIn)).toBe(200);
    expect(Number(summary?.totalLitersOut)).toBe(100); // 60 + 40
    expect(Number(summary?.totalCostOut)).toBe(570); // 330 + 240
    expect(summary?.fuelingCount).toBe(2);
    expect(summary?.anomalyCount).toBe(1);

    // Run Tank Stock Snapshots
    await fuelSummaryService.generateTankStockSnapshots(today);

    // Verify snapshot
    const snapshot = await prisma.tankStockSnapshot.findUnique({
      where: {
        tenantId_tankId_snapshotDate: {
          tenantId: tenant.id,
          tankId: tank.id,
          snapshotDate: startOfDay,
        },
      },
    });

    expect(snapshot).not.toBeNull();
    expect(Number(snapshot?.stockLiters)).toBe(450);
    expect(Number(snapshot?.capacityLiters)).toBe(1000);
    expect(Number(snapshot?.stockValue)).toBe(2475); // 450 * 5.5 (unit price from last delivery)
  });
});
