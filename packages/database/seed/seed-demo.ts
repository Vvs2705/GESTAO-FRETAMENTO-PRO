/**
 * seed-demo.ts — Seed de demonstração para Gestão Fretamento Pro
 *
 * Cria dados realistas para o tenant "Transportes Vstack Ltda":
 *   - 2 filiais (Matriz SP + Garagem Campinas)
 *   - Roles: DRIVER, FUEL_ATTENDANT, SUPERVISOR, MANAGER, CEO, TENANT_ADMIN
 *   - Permissões: fuel.*, analytics.*, vehicle.*, trip.*
 *   - 5 usuários de demo
 *   - 5 veículos (ônibus)
 *   - 2 motoristas vinculados a employees
 *   - 3 clientes + 2 contratos
 *   - Produtos de combustível, fornecedores, tanques e bombas
 *   - Entregas de combustível, abastecimentos internos e externos
 *   - 5 viagens, 2 ocorrências, 2 ordens de manutenção
 *   - 10+ registros de audit log
 *
 * Executar: pnpm ts-node packages/database/seed/seed-demo.ts
 * Ou:       npx tsx packages/database/seed/seed-demo.ts
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const L = (n: number) => Array.from({ length: n }, () => letters[Math.floor(Math.random() * 26)]).join('');
  return `${L(3)}-${randomInt(1000, 9999)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== seed-demo.ts: iniciando ===');

  const DEMO_PASSWORD = 'Admin@123';
  const pwHash = await hashPassword(DEMO_PASSWORD);

  // ── Tenant ──────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { document: '12.345.678/0001-99' },
    update: {},
    create: {
      name: 'Transportes Vstack Ltda',
      tradeName: 'Vstack Fretamento',
      document: '12.345.678/0001-99',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        fuelAnomalyThreshold: 0.8,
        documentExpiryAlertDays: [60, 30, 7],
      },
    },
  });
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  // ── Branches ─────────────────────────────────────────────────────────────
  const matrizSP = await prisma.branch.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      name: 'Matriz São Paulo',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000 - Bela Vista',
      zipCode: '01310-100',
      phone: '(11) 3456-7890',
      type: 'headquarters',
      status: 'ACTIVE',
    },
  });

  const garagemCPS = await prisma.branch.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: 'aaaaaaaa-0000-0000-0000-000000000002',
      tenantId: tenant.id,
      name: 'Garagem Campinas',
      city: 'Campinas',
      state: 'SP',
      address: 'Rua Barão de Jaguara, 500 - Centro',
      zipCode: '13010-080',
      phone: '(19) 3333-4444',
      type: 'garage',
      status: 'ACTIVE',
    },
  });
  console.log('Filiais: Matriz São Paulo, Garagem Campinas');

  // ── Permissions ──────────────────────────────────────────────────────────
  const permDefs = [
    // fuel.*
    { key: 'fuel.read', module: 'fuel', action: 'read', description: 'Visualizar combustível' },
    { key: 'fuel.create', module: 'fuel', action: 'create', description: 'Registrar abastecimentos' },
    { key: 'fuel.update', module: 'fuel', action: 'update', description: 'Editar abastecimentos' },
    { key: 'fuel.delete', module: 'fuel', action: 'delete', description: 'Remover abastecimentos' },
    { key: 'fuel.approve', module: 'fuel', action: 'approve', description: 'Aprovar abastecimentos' },
    { key: 'fuel.export', module: 'fuel', action: 'export', description: 'Exportar combustível' },
    { key: 'fuel.internal.create', module: 'fuel', action: 'internal.create', description: 'Criar abastecimento interno' },
    { key: 'fuel.internal.approve', module: 'fuel', action: 'internal.approve', description: 'Aprovar abastecimento interno' },
    { key: 'fuel.delivery.receive', module: 'fuel', action: 'delivery.receive', description: 'Receber entrega de combustível' },
    { key: 'fuel.delivery.approve', module: 'fuel', action: 'delivery.approve', description: 'Aprovar entrega de combustível' },
    { key: 'fuel.external.submit', module: 'fuel', action: 'external.submit', description: 'Submeter abastecimento externo' },
    { key: 'fuel.external.approve', module: 'fuel', action: 'external.approve', description: 'Aprovar abastecimento externo' },
    { key: 'fuel.stock.adjust', module: 'fuel', action: 'stock.adjust', description: 'Ajustar estoque de combustível' },
    // analytics.*
    { key: 'analytics.executive.read', module: 'analytics', action: 'executive.read', description: 'Analytics executivo' },
    { key: 'analytics.fuel.read', module: 'analytics', action: 'fuel.read', description: 'Analytics de combustível' },
    { key: 'analytics.fleet.read', module: 'analytics', action: 'fleet.read', description: 'Analytics de frota' },
    { key: 'analytics.operations.read', module: 'analytics', action: 'operations.read', description: 'Analytics de operações' },
    // dashboard.*
    { key: 'dashboard.executive', module: 'dashboard', action: 'executive', description: 'Dashboard executivo' },
    { key: 'dashboard.operation', module: 'dashboard', action: 'operation', description: 'Dashboard operacional' },
    { key: 'dashboard.fleet', module: 'dashboard', action: 'fleet', description: 'Dashboard de frota' },
    { key: 'dashboard.fuel', module: 'dashboard', action: 'fuel', description: 'Dashboard de combustível' },
    // vehicle.*
    { key: 'vehicle.read', module: 'vehicle', action: 'read', description: 'Visualizar veículos' },
    { key: 'vehicle.create', module: 'vehicle', action: 'create', description: 'Cadastrar veículos' },
    { key: 'vehicle.update', module: 'vehicle', action: 'update', description: 'Atualizar veículos' },
    { key: 'vehicle.delete', module: 'vehicle', action: 'delete', description: 'Remover veículos' },
    { key: 'vehicle.assign', module: 'vehicle', action: 'assign', description: 'Alocar veículos' },
    // trip.*
    { key: 'trip.read', module: 'trip', action: 'read', description: 'Visualizar viagens' },
    { key: 'trip.create', module: 'trip', action: 'create', description: 'Criar viagens' },
    { key: 'trip.update', module: 'trip', action: 'update', description: 'Atualizar viagens' },
    { key: 'trip.cancel', module: 'trip', action: 'cancel', description: 'Cancelar viagens' },
    { key: 'trip.start', module: 'trip', action: 'start', description: 'Iniciar viagens' },
    { key: 'trip.complete', module: 'trip', action: 'complete', description: 'Concluir viagens' },
    { key: 'trip.export', module: 'trip', action: 'export', description: 'Exportar viagens' },
    // driver.*
    { key: 'driver.read', module: 'driver', action: 'read', description: 'Visualizar motoristas' },
    { key: 'driver.create', module: 'driver', action: 'create', description: 'Cadastrar motoristas' },
    { key: 'driver.update', module: 'driver', action: 'update', description: 'Atualizar motoristas' },
    // maintenance.*
    { key: 'maintenance.read', module: 'maintenance', action: 'read', description: 'Visualizar manutenções' },
    { key: 'maintenance.create', module: 'maintenance', action: 'create', description: 'Criar manutenções' },
    { key: 'maintenance.update', module: 'maintenance', action: 'update', description: 'Atualizar manutenções' },
    { key: 'maintenance.complete', module: 'maintenance', action: 'complete', description: 'Concluir manutenções' },
    // occurrence.*
    { key: 'occurrence.read', module: 'occurrence', action: 'read', description: 'Visualizar ocorrências' },
    { key: 'occurrence.create', module: 'occurrence', action: 'create', description: 'Registrar ocorrências' },
    { key: 'occurrence.update', module: 'occurrence', action: 'update', description: 'Atualizar ocorrências' },
    { key: 'occurrence.resolve', module: 'occurrence', action: 'resolve', description: 'Resolver ocorrências' },
    // audit.*
    { key: 'audit.read', module: 'audit', action: 'read', description: 'Visualizar auditoria' },
    { key: 'audit.export', module: 'audit', action: 'export', description: 'Exportar auditoria' },
    // user.*
    { key: 'user.read', module: 'user', action: 'read', description: 'Visualizar usuários' },
    { key: 'user.create', module: 'user', action: 'create', description: 'Cadastrar usuários' },
    { key: 'user.update', module: 'user', action: 'update', description: 'Atualizar usuários' },
    { key: 'user.delete', module: 'user', action: 'delete', description: 'Remover usuários' },
    // role.*
    { key: 'role.read', module: 'role', action: 'read', description: 'Visualizar cargos' },
    { key: 'role.manage', module: 'role', action: 'manage', description: 'Gerenciar cargos' },
    { key: 'permission.manage', module: 'permission', action: 'manage', description: 'Gerenciar permissões' },
    // other
    { key: 'client.read', module: 'client', action: 'read', description: 'Visualizar clientes' },
    { key: 'client.create', module: 'client', action: 'create', description: 'Cadastrar clientes' },
    { key: 'notification.read', module: 'notification', action: 'read', description: 'Visualizar notificações' },
    { key: 'report.export', module: 'report', action: 'export', description: 'Exportar relatórios' },
  ];

  const permissions = await Promise.all(
    permDefs.map((p) =>
      prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p }),
    ),
  );
  const permMap = new Map(permissions.map((p) => [p.key, p.id]));
  console.log(`${permissions.length} permissões criadas`);

  // ── Roles ─────────────────────────────────────────────────────────────────
  const allPerms = permDefs.map((p) => p.key);

  const roleDefs = [
    {
      name: 'TENANT_ADMIN',
      hierarchyLevel: 100,
      description: 'Administrador do tenant — acesso total',
      permissions: allPerms,
    },
    {
      name: 'CEO',
      hierarchyLevel: 95,
      description: 'Diretor executivo — acesso total',
      permissions: allPerms,
    },
    {
      name: 'MANAGER',
      hierarchyLevel: 80,
      description: 'Gerente — acesso operacional completo',
      permissions: [
        'vehicle.read', 'vehicle.create', 'vehicle.update',
        'trip.read', 'trip.create', 'trip.update', 'trip.cancel', 'trip.start', 'trip.complete',
        'fuel.read', 'fuel.create', 'fuel.approve', 'fuel.internal.create', 'fuel.internal.approve',
        'fuel.delivery.receive', 'fuel.delivery.approve', 'fuel.external.approve',
        'driver.read', 'driver.create', 'driver.update',
        'maintenance.read', 'maintenance.create', 'maintenance.update', 'maintenance.complete',
        'occurrence.read', 'occurrence.create', 'occurrence.resolve',
        'analytics.executive.read', 'analytics.fuel.read', 'analytics.fleet.read', 'analytics.operations.read',
        'dashboard.executive', 'dashboard.operation', 'dashboard.fleet', 'dashboard.fuel',
        'audit.read', 'client.read', 'notification.read', 'report.export',
      ],
    },
    {
      name: 'SUPERVISOR',
      hierarchyLevel: 60,
      description: 'Supervisor operacional',
      permissions: [
        'vehicle.read', 'trip.read', 'trip.create', 'trip.update',
        'fuel.read', 'fuel.create', 'fuel.internal.create', 'fuel.internal.approve',
        'driver.read', 'maintenance.read',
        'occurrence.read', 'occurrence.create',
        'analytics.operations.read', 'dashboard.operation',
        'client.read', 'notification.read',
      ],
    },
    {
      name: 'FUEL_ATTENDANT',
      hierarchyLevel: 30,
      description: 'Abastecedor — registra e gerencia abastecimentos internos',
      permissions: [
        'fuel.read', 'fuel.create', 'fuel.internal.create',
        'fuel.delivery.receive', 'fuel.external.submit',
        'vehicle.read', 'notification.read',
      ],
    },
    {
      name: 'DRIVER',
      hierarchyLevel: 10,
      description: 'Motorista — acesso às próprias viagens e abastecimentos externos',
      permissions: [
        'trip.read', 'fuel.read', 'fuel.external.submit',
        'occurrence.create', 'notification.read',
      ],
    },
  ];

  const roleIds: Record<string, string> = {};
  for (const rd of roleDefs) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: rd.name } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: rd.name,
        hierarchyLevel: rd.hierarchyLevel,
        description: rd.description,
        isSystem: true,
      },
    });
    roleIds[rd.name] = role.id;

    for (const permKey of rd.permissions) {
      const permId = permMap.get(permKey);
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { tenantId_roleId_permissionId: { tenantId: tenant.id, roleId: role.id, permissionId: permId } },
        update: {},
        create: { tenantId: tenant.id, roleId: role.id, permissionId: permId, scope: 'all' },
      });
    }
  }
  console.log(`${roleDefs.length} roles criados`);

  // ── Users + Employees ─────────────────────────────────────────────────────
  const usersSpec = [
    { email: 'admin@vstack.com.br', name: 'Admin Vstack', role: 'TENANT_ADMIN', department: 'TI', branchId: matrizSP.id },
    { email: 'ceo@vstack.com.br', name: 'Carlos Vasconcelos', role: 'CEO', department: 'Diretoria', branchId: matrizSP.id },
    { email: 'gerente@vstack.com.br', name: 'Fernanda Gerente', role: 'MANAGER', department: 'Operações', branchId: matrizSP.id },
    { email: 'abastecedor@vstack.com.br', name: 'Marcos Abastecedor', role: 'FUEL_ATTENDANT', department: 'Operações', branchId: matrizSP.id },
    { email: 'motorista@vstack.com.br', name: 'João Motorista', role: 'DRIVER', department: 'Operações', branchId: garagemCPS.id },
  ];

  const userIds: Record<string, string> = {};
  for (const spec of usersSpec) {
    const roleId = roleIds[spec.role];
    if (!roleId) throw new Error(`Role ${spec.role} não encontrado`);

    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: spec.email } },
    });

    let userId: string;
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: spec.name, passwordHash: pwHash, status: 'ACTIVE' },
      });
      if (existing.employeeId) {
        await prisma.employee.update({ where: { id: existing.employeeId }, data: { roleId } });
      }
      userId = existing.id;
    } else {
      const employee = await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          branchId: spec.branchId,
          roleId,
          name: spec.name,
          email: spec.email,
          department: spec.department,
          status: 'ACTIVE',
        },
      });
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          employeeId: employee.id,
          name: spec.name,
          email: spec.email,
          passwordHash: pwHash,
          status: 'ACTIVE',
        },
      });
      userId = user.id;
    }
    userIds[spec.email] = userId;
  }
  console.log(`${usersSpec.length} usuários criados`);

  const adminId = userIds['admin@vstack.com.br']!;
  const motoristUserId = userIds['motorista@vstack.com.br']!;

  // ── Vehicles (5 ônibus) ───────────────────────────────────────────────────
  const vehiclePlates = [randomPlate(), randomPlate(), randomPlate(), randomPlate(), randomPlate()];
  const vehicles = await Promise.all(
    vehiclePlates.map((plate, i) =>
      prisma.vehicle.upsert({
        where: { tenantId_plate: { tenantId: tenant.id, plate } },
        update: {},
        create: {
          tenantId: tenant.id,
          branchId: i < 3 ? matrizSP.id : garagemCPS.id,
          plate,
          prefix: `VST-${String(i + 1).padStart(3, '0')}`,
          type: 'BUS',
          capacity: 44,
          brand: 'Mercedes-Benz',
          model: 'OF 1721',
          year: 2020 + i,
          fuelType: 'DIESEL',
          currentOdometer: 50000 + i * 10000,
          status: 'AVAILABLE',
        },
      }),
    ),
  );
  console.log(`${vehicles.length} veículos criados`);

  // ── Drivers ───────────────────────────────────────────────────────────────
  const driverEmployees = await Promise.all([
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: matrizSP.id,
        name: 'Ricardo Motorista SP',
        document: '111.222.333-44',
        email: 'ricardo.driver@vstack.com.br',
        department: 'Operações',
        status: 'ACTIVE',
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: garagemCPS.id,
        name: 'Sandro Motorista CPS',
        document: '555.666.777-88',
        email: 'sandro.driver@vstack.com.br',
        department: 'Operações',
        status: 'ACTIVE',
      },
    }),
  ]);

  const drivers = await Promise.all(
    driverEmployees.map((emp, i) =>
      prisma.driver.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          licenseNumber: `${randomInt(10000000, 99999999)}`,
          licenseCategory: 'D',
          licenseExpiresAt: daysFromNow(365),
          availabilityStatus: 'AVAILABLE',
          preferredVehicleId: vehicles[i]?.id ?? null,
        },
      }),
    ),
  );
  console.log(`${drivers.length} motoristas criados`);

  // ── Clients ───────────────────────────────────────────────────────────────
  const clientsData = [
    { name: 'Indústria Química Horizonte S.A.', document: '11.222.333/0001-44' },
    { name: 'Colégio Estadual Dom Pedro II', document: '22.333.444/0001-55' },
    { name: 'Hospital Regional de Campinas', document: '33.444.555/0001-66' },
  ];

  const clients = await Promise.all(
    clientsData.map((c) =>
      prisma.client.create({
        data: {
          tenantId: tenant.id,
          name: c.name,
          document: c.document,
          contactName: 'Contato Principal',
          contactEmail: `contato@${c.name.toLowerCase().replace(/[^a-z]/g, '')}.com.br`,
          status: 'ACTIVE',
          createdBy: adminId,
        },
      }),
    ),
  );
  console.log(`${clients.length} clientes criados`);

  // ── Contracts (2 ativos) ─────────────────────────────────────────────────
  await Promise.all([
    prisma.contract.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[0]!.id,
        number: 'CTR-DEMO-001',
        description: 'Contrato de fretamento mensal — Indústria Química',
        value: 45000,
        startDate: daysAgo(60),
        endDate: daysFromNow(305),
        status: 'ACTIVE',
        createdBy: adminId,
      },
    }),
    prisma.contract.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[1]!.id,
        number: 'CTR-DEMO-002',
        description: 'Contrato escolar — Colégio Dom Pedro II',
        value: 28000,
        startDate: daysAgo(30),
        endDate: daysFromNow(335),
        status: 'ACTIVE',
        createdBy: adminId,
      },
    }),
  ]);
  console.log('2 contratos criados');

  // ── Fuel Products ─────────────────────────────────────────────────────────
  const fuelProductDefs = [
    { code: 'DIESEL_S10', name: 'Diesel S-10', type: 'diesel_s10', unit: 'liter' },
    { code: 'DIESEL_S500', name: 'Diesel S-500', type: 'diesel_s500', unit: 'liter' },
    { code: 'GASOLINE', name: 'Gasolina Comum', type: 'gasoline', unit: 'liter' },
  ];

  const fuelProducts: Record<string, string> = {};
  for (const fp of fuelProductDefs) {
    const p = await prisma.fuelProduct
      .upsert({ where: { code: fp.code }, update: {}, create: fp })
      .catch(() => prisma.fuelProduct.findFirst({ where: { code: fp.code } }).then((r) => r!));
    fuelProducts[fp.code] = p.id;
  }
  console.log('Produtos de combustível criados');

  // ── Fuel Suppliers ────────────────────────────────────────────────────────
  const suppliers: string[] = [];
  for (const s of [
    { legalName: 'Posto Ipiranga Centro Ltda', document: '44.555.666/0001-77' },
    { legalName: 'Distribuidora Petrobras Norte S.A.', document: '55.666.777/0001-88' },
  ]) {
    const sup = await prisma.fuelSupplier
      .upsert({
        where: { tenantId_document: { tenantId: tenant.id, document: s.document } },
        update: {},
        create: { tenantId: tenant.id, legalName: s.legalName, document: s.document, approved: true, status: 'ACTIVE' },
      })
      .catch(() => prisma.fuelSupplier.findFirst({ where: { tenantId: tenant.id, document: s.document } }).then((r) => r!));
    suppliers.push(sup.id);
  }
  console.log('Fornecedores criados');

  // ── Fuel Tanks ────────────────────────────────────────────────────────────
  const tanks: string[] = [];
  for (const t of [
    { branchId: matrizSP.id, name: 'Tanque Diesel S10 - Matriz', code: 'TK-DIESEL-SP-01', capacity: 5000, current: 3200, product: 'DIESEL_S10' },
    { branchId: garagemCPS.id, name: 'Tanque Diesel S10 - Garagem', code: 'TK-DIESEL-CPS-01', capacity: 3000, current: 1500, product: 'DIESEL_S10' },
  ]) {
    const tank = await prisma.fuelTank
      .upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: t.code } },
        update: { currentStockLiters: t.current },
        create: {
          tenantId: tenant.id,
          branchId: t.branchId,
          name: t.name,
          code: t.code,
          capacityLiters: t.capacity,
          currentStockLiters: t.current,
          fuelProductId: fuelProducts[t.product]!,
          status: 'ACTIVE',
        },
      });
    tanks.push(tank.id);
  }
  console.log('Tanques criados');

  // ── Fuel Pumps ────────────────────────────────────────────────────────────
  const pumpBranches = [matrizSP.id, garagemCPS.id];
  for (const [idx, tankId] of tanks.entries()) {
    const code = `BOM-DEMO-${idx + 1}`;
    await prisma.fuelPump
      .upsert({
        where: { tenantId_code: { tenantId: tenant.id, code } },
        update: {},
        create: {
          tenantId: tenant.id,
          branchId: pumpBranches[idx]!,
          fuelTankId: tankId,
          name: `Bomba ${idx + 1}`,
          code,
          meterType: 'digital',
          status: 'ACTIVE',
        },
      })
      .catch(() => null);
  }
  console.log('Bombas criadas');

  // ── Fuel Deliveries (1 por tanque, aprovadas) ─────────────────────────────
  for (const [idx, tankId] of tanks.entries()) {
    await prisma.fuelDelivery
      .create({
        data: {
          tenantId: tenant.id,
          fuelTankId: tankId,
          supplierId: suppliers[idx % suppliers.length]!,
          fuelProductId: fuelProducts['DIESEL_S10']!,
          branchId: idx === 0 ? matrizSP.id : garagemCPS.id,
          contractedLiters: 2000,
          declaredLiters: 2000,
          receivedLiters: 2000,
          acceptedLiters: 2000,
          unitPrice: 6.45,
          totalAmount: 12900,
          invoiceNumber: `NF-DEMO-${1000 + idx}`,
          deliveryDate: daysAgo(15 - idx * 5),
          status: 'approved',
          approvedByUserId: adminId,
          approvedAt: daysAgo(14 - idx * 5),
        },
      })
      .catch(() => null);
  }
  console.log('Entregas de combustível criadas');

  // ── Internal Fueling (3 abastecimentos internos) ─────────────────────────
  for (let i = 0; i < 3; i++) {
    const vehicle = vehicles[i];
    const driver = drivers[i % 2];
    if (!vehicle || !driver) continue;

    await prisma.fuelRecord
      .create({
        data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
          driverId: driver.id,
          branchId: i < 2 ? matrizSP.id : garagemCPS.id,
          fuelStationName: 'Abastecimento Interno',
          fuelType: 'DIESEL',
          liters: 120 + i * 20,
          unitPrice: 6.45,
          totalAmount: (120 + i * 20) * 6.45,
          odometer: (vehicle.currentOdometer?.toNumber() ?? 60000) + i * 500,
          suppliedAt: daysAgo(10 - i * 3),
          anomalyFlag: false,
          notes: 'Abastecimento interno',
          createdBy: motoristUserId,
        },
      })
      .catch(() => null);
  }
  console.log('3 abastecimentos internos criados');

  // ── External Fueling (2 abastecimentos externos) ─────────────────────────
  for (let i = 0; i < 2; i++) {
    const vehicle = vehicles[3 + i];
    const driver = drivers[i % 2];
    if (!vehicle || !driver) continue;

    await prisma.fuelRecord
      .create({
        data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
          driverId: driver.id,
          branchId: garagemCPS.id,
          fuelStationName: `Posto Shell - ${i === 0 ? 'Campinas Centro' : 'Campinas Norte'}`,
          fuelType: 'DIESEL',
          liters: 150 + i * 30,
          unitPrice: 6.89,
          totalAmount: (150 + i * 30) * 6.89,
          odometer: (vehicle.currentOdometer?.toNumber() ?? 70000) + i * 800,
          suppliedAt: daysAgo(5 - i * 2),
          anomalyFlag: false,
          notes: 'Abastecimento externo em posto',
          createdBy: motoristUserId,
        },
      })
      .catch(() => null);
  }
  console.log('2 abastecimentos externos criados');

  // ── Trips (5 viagens) ─────────────────────────────────────────────────────
  const tripStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'CONFIRMED'];
  const tripIds: string[] = [];

  for (let i = 0; i < 5; i++) {
    const status = tripStatuses[i]!;
    const daysOffset = i < 3 ? 30 - i * 7 : 0;
    const sched = daysAgo(daysOffset);
    sched.setHours(7 + i, 0, 0, 0);
    const schedEnd = new Date(sched);
    schedEnd.setHours(schedEnd.getHours() + 3);

    const actualStart = status !== 'CONFIRMED' ? new Date(sched) : null;
    const actualEnd = status === 'COMPLETED' ? new Date(schedEnd) : null;

    const trip = await prisma.trip.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[i % 3]!.id,
        vehicleId: vehicles[i]!.id,
        driverId: drivers[i % 2]!.id,
        scheduledStartAt: sched,
        scheduledEndAt: schedEnd,
        actualStartAt: actualStart,
        actualEndAt: actualEnd,
        status,
        passengerCount: 30 + i * 2,
        createdBy: adminId,
      },
    });
    tripIds.push(trip.id);
  }
  console.log(`${tripIds.length} viagens criadas`);

  // ── Occurrences (2 abertas) ───────────────────────────────────────────────
  for (let i = 0; i < 2; i++) {
    await prisma.occurrence.create({
      data: {
        tenantId: tenant.id,
        tripId: tripIds[i]!,
        vehicleId: vehicles[i]!.id,
        driverId: drivers[i % 2]!.id,
        clientId: clients[i]!.id,
        type: i === 0 ? 'BREAKDOWN' : 'DELAY',
        severity: i === 0 ? 'MEDIUM' : 'LOW',
        description: i === 0
          ? 'Falha no sistema de ar-condicionado durante a viagem.'
          : 'Atraso de 25 minutos por congestionamento na Marginal.',
        status: 'OPEN',
        createdBy: motoristUserId,
      },
    });
  }
  console.log('2 ocorrências criadas');

  // ── Maintenance Orders (1 COMPLETED + 1 IN_PROGRESS) ─────────────────────
  await prisma.maintenanceOrder.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicles[0]!.id,
      type: 'PREVENTIVE',
      description: 'Troca de óleo e filtros — revisão 50.000 km',
      status: 'COMPLETED',
      expectedStartAt: daysAgo(20),
      actualEndAt: daysAgo(18),
      totalCost: 850,
      createdBy: adminId,
    },
  });

  await prisma.maintenanceOrder.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicles[1]!.id,
      type: 'CORRECTIVE',
      description: 'Substituição do sistema de freios — desgaste identificado',
      status: 'IN_PROGRESS',
      expectedStartAt: daysAgo(3),
      expectedEndAt: daysFromNow(2),
      createdBy: adminId,
    },
  });
  console.log('2 ordens de manutenção criadas');

  // ── Audit Logs (10+ registros) ────────────────────────────────────────────
  const auditEntries = [
    { action: 'user.login', entityType: 'User', entityId: adminId, after: { email: 'admin@vstack.com.br' } },
    { action: 'vehicle.created', entityType: 'Vehicle', entityId: vehicles[0]!.id, after: { plate: vehicles[0]!.plate } },
    { action: 'vehicle.created', entityType: 'Vehicle', entityId: vehicles[1]!.id, after: { plate: vehicles[1]!.plate } },
    { action: 'fuel.internal.created', entityType: 'FuelRecord', entityId: null, after: { liters: 120, vehicleId: vehicles[0]!.id } },
    { action: 'fuel.internal.approved', entityType: 'FuelRecord', entityId: null, after: { approvedBy: adminId } },
    { action: 'fuel.delivery.received', entityType: 'FuelDelivery', entityId: null, after: { tankId: tanks[0], volumeLiters: 2000 } },
    { action: 'fuel.delivery.approved', entityType: 'FuelDelivery', entityId: null, after: { approvedBy: adminId } },
    { action: 'fuel.external.submitted', entityType: 'FuelRecord', entityId: null, after: { liters: 150 } },
    { action: 'fuel.external.approved', entityType: 'FuelRecord', entityId: null, after: { approvedBy: adminId } },
    { action: 'fuel.stock.adjusted', entityType: 'FuelTank', entityId: tanks[0]!, after: { currentVolumeLiters: 3200 } },
    { action: 'trip.created', entityType: 'Trip', entityId: tripIds[0]!, after: { status: 'CONFIRMED' } },
    { action: 'trip.status_changed', entityType: 'Trip', entityId: tripIds[0]!, before: { status: 'CONFIRMED' }, after: { status: 'COMPLETED' } },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorUserId: adminId,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        before: (entry.before ?? null) as never,
        after: (entry.after ?? null) as never,
      },
    });
  }
  console.log(`${auditEntries.length} audit logs criados`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== seed-demo.ts: concluído com sucesso! ===');
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);
  console.log('\nCredenciais (senha: Admin@123):');
  for (const u of usersSpec) {
    console.log(`  ${u.email.padEnd(35)} → ${u.role}`);
  }
}

main()
  .catch((e) => {
    console.error('Erro durante o seed-demo:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
