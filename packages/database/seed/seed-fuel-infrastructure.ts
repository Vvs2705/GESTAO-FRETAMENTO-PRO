/**
 * seed-fuel-infrastructure.ts
 *
 * Seeds full fuel management infrastructure on top of the main seed.
 * Requires the main seed to have been run first (tenant + branches must exist).
 *
 * Creates:
 *   - FuelProducts (diesel_s10, diesel_s500, gasoline, ethanol, arla32)
 *   - FuelSuppliers (2 approved)
 *   - FuelTanks (2 per branch: diesel_s10 + gasoline)
 *   - FuelPumps (1 per tank)
 *   - FuelAttendantProfile for the FUEL_ATTENDANT user
 *   - FuelDeliveries (1 approved per tank → stocked)
 *   - FuelInventoryMovements (delivery_in for each approved delivery)
 *   - InternalFueling (3 records for vehicles)
 *   - ExternalFueling (2 records by driver)
 *   - FuelIncident (1 medium severity)
 *
 * Run: pnpm db:seed:fuel
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function main() {
  console.log('🔥 Seeding fuel infrastructure...');

  // ── Fetch tenant and branches ────────────────────────────────────────────
  const tenant = await prisma.tenant.findFirst({ where: { document: '12.345.678/0001-99' } });
  if (!tenant) throw new Error('Run the main seed first: no tenant found');

  const branches = await prisma.branch.findMany({ where: { tenantId: tenant.id, deletedAt: null }, take: 2 });
  if (branches.length < 1) throw new Error('No branches found — run main seed first');

  const [branchMain, branchSecondary] = branches;

  // ── FuelProducts ────────────────────────────────────────────────────────
  console.log('  Creating fuel products...');
  const products: Record<string, { id: string }> = {};

  const productDefs = [
    { code: 'DIESEL-S10', name: 'Diesel S-10', type: 'diesel_s10', unit: 'liter' },
    { code: 'DIESEL-S500', name: 'Diesel S-500', type: 'diesel_s500', unit: 'liter' },
    { code: 'GASOLINE', name: 'Gasolina Comum', type: 'gasoline', unit: 'liter' },
    { code: 'ETHANOL', name: 'Etanol Hidratado', type: 'ethanol', unit: 'liter' },
    { code: 'ARLA32', name: 'Arla 32', type: 'arla32', unit: 'liter' },
  ];

  for (const def of productDefs) {
    const p = await prisma.fuelProduct.upsert({
      where: { code: def.code },
      update: {},
      create: { ...def, active: true },
    });
    products[def.type] = p;
  }
  console.log(`  ✓ ${Object.keys(products).length} fuel products`);

  // ── FuelSuppliers ───────────────────────────────────────────────────────
  console.log('  Creating fuel suppliers...');
  const supplier1 = await prisma.fuelSupplier.upsert({
    where: { tenantId_document: { tenantId: tenant.id, document: '11.222.333/0001-44' } },
    update: {},
    create: {
      tenantId: tenant.id,
      legalName: 'Petrobras Distribuidora S.A.',
      tradeName: 'BR Distribuidora',
      document: '11.222.333/0001-44',
      contactName: 'Carlos Mendes',
      phone: '(11) 3333-4444',
      email: 'comercial@br.com.br',
      address: 'Av. República do Chile, 65, Rio de Janeiro - RJ',
      approved: true,
      status: 'ACTIVE',
    },
  });

  const supplier2 = await prisma.fuelSupplier.upsert({
    where: { tenantId_document: { tenantId: tenant.id, document: '55.666.777/0001-88' } },
    update: {},
    create: {
      tenantId: tenant.id,
      legalName: 'Ipiranga Produtos de Petróleo S.A.',
      tradeName: 'Ipiranga',
      document: '55.666.777/0001-88',
      contactName: 'Ana Lima',
      phone: '(11) 4444-5555',
      email: 'vendas@ipiranga.com.br',
      address: 'Rua Comendador Araújo, 541, Curitiba - PR',
      approved: true,
      status: 'ACTIVE',
    },
  });
  console.log('  ✓ 2 fuel suppliers (approved)');

  // ── FuelTanks ────────────────────────────────────────────────────────────
  console.log('  Creating fuel tanks...');

  const dieselProductId = products['diesel_s10']!.id;
  const gasolineProductId = products['gasoline']!.id;

  const tanksData = [
    {
      branchId: branchMain!.id,
      fuelProductId: dieselProductId,
      name: 'Tanque Diesel S-10 — Matriz',
      code: 'TQ-MAT-DS10',
      capacityLiters: 10000,
      minimumStockLiters: 500,
      warningStockLiters: 1500,
      physicalLocation: 'Pátio lateral — lado esquerdo',
    },
    {
      branchId: branchMain!.id,
      fuelProductId: gasolineProductId,
      name: 'Tanque Gasolina — Matriz',
      code: 'TQ-MAT-GAS',
      capacityLiters: 3000,
      minimumStockLiters: 200,
      warningStockLiters: 600,
      physicalLocation: 'Pátio lateral — lado direito',
    },
    ...(branchSecondary ? [{
      branchId: branchSecondary.id,
      fuelProductId: dieselProductId,
      name: 'Tanque Diesel S-10 — Filial',
      code: 'TQ-FIL-DS10',
      capacityLiters: 5000,
      minimumStockLiters: 300,
      warningStockLiters: 800,
      physicalLocation: 'Garagem — área de abastecimento',
    }] : []),
  ];

  const tanks: Array<{ id: string; fuelProductId: string; capacityLiters: unknown; branchId: string }> = [];
  for (const td of tanksData) {
    const existing = await prisma.fuelTank.findFirst({ where: { tenantId: tenant.id, code: td.code } });
    if (existing) {
      tanks.push(existing);
      continue;
    }
    const t = await prisma.fuelTank.create({
      data: { tenantId: tenant.id, ...td, currentStockLiters: 0, status: 'ACTIVE' },
    });
    tanks.push(t);
  }
  console.log(`  ✓ ${tanks.length} fuel tanks`);

  // ── FuelPumps ────────────────────────────────────────────────────────────
  console.log('  Creating fuel pumps...');
  const pumps: Array<{ id: string }> = [];
  for (let i = 0; i < tanks.length; i++) {
    const tank = tanks[i]!;
    const code = `BIC-${String(i + 1).padStart(2, '0')}`;
    const existing = await prisma.fuelPump.findFirst({ where: { tenantId: tenant.id, code } });
    if (existing) { pumps.push(existing); continue; }
    const p = await prisma.fuelPump.create({
      data: {
        tenantId: tenant.id,
        branchId: tank.branchId,
        fuelTankId: tank.id,
        name: `Bico ${i + 1}`,
        code,
        meterType: i % 2 === 0 ? 'digital' : 'mechanical',
        currentMeterReading: 0,
        status: 'ACTIVE',
      },
    });
    pumps.push(p);
  }
  console.log(`  ✓ ${pumps.length} fuel pumps`);

  // ── FuelAttendantProfile ─────────────────────────────────────────────────
  console.log('  Creating fuel attendant profile...');
  const attendantUser = await prisma.user.findFirst({ where: { tenantId: tenant.id, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } });
  if (attendantUser) {
    await prisma.fuelAttendantProfile.upsert({
      where: { userId: attendantUser.id },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: attendantUser.id,
        allowedBranchIds: branches.map((b) => b.id) as never,
        allowedTankIds: tanks.map((t) => t.id) as never,
        allowedPumpIds: pumps.map((p) => p.id) as never,
        shift: 'flexible',
        status: 'ACTIVE',
      },
    });
    console.log('  ✓ Fuel attendant profile');
  }

  // ── FuelDeliveries + FuelInventoryMovements ──────────────────────────────
  console.log('  Creating fuel deliveries (approved, populating tank stock)...');
  const adminUser = await prisma.user.findFirst({ where: { tenantId: tenant.id, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } });
  const actorId = adminUser?.id ?? crypto.randomUUID();

  for (let i = 0; i < tanks.length; i++) {
    const tank = tanks[i]!;
    const supplier = i % 2 === 0 ? supplier1 : supplier2;
    const deliveredLiters = Number(tank.capacityLiters) * 0.75; // deliver 75% capacity
    const unitPrice = tank.fuelProductId === dieselProductId ? 6.89 : 5.79;

    const invoiceNumber = `NF-2024-${String(i + 1).padStart(4, '0')}`;
    const existing = await prisma.fuelDelivery.findFirst({
      where: { tenantId: tenant.id, supplierId: supplier.id, invoiceNumber },
    });
    if (existing) continue;

    const delivery = await prisma.fuelDelivery.create({
      data: {
        tenantId: tenant.id,
        branchId: tank.branchId,
        supplierId: supplier.id,
        fuelProductId: tank.fuelProductId,
        fuelTankId: tank.id,
        deliveryDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000), // staggered
        invoiceNumber,
        contractedLiters: deliveredLiters,
        declaredLiters: deliveredLiters,
        receivedLiters: deliveredLiters,
        acceptedLiters: deliveredLiters,
        beforeTankLevelLiters: 0,
        afterTankLevelLiters: deliveredLiters,
        differenceLiters: 0,
        differencePercent: 0,
        unitPrice,
        totalAmount: unitPrice * deliveredLiters,
        carrierName: 'Transportadora Nacional Ltda',
        tankerPlate: `ABC${1000 + i * 3}`,
        sealNumbers: [`LACRE-${10000 + i}`, `LACRE-${10001 + i}`] as never,
        status: 'approved',
        receivedByUserId: actorId,
        approvedByUserId: actorId,
        approvedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 3600 * 1000),
      },
    });

    // Update tank stock
    await prisma.fuelTank.update({
      where: { id: tank.id },
      data: { currentStockLiters: deliveredLiters },
    });

    // FuelInventoryMovement — delivery_in
    await prisma.fuelInventoryMovement.create({
      data: {
        tenantId: tenant.id,
        branchId: tank.branchId,
        fuelTankId: tank.id,
        fuelProductId: tank.fuelProductId,
        movementType: 'delivery_in',
        sourceType: 'delivery',
        sourceId: delivery.id,
        quantityLiters: deliveredLiters,
        unitCost: unitPrice,
        totalCost: unitPrice * deliveredLiters,
        stockBefore: 0,
        stockAfter: deliveredLiters,
        occurredAt: delivery.deliveryDate,
        createdByUserId: actorId,
        reason: `Entrega aprovada — NF ${invoiceNumber}`,
      },
    });

    console.log(`  ✓ Delivery ${invoiceNumber}: ${deliveredLiters}L → tank ${tank.id.substring(0, 8)}...`);
  }

  // ── InternalFueling ──────────────────────────────────────────────────────
  console.log('  Creating internal fuelings...');
  const vehicles = await prisma.vehicle.findMany({ where: { tenantId: tenant.id, deletedAt: null, status: 'AVAILABLE' }, take: 5 });
  const drivers = await prisma.driver.findMany({ where: { tenantId: tenant.id, deletedAt: null }, take: 3 });

  const dieselTanks = tanks.filter((t) => t.fuelProductId === dieselProductId);

  for (let i = 0; i < Math.min(3, vehicles.length, dieselTanks.length > 0 ? 3 : 0); i++) {
    const vehicle = vehicles[i]!;
    const tank = dieselTanks[i % dieselTanks.length]!;
    const pump = pumps.find((p: Record<string, unknown>) => (p as { fuelTankId?: string }).fuelTankId === tank.id);
    const driver = drivers[i % Math.max(drivers.length, 1)];
    const liters = 80 + i * 15;
    const currentStock = Number((await prisma.fuelTank.findUnique({ where: { id: tank.id } }))?.currentStockLiters ?? 0);

    if (currentStock < liters) continue;

    const occurredAt = new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000);
    const fueling = await prisma.internalFueling.create({
      data: {
        tenantId: tenant.id,
        branchId: tank.branchId,
        vehicleId: vehicle.id,
        driverId: driver?.id ?? null,
        attendantUserId: actorId,
        fuelTankId: tank.id,
        fuelPumpId: pump?.id ?? null,
        fuelProductId: tank.fuelProductId,
        odometer: 50000 + i * 1200,
        liters,
        meterBefore: 1000 + i * 200,
        meterAfter: 1000 + i * 200 + liters,
        unitCostCalculated: 6.89,
        totalCostCalculated: 6.89 * liters,
        occurredAt,
        status: 'approved',
        anomalyFlag: false,
        approvedByUserId: actorId,
        approvedAt: new Date(occurredAt.getTime() + 3600 * 1000),
      },
    });

    // Stock movement
    const stockAfter = currentStock - liters;
    await prisma.fuelTank.update({ where: { id: tank.id }, data: { currentStockLiters: stockAfter } });
    await prisma.fuelInventoryMovement.create({
      data: {
        tenantId: tenant.id,
        branchId: tank.branchId,
        fuelTankId: tank.id,
        fuelProductId: tank.fuelProductId,
        movementType: 'internal_fueling_out',
        sourceType: 'fueling',
        sourceId: fueling.id,
        quantityLiters: liters,
        unitCost: 6.89,
        totalCost: 6.89 * liters,
        stockBefore: currentStock,
        stockAfter,
        occurredAt,
        createdByUserId: actorId,
        reason: `Abastecimento interno — veículo ${vehicle.id.substring(0, 8)}`,
      },
    });

    console.log(`  ✓ InternalFueling: ${liters}L → vehicle ${vehicle.id.substring(0, 8)}`);
  }

  // ── ExternalFueling ──────────────────────────────────────────────────────
  console.log('  Creating external fuelings...');

  const gasolineProduct = products['gasoline']!;
  for (let i = 0; i < Math.min(2, vehicles.length); i++) {
    const vehicle = vehicles[i]!;
    const driver = drivers[i % Math.max(drivers.length, 1)];
    const liters = 40 + i * 10;
    const unitPrice = 5.89;

    await prisma.externalFueling.create({
      data: {
        tenantId: tenant.id,
        vehicleId: vehicle.id,
        driverId: driver?.id ?? (await prisma.driver.findFirst({ where: { tenantId: tenant.id } }))?.id ?? crypto.randomUUID(),
        stationNameFree: `Posto Shell — Rodovia Anhanguera km ${200 + i * 30}`,
        fuelProductId: gasolineProduct.id,
        odometer: 55000 + i * 800,
        liters,
        unitPrice,
        totalAmount: unitPrice * liters,
        paymentMethod: 'corporate_card',
        receiptNumber: `CUPOM-2024-${String(100 + i).padStart(4, '0')}`,
        occurredAt: new Date(Date.now() - (5 + i) * 24 * 60 * 60 * 1000),
        status: 'approved',
        anomalyFlag: false,
        approvedByUserId: actorId,
        approvedAt: new Date(Date.now() - (4 + i) * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✓ ExternalFueling: ${liters}L → vehicle ${vehicle.id.substring(0, 8)}`);
  }

  // ── FuelIncident ─────────────────────────────────────────────────────────
  console.log('  Creating fuel incident...');
  if (tanks.length > 0) {
    await prisma.fuelIncident.create({
      data: {
        tenantId: tenant.id,
        branchId: tanks[0]!.branchId,
        fuelTankId: tanks[0]!.id,
        severity: 'medium',
        type: 'tank_gauge_discrepancy',
        description: 'Leitura do medidor de nível inconsistente com o volume registrado. Diferença de 50L detectada durante conferência.',
        status: 'open',
        responsibleUserId: actorId,
      },
    });
    console.log('  ✓ 1 fuel incident (open, medium)');
  }

  console.log('\n✅ Fuel infrastructure seed completed successfully!');
  console.log('   Products:', Object.keys(products).length);
  console.log('   Suppliers: 2');
  console.log('   Tanks:', tanks.length);
  console.log('   Pumps:', pumps.length);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { void prisma.$disconnect(); });
