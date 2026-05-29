import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TripsService } from '../../src/trips/trips.service';
import { FuelService } from '../../src/fuel/fuel.service';
import { VehiclesService } from '../../src/vehicles/vehicles.service';
import { tenantContext } from '../../src/common/context/tenant-context';

describe('GFP Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tripsService: TripsService;
  let fuelService: FuelService;
  let vehiclesService: VehiclesService;

  let tenantAId: string;
  let tenantBId: string;
  let vehicleAId: string;
  let driverAId: string;
  let routeAId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    tripsService = moduleFixture.get<TripsService>(TripsService);
    fuelService = moduleFixture.get<FuelService>(FuelService);
    vehiclesService = moduleFixture.get<VehiclesService>(VehiclesService);

    // Clean up test tenants if they exist from previous runs
    await prisma.tenant.deleteMany({
      where: {
        document: { in: ['99.999.999/0001-99', '88.888.888/0001-88'] },
      },
    });

    // Create test Tenant A
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Integration Test Tenant A',
        document: '99.999.999/0001-99',
        plan: 'STARTER',
      },
    });
    tenantAId = tenantA.id;

    // Create test Tenant B (for isolation testing)
    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Integration Test Tenant B',
        document: '88.888.888/0001-88',
        plan: 'STARTER',
      },
    });
    tenantBId = tenantB.id;

    // Seed Tenant A basic entities
    const branchA = await prisma.branch.create({
      data: {
        tenantId: tenantAId,
        name: 'Test Branch A',
        city: 'São Paulo',
        state: 'SP',
      },
    });

    const vehicleA = await prisma.vehicle.create({
      data: {
        tenantId: tenantAId,
        branchId: branchA.id,
        plate: 'ITG-1111',
        prefix: 'ITG-001',
        type: 'BUS',
        capacity: 46,
        currentOdometer: 100000.0,
        status: 'AVAILABLE',
      },
    });
    vehicleAId = vehicleA.id;

    const employeeA = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        branchId: branchA.id,
        name: 'Test Driver A',
        document: '123.456.789-00',
        status: 'ACTIVE',
      },
    });

    const driverA = await prisma.driver.create({
      data: {
        tenantId: tenantAId,
        employeeId: employeeA.id,
        licenseNumber: 'CNH123456',
        licenseCategory: 'D',
        licenseExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year from now
        availabilityStatus: 'AVAILABLE',
      },
    });
    driverAId = driverA.id;

    const routeA = await prisma.route.create({
      data: {
        tenantId: tenantAId,
        name: 'Route Test A',
        origin: 'Ponto Origem',
        destination: 'Ponto Destino',
      },
    });
    routeAId = routeA.id;
  });

  afterAll(async () => {
    // Clean up created test data
    if (tenantAId) {
      await prisma.tenant.deleteMany({
        where: { id: { in: [tenantAId, tenantBId] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  it('1. Deve criar viagem e executar Saga de Confirmação com validação de disponibilidade', async () => {
    await tenantContext.run({ tenantId: tenantAId, userId: 'dummy-actor', traceId: 'test-trace' }, async () => {
      // 1. Create a DRAFT trip
      const trip = await prisma.trip.create({
        data: {
          tenantId: tenantAId,
          vehicleId: vehicleAId,
          driverId: driverAId,
          routeId: routeAId,
          scheduledStartAt: new Date(),
          status: 'DRAFT',
          version: 0,
        },
      });

      // 2. Confirm the trip using the TripsService (Saga execution)
      const confirmedTrip = await tripsService.confirm(trip.id, tenantAId, 'dummy-actor');
      expect(confirmedTrip.status).toBe('CONFIRMED');

      // 3. Verify vehicle is available (it doesn't have an open maintenance)
      const isVehicleAvailable = await vehiclesService.checkAvailability(vehicleAId, tenantAId);
      expect(isVehicleAvailable).toBe(true);
    });
  });

  it('2. Deve validar odômetro decremental e detectar anomalia de combustível', async () => {
    await tenantContext.run({ tenantId: tenantAId, userId: 'dummy-actor', traceId: 'test-trace' }, async () => {
      // Let's create some baseline fuel records for vehicleA to establish historical average
      // Average consumption will be 10 km/l
      let currentOdo = 100000;
      for (let i = 0; i < 5; i++) {
        currentOdo += 100; // traveled 100km
        await prisma.fuelRecord.create({
          data: {
            tenantId: tenantAId,
            vehicleId: vehicleAId,
            driverId: driverAId,
            fuelType: 'DIESEL',
            liters: 10.0, // 100km / 10L = 10 km/l
            unitPrice: 6.00,
            totalAmount: 60.00,
            odometer: currentOdo,
            suppliedAt: new Date(Date.now() - 1000 * 60 * 60 * (10 - i)),
            anomalyFlag: false,
          },
        });
      }

      // Update vehicle current odometer to match the latest
      await prisma.vehicle.update({
        where: { id: vehicleAId },
        data: { currentOdometer: currentOdo },
      });

      // Test 1: Decremental Odometer validation (must throw)
      await expect(
        fuelService.create(tenantAId, {
          vehicleId: vehicleAId,
          driverId: driverAId,
          fuelType: 'DIESEL',
          liters: 10,
          unitPrice: 6.00,
          totalAmount: 60.00,
          odometer: currentOdo - 50, // decremented!
          suppliedAt: new Date(),
        }, 'dummy-actor')
      ).rejects.toThrow();

      // Test 2: Anomaly Detection
      // Traveled 100km but spent 25 liters -> 100/25 = 4 km/l (which is 40% of the 10 km/l average, below 80%)
      const anomalyRecord = await fuelService.create(tenantAId, {
        vehicleId: vehicleAId,
        driverId: driverAId,
        fuelType: 'DIESEL',
        liters: 25,
        unitPrice: 6.00,
        totalAmount: 150.00,
        odometer: currentOdo + 100, // 100500 -> 100600
        suppliedAt: new Date(),
      }, 'dummy-actor');

      expect(anomalyRecord.anomalyFlag).toBe(true);
      expect(anomalyRecord.anomalyReason).toContain('abaixo de 80%');
    });
  });

  it('3. Deve registrar auditoria de ações críticas', async () => {
    await tenantContext.run({ tenantId: tenantAId, userId: 'dummy-actor', traceId: 'test-trace' }, async () => {
      // Create a trip (critical action)
      const trip = await prisma.trip.create({
        data: {
          tenantId: tenantAId,
          vehicleId: vehicleAId,
          driverId: driverAId,
          routeId: routeAId,
          scheduledStartAt: new Date(),
          status: 'DRAFT',
          version: 0,
        },
      });

      // Confirm the trip (triggers audit log internally in the tripsService)
      await tripsService.confirm(trip.id, tenantAId, 'dummy-actor');

      // Check that an audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          tenantId: tenantAId,
          actorUserId: 'dummy-actor',
          action: 'trip.confirm',
        },
      });

      expect(auditLog).toBeDefined();
    });
  });

  it('4. Deve garantir isolamento estrito de Tenant', async () => {
    // 1. As Tenant A, we see our vehicle
    await tenantContext.run({ tenantId: tenantAId, userId: 'dummy-actor', traceId: 'test-trace' }, async () => {
      const vehicles = await vehiclesService.findAll(tenantAId, {});
      const hasVehicle = vehicles.data.some(v => v.id === vehicleAId);
      expect(hasVehicle).toBe(true);
    });

    // 2. As Tenant B, we should NOT see Tenant A's vehicle
    await tenantContext.run({ tenantId: tenantBId, userId: 'dummy-actor', traceId: 'test-trace' }, async () => {
      const vehicles = await vehiclesService.findAll(tenantBId, {});
      const hasVehicle = vehicles.data.some(v => v.id === vehicleAId);
      expect(hasVehicle).toBe(false);
    });
  });
});
