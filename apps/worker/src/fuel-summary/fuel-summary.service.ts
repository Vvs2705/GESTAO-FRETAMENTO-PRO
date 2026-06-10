import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FuelSummaryService {
  private readonly logger = new Logger(FuelSummaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 1 * * *') // Runs daily at 01:00 AM (for the previous day)
  async handleDailySummaryCron() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.logger.log(`Starting daily summary cron for date: ${yesterday.toISOString().split('T')[0]}`);
    try {
      await this.generateDailySummary(yesterday);
      this.logger.log('Daily summary cron finished successfully');
    } catch (err) {
      this.logger.error('Error running daily summary cron', err);
    }
  }

  @Cron('59 23 * * *') // Runs daily at 23:59 PM
  async handleTankSnapshotCron() {
    const today = new Date();
    this.logger.log(`Starting tank stock snapshot cron for date: ${today.toISOString().split('T')[0]}`);
    try {
      await this.generateTankStockSnapshots(today);
      this.logger.log('Tank stock snapshot cron finished successfully');
    } catch (err) {
      this.logger.error('Error running tank stock snapshot cron', err);
    }
  }

  async generateDailySummary(date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active tenants
    const tenants = await this.prisma.tenant.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const tenant of tenants) {
      const tenantId = tenant.id;

      // 1. Fetch approved deliveries for the day
      const deliveries = await this.prisma.fuelDelivery.findMany({
        where: {
          tenantId,
          status: 'approved',
          deliveryDate: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
        },
      });

      // 2. Fetch approved internal fuelings
      const internalFuelings = await this.prisma.internalFueling.findMany({
        where: {
          tenantId,
          status: 'approved',
          occurredAt: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
        },
      });

      // 3. Fetch approved external fuelings
      const externalFuelings = await this.prisma.externalFueling.findMany({
        where: {
          tenantId,
          status: 'approved',
          occurredAt: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
        },
      });

      // Group data by branchId and fuelProductId
      const groups = new Map<string, {
        branchId: string;
        fuelProductId: string;
        litersIn: number;
        litersOut: number;
        costOut: number;
        count: number;
        anomalies: number;
      }>();

      const getGroupKey = (branchId: string, fuelProductId: string) => `${branchId}::${fuelProductId}`;

      const getOrCreateGroup = (branchId: string, fuelProductId: string) => {
        const key = getGroupKey(branchId, fuelProductId);
        if (!groups.has(key)) {
          groups.set(key, {
            branchId,
            fuelProductId,
            litersIn: 0,
            litersOut: 0,
            costOut: 0,
            count: 0,
            anomalies: 0,
          });
        }
        return groups.get(key)!;
      };

      // Aggregate deliveries
      for (const d of deliveries) {
        const g = getOrCreateGroup(d.branchId, d.fuelProductId);
        g.litersIn += Number(d.acceptedLiters ?? 0);
      }

      // Aggregate internal fuelings
      for (const f of internalFuelings) {
        const g = getOrCreateGroup(f.branchId, f.fuelProductId);
        g.litersOut += Number(f.liters);
        g.costOut += Number(f.totalCostCalculated ?? 0);
        g.count += 1;
        if (f.anomalyFlag) g.anomalies += 1;
      }

      // Aggregate external fuelings
      for (const f of externalFuelings) {
        // External fueling branchId is optional, fallback to a default or skip
        const branchId = f.branchId ?? '00000000-0000-0000-0000-000000000001'; // Default SP branch
        const g = getOrCreateGroup(branchId, f.fuelProductId);
        g.litersOut += Number(f.liters);
        g.costOut += Number(f.totalAmount);
        g.count += 1;
        if (f.anomalyFlag) g.anomalies += 1;
      }

      // Upsert daily summary records
      for (const g of groups.values()) {
        await this.prisma.fuelDailySummary.upsert({
          where: {
            tenantId_branchId_fuelProductId_summaryDate: {
              tenantId,
              branchId: g.branchId,
              fuelProductId: g.fuelProductId,
              summaryDate: startOfDay,
            },
          },
          update: {
            totalLitersIn: g.litersIn,
            totalLitersOut: g.litersOut,
            totalCostOut: g.costOut,
            fuelingCount: g.count,
            anomalyCount: g.anomalies,
          },
          create: {
            tenantId,
            branchId: g.branchId,
            fuelProductId: g.fuelProductId,
            summaryDate: startOfDay,
            totalLitersIn: g.litersIn,
            totalLitersOut: g.litersOut,
            totalCostOut: g.costOut,
            fuelingCount: g.count,
            anomalyCount: g.anomalies,
          },
        });
      }
    }
  }

  async generateTankStockSnapshots(date: Date): Promise<void> {
    const snapshotDate = new Date(date);
    snapshotDate.setHours(0, 0, 0, 0);

    // Fetch all active tanks
    const tanks = await this.prisma.fuelTank.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
    });

    for (const tank of tanks) {
      const currentStock = Number(tank.currentStockLiters);

      // Find unit price from last approved delivery for this tank
      const lastDelivery = await this.prisma.fuelDelivery.findFirst({
        where: {
          fuelTankId: tank.id,
          status: 'approved',
          deletedAt: null,
        },
        orderBy: { deliveryDate: 'desc' },
        select: { unitPrice: true },
      });

      const unitPrice = lastDelivery ? Number(lastDelivery.unitPrice) : 0;
      const stockValue = currentStock * unitPrice;

      await this.prisma.tankStockSnapshot.upsert({
        where: {
          tenantId_tankId_snapshotDate: {
            tenantId: tank.tenantId,
            tankId: tank.id,
            snapshotDate,
          },
        },
        update: {
          stockLiters: currentStock,
          stockValue,
          capacityLiters: Number(tank.capacityLiters),
        },
        create: {
          tenantId: tank.tenantId,
          tankId: tank.id,
          snapshotDate,
          stockLiters: currentStock,
          stockValue,
          capacityLiters: Number(tank.capacityLiters),
        },
      });
    }
  }
}
