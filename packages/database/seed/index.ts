/**
 * Seed realista para o banco de dados Gestão Fretamento Pro.
 *
 * Cria:
 *   - 1 tenant (Transportes Alfa Ltda)
 *   - 2 filiais (São Paulo, Campinas)
 *   - 5 cargos com 20+ permissões atribuídas
 *   - 20 veículos (ônibus, vans, micro-ônibus)
 *   - 30 motoristas (vinculados a employees)
 *   - 5 clientes com contratos
 *   - 15 rotas com route_points
 *   - 100 viagens (status variados, últimos 90 dias)
 *   - 50 abastecimentos (com 3-5 anomalias)
 *   - 20 ocorrências (status variados)
 *   - 3 usuários (admin, operador, financeiro)
 *
 * Executar: npx ts-node -e "require('./seed/index.ts')"
 * Ou via script: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function randomElement<T>(arr: T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return arr[idx]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

/**
 * Hash de senha com Argon2id — IDÊNTICO ao backend (packages/auth/password.ts).
 * Parâmetros conforme docs/08-seguranca-lgpd-governanca.md:
 *   memoryCost=65536 (64MB), timeCost=3, parallelism=4.
 * Garante que usuários criados pelo seed conseguem autenticar via /v1/auth/login
 * (o backend valida com argon2.verify — um hash SHA-256 jamais passaria).
 */
async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

// ---------------------------------------------------------------------------
// Static data tables
// ---------------------------------------------------------------------------

const VEHICLE_BRANDS = ['Mercedes-Benz', 'Volkswagen', 'Scania', 'Volvo', 'Iveco', 'Ford', 'Marcopolo'];
const VEHICLE_MODELS: Record<string, string[]> = {
  'Mercedes-Benz': ['OF 1519', 'OF 1721', 'O 500 RS'],
  Volkswagen: ['17.280 OT', '9.160 OD', '14.190'],
  Scania: ['K 360 IB', 'K 410 EB', 'K 450'],
  Volvo: ['B270F', 'B340R', 'B420R'],
  Iveco: ['Daily Minibus', 'Tector City'],
  Ford: ['Transit 2.0', 'F-250'],
  Marcopolo: ['Paradiso 1200', 'Viale BRT'],
};
const VEHICLE_TYPES = ['BUS', 'VAN', 'MICRO_BUS', 'BUS', 'BUS'];
const CAPACITIES: Record<string, number> = {
  BUS: 46,
  VAN: 15,
  MICRO_BUS: 28,
};
const FUEL_TYPES = ['DIESEL', 'DIESEL', 'DIESEL', 'GASOLINE', 'ETHANOL'];

const CLIENT_NAMES = [
  'Indústria Química Horizonte S.A.',
  'Colégio Estadual Dom Pedro',
  'Hospital Regional de Campinas',
  'Condomínio Jardim das Acácias',
  'Faculdade Tecnológica do Interior Paulista',
];
const CLIENT_DOCS = ['12.345.678/0001-90', '23.456.789/0001-01', '34.567.890/0001-12', '45.678.901/0001-23', '56.789.012/0001-34'];

const OCCURRENCE_TYPES = ['ACCIDENT', 'BREAKDOWN', 'DELAY', 'COMPLAINT', 'NEAR_MISS', 'TRAFFIC', 'FUEL_THEFT', 'PASSENGER_COMPLAINT'];
const OCCURRENCE_SEVERITY = ['LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'CRITICAL'];
const OCCURRENCE_STATUS = ['OPEN', 'OPEN', 'IN_ANALYSIS', 'RESOLVED', 'RESOLVED'];

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Iniciando seed do banco de dados...');

  // ─── Tenant ───────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { document: '12.345.678/0001-99' },
    update: {},
    create: {
      name: 'Transportes Alfa Ltda',
      tradeName: 'Alfa Fretamento',
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
  console.log(`Tenant criado: ${tenant.name} (${tenant.id})`);

  // ─── Branches ─────────────────────────────────────────────────────────────
  const branchSP = await prisma.branch.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      name: 'Filial São Paulo',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000 - Bela Vista',
      zipCode: '01310-100',
      phone: '(11) 3456-7890',
      status: 'ACTIVE',
    },
  });

  const branchCPS = await prisma.branch.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      tenantId: tenant.id,
      name: 'Filial Campinas',
      city: 'Campinas',
      state: 'SP',
      address: 'Rua Barão de Jaguara, 500 - Centro',
      zipCode: '13010-080',
      phone: '(19) 3333-4444',
      status: 'ACTIVE',
    },
  });
  console.log('Filiais criadas: São Paulo, Campinas');

  // ─── Permissions ──────────────────────────────────────────────────────────
  // Catálogo COMPLETO — sincronizado com packages/types/src/permissions.types.ts
  // e com todos os @RequirePermission() usados nos controllers do api-core.
  // Toda permissão referenciada no código DEVE existir aqui, senão o PermissionGuard
  // nega o acesso a TODOS os usuários (inclusive CEO) para aquele endpoint.
  const permissionDefs = [
    // Veículos
    { key: 'vehicle.read', module: 'vehicle', action: 'read', description: 'Visualizar veículos' },
    { key: 'vehicle.create', module: 'vehicle', action: 'create', description: 'Cadastrar veículos' },
    { key: 'vehicle.update', module: 'vehicle', action: 'update', description: 'Atualizar veículos' },
    { key: 'vehicle.delete', module: 'vehicle', action: 'delete', description: 'Remover veículos' },
    { key: 'vehicle.assign', module: 'vehicle', action: 'assign', description: 'Alocar veículos a viagens' },
    // Viagens
    { key: 'trip.read', module: 'trip', action: 'read', description: 'Visualizar viagens' },
    { key: 'trip.create', module: 'trip', action: 'create', description: 'Criar viagens' },
    { key: 'trip.update', module: 'trip', action: 'update', description: 'Atualizar viagens' },
    { key: 'trip.cancel', module: 'trip', action: 'cancel', description: 'Cancelar viagens' },
    { key: 'trip.start', module: 'trip', action: 'start', description: 'Iniciar viagens' },
    { key: 'trip.complete', module: 'trip', action: 'complete', description: 'Concluir viagens' },
    { key: 'trip.export', module: 'trip', action: 'export', description: 'Exportar viagens' },
    // Abastecimento
    { key: 'fuel.read', module: 'fuel', action: 'read', description: 'Visualizar abastecimentos' },
    { key: 'fuel.create', module: 'fuel', action: 'create', description: 'Registrar abastecimentos' },
    { key: 'fuel.update', module: 'fuel', action: 'update', description: 'Editar abastecimentos' },
    { key: 'fuel.delete', module: 'fuel', action: 'delete', description: 'Remover abastecimentos' },
    { key: 'fuel.approve', module: 'fuel', action: 'approve', description: 'Aprovar abastecimentos' },
    { key: 'fuel.export', module: 'fuel', action: 'export', description: 'Exportar abastecimentos' },
    // Motoristas
    { key: 'driver.read', module: 'driver', action: 'read', description: 'Visualizar motoristas' },
    { key: 'driver.create', module: 'driver', action: 'create', description: 'Cadastrar motoristas' },
    { key: 'driver.update', module: 'driver', action: 'update', description: 'Atualizar motoristas' },
    { key: 'driver.delete', module: 'driver', action: 'delete', description: 'Remover motoristas' },
    // Manutenção
    { key: 'maintenance.read', module: 'maintenance', action: 'read', description: 'Visualizar manutenções' },
    { key: 'maintenance.create', module: 'maintenance', action: 'create', description: 'Criar ordens de manutenção' },
    { key: 'maintenance.update', module: 'maintenance', action: 'update', description: 'Atualizar ordens de manutenção' },
    { key: 'maintenance.complete', module: 'maintenance', action: 'complete', description: 'Concluir ordens de manutenção' },
    // Ocorrências
    { key: 'occurrence.read', module: 'occurrence', action: 'read', description: 'Visualizar ocorrências' },
    { key: 'occurrence.create', module: 'occurrence', action: 'create', description: 'Registrar ocorrências' },
    { key: 'occurrence.update', module: 'occurrence', action: 'update', description: 'Atualizar ocorrências' },
    { key: 'occurrence.resolve', module: 'occurrence', action: 'resolve', description: 'Resolver ocorrências' },
    { key: 'occurrence.reopen', module: 'occurrence', action: 'reopen', description: 'Reabrir ocorrências' },
    // Financeiro
    { key: 'finance.read', module: 'finance', action: 'read', description: 'Visualizar financeiro' },
    { key: 'finance.create', module: 'finance', action: 'create', description: 'Lançar financeiro' },
    { key: 'finance.update', module: 'finance', action: 'update', description: 'Editar financeiro' },
    { key: 'finance.export', module: 'finance', action: 'export', description: 'Exportar financeiro' },
    // Clientes
    { key: 'client.read', module: 'client', action: 'read', description: 'Visualizar clientes' },
    { key: 'client.create', module: 'client', action: 'create', description: 'Cadastrar clientes' },
    { key: 'client.update', module: 'client', action: 'update', description: 'Atualizar clientes' },
    { key: 'client.delete', module: 'client', action: 'delete', description: 'Remover clientes' },
    // Rotas
    { key: 'route.read', module: 'route', action: 'read', description: 'Visualizar rotas' },
    { key: 'route.create', module: 'route', action: 'create', description: 'Cadastrar rotas' },
    { key: 'route.update', module: 'route', action: 'update', description: 'Atualizar rotas' },
    { key: 'route.delete', module: 'route', action: 'delete', description: 'Remover rotas' },
    // Documentos
    { key: 'document.read', module: 'document', action: 'read', description: 'Visualizar documentos' },
    { key: 'document.create', module: 'document', action: 'create', description: 'Enviar documentos' },
    { key: 'document.delete', module: 'document', action: 'delete', description: 'Remover documentos' },
    // Tenant / Filiais
    { key: 'tenant.read', module: 'tenant', action: 'read', description: 'Visualizar dados da empresa' },
    { key: 'tenant.update', module: 'tenant', action: 'update', description: 'Atualizar dados da empresa' },
    { key: 'branch.read', module: 'branch', action: 'read', description: 'Visualizar filiais' },
    { key: 'branch.create', module: 'branch', action: 'create', description: 'Cadastrar filiais' },
    { key: 'branch.update', module: 'branch', action: 'update', description: 'Atualizar filiais' },
    // Usuários
    { key: 'user.read', module: 'user', action: 'read', description: 'Visualizar usuários' },
    { key: 'user.create', module: 'user', action: 'create', description: 'Cadastrar usuários' },
    { key: 'user.update', module: 'user', action: 'update', description: 'Atualizar usuários' },
    { key: 'user.delete', module: 'user', action: 'delete', description: 'Remover usuários' },
    // Cargos / Permissões
    { key: 'role.read', module: 'role', action: 'read', description: 'Visualizar cargos' },
    { key: 'role.create', module: 'role', action: 'create', description: 'Criar cargos' },
    { key: 'role.update', module: 'role', action: 'update', description: 'Atualizar cargos' },
    { key: 'role.delete', module: 'role', action: 'delete', description: 'Remover cargos' },
    { key: 'role.manage', module: 'role', action: 'manage', description: 'Gerenciar cargos' },
    { key: 'permission.manage', module: 'permission', action: 'manage', description: 'Gerenciar permissões' },
    // Auditoria
    { key: 'audit.read', module: 'audit', action: 'read', description: 'Visualizar auditoria' },
    { key: 'audit.export', module: 'audit', action: 'export', description: 'Exportar auditoria' },
    // Notificações
    { key: 'notification.read', module: 'notification', action: 'read', description: 'Visualizar notificações' },
    // Dashboards
    { key: 'dashboard.executive', module: 'dashboard', action: 'executive', description: 'Dashboard executivo' },
    { key: 'dashboard.operation', module: 'dashboard', action: 'operation', description: 'Dashboard operacional' },
    { key: 'dashboard.fleet', module: 'dashboard', action: 'fleet', description: 'Dashboard de frota' },
    { key: 'dashboard.fuel', module: 'dashboard', action: 'fuel', description: 'Dashboard de combustível' },
    // Analytics (endpoints /v1/analytics/*)
    { key: 'analytics.executive.read', module: 'analytics', action: 'executive.read', description: 'Analytics executivo' },
    { key: 'analytics.operations.read', module: 'analytics', action: 'operations.read', description: 'Analytics operacional' },
    { key: 'analytics.fleet.read', module: 'analytics', action: 'fleet.read', description: 'Analytics de frota' },
    { key: 'analytics.fuel.read', module: 'analytics', action: 'fuel.read', description: 'Analytics de combustível' },
    // Relatórios
    { key: 'report.export', module: 'report', action: 'export', description: 'Exportar relatórios' },
  ];

  const permissions = await Promise.all(
    permissionDefs.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: {},
        create: p,
      }),
    ),
  );
  console.log(`${permissions.length} permissões criadas`);

  const permMap = new Map(permissions.map((p) => [p.key, p.id]));

  // ─── Roles ────────────────────────────────────────────────────────────────
  const roleDefs = [
    {
      name: 'CEO',
      department: 'Diretoria',
      hierarchyLevel: 100,
      description: 'Diretor executivo — acesso total',
      isSystem: true,
      permissions: permissionDefs.map((p) => p.key),
    },
    {
      name: 'Gerente Operacional',
      department: 'Operações',
      hierarchyLevel: 80,
      description: 'Gerente de operações — acesso operacional completo',
      isSystem: true,
      permissions: [
        'vehicle.read', 'vehicle.create', 'vehicle.update',
        'trip.read', 'trip.create', 'trip.update', 'trip.cancel',
        'fuel.read', 'fuel.create', 'fuel.approve',
        'driver.read', 'driver.create', 'driver.update',
        'maintenance.read', 'maintenance.create',
        'occurrence.read', 'occurrence.create', 'occurrence.resolve',
        'client.read', 'client.create', 'client.update',
        'route.read', 'route.create', 'route.update',
        'document.read', 'document.create',
        'notification.read',
        'dashboard.executive', 'dashboard.operation', 'dashboard.fleet', 'dashboard.fuel',
        'analytics.executive.read', 'analytics.operations.read', 'analytics.fleet.read', 'analytics.fuel.read',
      ],
    },
    {
      name: 'Operador',
      department: 'Operações',
      hierarchyLevel: 40,
      description: 'Operador de viagens — acesso operacional básico',
      isSystem: true,
      permissions: [
        'vehicle.read',
        'trip.read', 'trip.create', 'trip.update',
        'fuel.read', 'fuel.create',
        'driver.read',
        'maintenance.read',
        'occurrence.read', 'occurrence.create',
        'client.read',
        'document.read',
        'notification.read',
      ],
    },
    {
      name: 'Motorista',
      department: 'Operações',
      hierarchyLevel: 10,
      description: 'Motorista — acesso restrito às próprias viagens e abastecimentos',
      isSystem: true,
      permissions: [
        'trip.read',
        'fuel.read', 'fuel.create',
        'occurrence.create',
        'notification.read',
      ],
    },
    {
      name: 'Financeiro',
      department: 'Financeiro',
      hierarchyLevel: 60,
      description: 'Analista financeiro — acesso ao financeiro e relatórios',
      isSystem: true,
      permissions: [
        'vehicle.read',
        'trip.read',
        'fuel.read', 'fuel.approve',
        'maintenance.read',
        'client.read',
        'finance.read', 'finance.create', 'finance.update', 'finance.export',
        'audit.read',
        'document.read',
        'dashboard.executive', 'dashboard.fuel',
        'analytics.executive.read', 'analytics.fuel.read',
        'report.export',
        'notification.read',
      ],
    },
  ];

  const roles: Record<string, string> = {};
  for (const roleDef of roleDefs) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: roleDef.name } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: roleDef.name,
        department: roleDef.department,
        hierarchyLevel: roleDef.hierarchyLevel,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });
    roles[roleDef.name] = role.id;

    // Assign permissions to role
    for (const permKey of roleDef.permissions) {
      const permId = permMap.get(permKey);
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { tenantId_roleId_permissionId: { tenantId: tenant.id, roleId: role.id, permissionId: permId } },
        update: {},
        create: { tenantId: tenant.id, roleId: role.id, permissionId: permId, scope: 'all' },
      });
    }
  }
  console.log('5 cargos criados com permissões atribuídas');

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  const vehicleData: Array<{
    plate: string;
    prefix: string;
    type: string;
    capacity: number;
    brand: string;
    model: string;
    year: number;
    fuelType: string;
    odometer: number;
    branchId: string;
    status: string;
  }> = [];

  const plates = [
    'ABC-1234', 'DEF-5678', 'GHI-9012', 'JKL-3456', 'MNO-7890',
    'PQR-1357', 'STU-2468', 'VWX-9753', 'YZA-8642', 'BCD-7531',
    'EFG-1470', 'HIJ-2581', 'KLM-3692', 'NOP-4703', 'QRS-5814',
    'TUV-6925', 'WXY-7036', 'ZAB-8147', 'CDE-9258', 'FGH-0369',
  ];

  for (let i = 0; i < 20; i++) {
    const type = i < 10 ? 'BUS' : i < 15 ? 'VAN' : 'MICRO_BUS';
    const brand = randomElement(VEHICLE_BRANDS);
    const models = VEHICLE_MODELS[brand] ?? ['Standard'];
    const model = randomElement(models);
    vehicleData.push({
      plate: plates[i] ?? `XXX-${i}000`,
      prefix: `ALF-${String(i + 1).padStart(3, '0')}`,
      type,
      capacity: CAPACITIES[type] ?? 46,
      brand,
      model,
      year: randomInt(2018, 2024),
      fuelType: randomElement(FUEL_TYPES),
      odometer: randomInt(50000, 300000),
      branchId: i < 12 ? branchSP.id : branchCPS.id,
      status: i < 17 ? 'AVAILABLE' : i === 17 ? 'IN_MAINTENANCE' : 'UNAVAILABLE',
    });
  }

  const vehicles = await Promise.all(
    vehicleData.map((v) =>
      prisma.vehicle.upsert({
        where: { tenantId_plate: { tenantId: tenant.id, plate: v.plate } },
        update: {},
        create: {
          tenantId: tenant.id,
          branchId: v.branchId,
          plate: v.plate,
          prefix: v.prefix,
          type: v.type,
          capacity: v.capacity,
          brand: v.brand,
          model: v.model,
          year: v.year,
          fuelType: v.fuelType,
          currentOdometer: v.odometer,
          status: v.status,
        },
      }),
    ),
  );
  console.log(`${vehicles.length} veículos criados`);

  // ─── Employees & Drivers ──────────────────────────────────────────────────
  const driverFirstNames = [
    'João', 'Carlos', 'Marcos', 'André', 'Paulo', 'Roberto', 'Ricardo', 'Fábio',
    'Rodrigo', 'Leandro', 'Eduardo', 'Thiago', 'Fernando', 'Rafael', 'Gustavo',
    'Marcelo', 'Bruno', 'Diego', 'Lucas', 'Henrique', 'Alexsandro', 'Wellington',
    'Cleuton', 'Valmir', 'Geovane', 'Adenilson', 'Edivaldo', 'Reginaldo', 'Sidrônio', 'Natalino',
  ];
  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Carvalho',
    'Almeida', 'Ferreira', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Nascimento',
    'Barbosa', 'Ribeiro', 'Cruz', 'Cavalcanti', 'Monteiro',
  ];
  const licenseCategories = ['D', 'D', 'D', 'E', 'D'];

  const employees: string[] = [];
  const drivers: string[] = [];

  for (let i = 0; i < 30; i++) {
    const firstName = driverFirstNames[i] ?? `Motorista${i}`;
    const lastName = randomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const branch = i < 18 ? branchSP.id : branchCPS.id;
    const cpf = `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`;

    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: branch,
        roleId: roles['Motorista'] ?? null,
        name: fullName,
        document: cpf,
        phone: `(${randomInt(11, 19)}) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@alfafretamento.com.br`,
        department: 'Operações',
        admissionDate: daysAgo(randomInt(365, 2000)),
        status: i < 27 ? 'ACTIVE' : 'INACTIVE',
      },
    });
    employees.push(employee.id);

    const licenseNumber = `${randomInt(10000000, 99999999)}`;
    const driver = await prisma.driver.create({
      data: {
        tenantId: tenant.id,
        employeeId: employee.id,
        licenseNumber,
        licenseCategory: randomElement(licenseCategories),
        licenseExpiresAt: daysFromNow(randomInt(-30, 730)),
        availabilityStatus: i < 25 ? 'AVAILABLE' : 'UNAVAILABLE',
        preferredVehicleId: vehicles[i % 20]?.id ?? null,
        notes: i === 2 ? 'Motorista veterano — 15 anos de empresa' : null,
      },
    });
    drivers.push(driver.id);
  }
  console.log(`${employees.length} funcionários e ${drivers.length} motoristas criados`);

  // ─── Users ─────────────────────────────────────────────────────────────────
  // IMPORTANTE: o backend resolve permissões via User → Employee → Role → RolePermissions.
  // Portanto TODO usuário precisa de um employee vinculado a um cargo, senão fica sem
  // nenhuma permissão (user.employee?.role = null → permissions = []).
  //
  // Helper: cria (ou atualiza) um usuário já vinculado a um employee com o cargo informado.
  async function upsertUserWithRole(params: {
    name: string;
    email: string;
    password: string;
    roleName: string;
    branchId: string;
    department: string;
  }): Promise<{ id: string; email: string }> {
    const roleId = roles[params.roleName];
    if (!roleId) {
      throw new Error(`Cargo "${params.roleName}" não encontrado ao criar usuário ${params.email}`);
    }

    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: params.email } },
    });
    if (existing) {
      // Mantém idempotência — atualiza a senha/cargo para refletir o estado desejado.
      const employeeId =
        existing.employeeId ??
        (
          await prisma.employee.create({
            data: {
              tenantId: tenant.id,
              branchId: params.branchId,
              roleId,
              name: params.name,
              email: params.email,
              department: params.department,
              status: 'ACTIVE',
            },
          })
        ).id;
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: params.name,
          passwordHash: await hashPassword(params.password),
          status: 'ACTIVE',
          employeeId,
        },
      });
      if (existing.employeeId) {
        await prisma.employee.update({ where: { id: existing.employeeId }, data: { roleId } });
      }
      return { id: updated.id, email: updated.email };
    }

    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        branchId: params.branchId,
        roleId,
        name: params.name,
        email: params.email,
        department: params.department,
        status: 'ACTIVE',
      },
    });
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        employeeId: employee.id,
        name: params.name,
        email: params.email,
        passwordHash: await hashPassword(params.password),
        status: 'ACTIVE',
      },
    });
    return { id: user.id, email: user.email };
  }

  // ─── ADMIN GERAL DO SISTEMA (via variáveis de ambiente) ─────────────────────
  // Perfil administrador com acesso TOTAL (cargo CEO = todas as 69 permissões),
  // usado para validar funcionalidades reais nos servidores.
  // Credenciais NUNCA ficam em código — vêm de ADMIN_EMAIL / ADMIN_PASSWORD.
  const adminEmail = process.env['ADMIN_EMAIL'];
  const adminPassword = process.env['ADMIN_PASSWORD'];
  const adminName = process.env['ADMIN_NAME'] ?? 'Administrador Geral';

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para o seed. ' +
        'Defina-os no .env (local) ou nas variáveis de ambiente do servidor.',
    );
  }
  if (adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');
  }

  const userAdminGeral = await upsertUserWithRole({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    roleName: 'CEO',
    branchId: branchSP.id,
    department: 'Diretoria',
  });
  console.log(`Admin geral configurado: ${userAdminGeral.email} (cargo CEO — acesso total)`);

  // ─── Usuários de demonstração (dados de apresentação) ───────────────────────
  // Senhas demo vêm de env opcional; default seguro apenas para ambiente local.
  const demoPassword = process.env['DEMO_USER_PASSWORD'] ?? 'Demo@2026!Alfa';
  const userAdmin = await upsertUserWithRole({
    name: 'Administrador Alfa',
    email: 'admin@alfafretamento.com.br',
    password: demoPassword,
    roleName: 'CEO',
    branchId: branchSP.id,
    department: 'Diretoria',
  });
  const userOperador = await upsertUserWithRole({
    name: 'Operador Principal',
    email: 'operador@alfafretamento.com.br',
    password: demoPassword,
    roleName: 'Operador',
    branchId: branchSP.id,
    department: 'Operações',
  });
  const userFinanceiro = await upsertUserWithRole({
    name: 'Ana Financeira',
    email: 'financeiro@alfafretamento.com.br',
    password: demoPassword,
    roleName: 'Financeiro',
    branchId: branchSP.id,
    department: 'Financeiro',
  });
  console.log(`3 usuários de demo criados: ${userAdmin.email}, ${userOperador.email}, ${userFinanceiro.email}`);

  // ─── Clients ──────────────────────────────────────────────────────────────
  const clientRecords: string[] = [];
  for (let i = 0; i < 5; i++) {
    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: CLIENT_NAMES[i] ?? `Cliente ${i}`,
        document: CLIENT_DOCS[i] ?? null,
        contactName: `Diretor ${randomElement(lastNames)}`,
        contactEmail: `contato${i}@cliente${i}.com.br`,
        contactPhone: `(11) ${randomInt(3000, 9999)}-${randomInt(1000, 9999)}`,
        address: `Rua das Flores, ${randomInt(10, 999)} - São Paulo, SP`,
        status: 'ACTIVE',
        createdBy: userAdmin.id,
      },
    });
    clientRecords.push(client.id);

    // Contract per client
    await prisma.contract.create({
      data: {
        tenantId: tenant.id,
        clientId: client.id,
        number: `CTR-2026-${String(i + 1).padStart(3, '0')}`,
        description: `Contrato de fretamento mensal — ${client.name}`,
        value: randomInt(15000, 120000) * 100 / 100,
        startDate: daysAgo(randomInt(30, 365)),
        endDate: daysFromNow(randomInt(30, 365)),
        status: 'ACTIVE',
        createdBy: userAdmin.id,
      },
    });
  }
  console.log(`${clientRecords.length} clientes e contratos criados`);

  // ─── Routes & RoutePoints ─────────────────────────────────────────────────
  const routeNames = [
    { name: 'SP-Industrial Norte', origin: 'Terminal Tietê, SP', destination: 'Polo Industrial Guarulhos' },
    { name: 'SP-Industrial Sul', origin: 'Terminal Santo André, SP', destination: 'ABC Químicos Diadema' },
    { name: 'Colégio Dom Pedro - Manhã', origin: 'Terminal Butantã, SP', destination: 'Colégio Estadual Dom Pedro' },
    { name: 'Colégio Dom Pedro - Tarde', origin: 'Colégio Estadual Dom Pedro', destination: 'Terminal Butantã, SP' },
    { name: 'Hospital - Turno A', origin: 'Terminal Campinas Central', destination: 'Hospital Regional Campinas' },
    { name: 'Hospital - Turno B', origin: 'Hospital Regional Campinas', destination: 'Terminal Campinas Central' },
    { name: 'Condomínio Acácias - Manhã', origin: 'Av. Paulista 1000, SP', destination: 'Condomínio Jardim das Acácias' },
    { name: 'Condomínio Acácias - Tarde', origin: 'Condomínio Jardim das Acácias', destination: 'Av. Paulista 1000, SP' },
    { name: 'Faculdade - Turno Noturno', origin: 'Terminal Campinas Norte', destination: 'Faculdade Tecnológica Interior' },
    { name: 'Turismo Litoral', origin: 'São Paulo, SP', destination: 'Santos, SP' },
    { name: 'Executivo SP-RJ', origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ' },
    { name: 'Transfer Aeroporto GRU', origin: 'Centro SP', destination: 'Aeroporto Internacional GRU' },
    { name: 'Fretamento Campinas-SP', origin: 'Campinas, SP', destination: 'São Paulo, SP' },
    { name: 'Excursão Serra Gaúcha', origin: 'São Paulo, SP', destination: 'Bento Gonçalves, RS' },
    { name: 'Transfer Hotéis SP', origin: 'Aeroporto Congonhas', destination: 'Hotel Unique SP' },
  ];

  const routeIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const routeDef = routeNames[i] ?? { name: `Rota ${i}`, origin: 'Origem', destination: 'Destino' };
    const clientIdx = i % 5;
    const route = await prisma.route.create({
      data: {
        tenantId: tenant.id,
        clientId: clientRecords[clientIdx] ?? null,
        name: routeDef.name,
        origin: routeDef.origin,
        destination: routeDef.destination,
        estimatedDistanceKm: randomInt(15, 600),
        estimatedDurationMinutes: randomInt(30, 480),
        status: 'ACTIVE',
        createdBy: userAdmin.id,
      },
    });
    routeIds.push(route.id);

    // Route points (3 per route: origin, 1 stop, destination)
    const pointsData = [
      { sequence: 1, name: routeDef.origin, type: 'ORIGIN', lat: -23.5 + Math.random() * 0.5, lng: -46.6 + Math.random() * 0.5, time: '06:00' },
      { sequence: 2, name: 'Ponto Intermediário', type: 'STOP', lat: -23.5 + Math.random() * 0.5, lng: -46.6 + Math.random() * 0.5, time: '07:00' },
      { sequence: 3, name: routeDef.destination, type: 'DESTINATION', lat: -23.5 + Math.random() * 0.5, lng: -46.6 + Math.random() * 0.5, time: '08:00' },
    ];
    await prisma.routePoint.createMany({
      data: pointsData.map((p) => ({
        tenantId: tenant.id,
        routeId: route.id,
        sequence: p.sequence,
        name: p.name,
        type: p.type,
        latitude: Math.round(p.lat * 1e7) / 1e7,
        longitude: Math.round(p.lng * 1e7) / 1e7,
        plannedTime: p.time,
      })),
    });
  }
  console.log(`${routeIds.length} rotas criadas com pontos`);

  // ─── Trips (100 viagens, últimos 90 dias) ─────────────────────────────────
  const tripStatuses = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'DELAYED', 'CANCELED'];
  const tripsCreated: string[] = [];

  for (let i = 0; i < 100; i++) {
    const daysOff = randomInt(0, 90);
    const scheduledStart = daysAgo(daysOff);
    scheduledStart.setHours(randomInt(5, 22), randomInt(0, 59), 0, 0);
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + randomInt(60, 480));

    const status = randomElement(tripStatuses);
    const vehicleId = vehicles[i % 17]?.id ?? vehicles[0]?.id;
    const driverIdx = i % 25;
    const driverId = drivers[driverIdx] ?? drivers[0];

    let actualStart: Date | null = null;
    let actualEnd: Date | null = null;
    if (status === 'IN_PROGRESS' || status === 'COMPLETED' || status === 'DELAYED') {
      actualStart = new Date(scheduledStart);
      actualStart.setMinutes(actualStart.getMinutes() + randomInt(-10, 30));
    }
    if (status === 'COMPLETED') {
      actualEnd = new Date(scheduledEnd);
      actualEnd.setMinutes(actualEnd.getMinutes() + randomInt(-5, 45));
    }

    const routeId = routeIds[i % 15] ?? routeIds[0];
    const clientId = clientRecords[i % 5] ?? clientRecords[0];

    const trip = await prisma.trip.create({
      data: {
        tenantId: tenant.id,
        clientId,
        routeId: routeId ?? null,
        vehicleId: vehicleId ?? null,
        driverId: driverId ?? null,
        scheduledStartAt: scheduledStart,
        scheduledEndAt: scheduledEnd,
        actualStartAt: actualStart,
        actualEndAt: actualEnd,
        status,
        passengerCount: randomInt(10, 46),
        notes: i % 20 === 0 ? 'Viagem especial — cliente VIP' : null,
        cancelReason: status === 'CANCELED' ? 'Solicitação do cliente' : null,
        createdBy: userOperador.id,
      },
    });
    tripsCreated.push(trip.id);

    // Add 2-5 passengers per trip
    const passengerCount = randomInt(2, 5);
    await prisma.tripPassenger.createMany({
      data: Array.from({ length: passengerCount }, (_, p) => ({
        tenantId: tenant.id,
        tripId: trip.id,
        name: `Passageiro ${p + 1} da Viagem ${i + 1}`,
        phone: `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        boardingPoint: `Ponto ${p + 1}`,
        status: 'CONFIRMED',
      })),
    });
  }
  console.log(`${tripsCreated.length} viagens criadas`);

  // ─── Fuel Records (50 abastecimentos, 3-5 anomalias) ─────────────────────
  let anomalyCount = 0;
  for (let i = 0; i < 50; i++) {
    const vehicle = vehicles[i % 20];
    if (!vehicle) continue;
    const driverIdx = i % 25;
    const driverId = drivers[driverIdx] ?? drivers[0];
    const liters = randomInt(80, 400) + Math.random();
    const unitPrice = (randomInt(580, 720) / 100);
    const totalAmount = Math.round(liters * unitPrice * 100) / 100;
    const odometer = (vehicle.currentOdometer?.toNumber() ?? 100000) + randomInt(i * 200, i * 500 + 1000);
    const suppliedAt = daysAgo(randomInt(0, 90));

    // Force 4 anomalies
    const isAnomaly = i >= 46;
    if (isAnomaly) anomalyCount++;

    await prisma.fuelRecord.create({
      data: {
        tenantId: tenant.id,
        vehicleId: vehicle.id,
        driverId: driverId ?? null,
        branchId: i < 30 ? branchSP.id : branchCPS.id,
        fuelStationName: `Posto ${randomElement(['Shell', 'Ipiranga', 'Petrobras', 'BR'])} — ${randomElement(['Paulista', 'Centro', 'Norte', 'Sul'])}`,
        fuelType: vehicle.fuelType ?? 'DIESEL',
        liters,
        unitPrice,
        totalAmount,
        odometer,
        suppliedAt,
        anomalyFlag: isAnomaly,
        anomalyReason: isAnomaly ? 'Consumo km/l abaixo de 80% da média histórica do veículo' : null,
        notes: i % 15 === 0 ? 'Abastecimento completo — tanque cheio' : null,
        createdBy: userOperador.id,
      },
    });
  }
  console.log(`50 abastecimentos criados (${anomalyCount} anomalias)`);

  // ─── Occurrences (20 ocorrências) ─────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const type = randomElement(OCCURRENCE_TYPES);
    const severity = randomElement(OCCURRENCE_SEVERITY);
    const status = randomElement(OCCURRENCE_STATUS);
    const tripId = tripsCreated[i * 5] ?? tripsCreated[0];
    const vehicleId = vehicles[i % 20]?.id ?? vehicles[0]?.id;
    const driverId = drivers[i % 25] ?? drivers[0];

    await prisma.occurrence.create({
      data: {
        tenantId: tenant.id,
        tripId: tripId ?? null,
        vehicleId: vehicleId ?? null,
        driverId: driverId ?? null,
        clientId: clientRecords[i % 5] ?? null,
        type,
        severity,
        description: getOccurrenceDescription(type),
        status,
        responsibleUserId: status !== 'OPEN' ? userOperador.id : null,
        actionTaken: status === 'RESOLVED' ? getActionTaken(type) : null,
        resolvedAt: status === 'RESOLVED' ? daysAgo(randomInt(0, 20)) : null,
        notes: severity === 'CRITICAL' ? 'URGENTE — escalar para gerência imediatamente' : null,
        createdBy: userOperador.id,
      },
    });
  }
  console.log('20 ocorrências criadas');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log(`   Tenant: ${tenant.name} (${tenant.id})`);
  console.log('   Credenciais de acesso:');
  console.log('   admin@alfafretamento.com.br   — senha: Admin@2026!');
  console.log('   operador@alfafretamento.com.br — senha: Operador@2026!');
  console.log('   financeiro@alfafretamento.com.br — senha: Financeiro@2026!');
}

function getOccurrenceDescription(type: string): string {
  const descriptions: Record<string, string> = {
    ACCIDENT: 'Colisão leve no retrovisor direito em manobra no terminal. Sem feridos.',
    BREAKDOWN: 'Falha no sistema de ar-condicionado durante a viagem. Veículo concluiu a rota.',
    DELAY: 'Atraso de 35 minutos devido a congestionamento na Marginal Tietê.',
    COMPLAINT: 'Passageiro relatou comportamento inadequado durante a viagem.',
    NEAR_MISS: 'Quase colisão evitada pelo motorista em cruzamento sem sinalização.',
    TRAFFIC: 'Bloqueio de via por acidente de terceiros — rota alternativa utilizada.',
    FUEL_THEFT: 'Suspeita de desvio de combustível identificada em relatório de hodômetro.',
    PASSENGER_COMPLAINT: 'Reclamação formal de passageiro sobre temperatura do ar-condicionado.',
  };
  return descriptions[type] ?? `Ocorrência do tipo ${type} registrada.`;
}

function getActionTaken(type: string): string {
  const actions: Record<string, string> = {
    ACCIDENT: 'Boletim de ocorrência lavrado. Veículo inspecionado e liberado. Seguro acionado.',
    BREAKDOWN: 'Manutenção corretiva realizada no pátio. Ar-condicionado substituído.',
    DELAY: 'Passageiros notificados. Rota alternativa implementada para próximas viagens.',
    COMPLAINT: 'Conversa com motorista realizada. Advertência registrada.',
    NEAR_MISS: 'Treinamento de direção defensiva agendado para o motorista.',
    TRAFFIC: 'Mapeamento de rotas alternativas atualizado.',
    FUEL_THEFT: 'Investigação interna realizada. Motorista inocentado — erro de hodômetro.',
    PASSENGER_COMPLAINT: 'Manutenção preventiva do sistema de climatização agendada.',
  };
  return actions[type] ?? `Ação corretiva tomada para ocorrência do tipo ${type}.`;
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
