import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUES } from '../outbox/outbox.processor';

export type ReportType = 'FUEL_MONTHLY' | 'TRIPS_MONTHLY' | 'FLEET_PERFORMANCE';

export interface ReportJobData {
  tenantId: string;
  userId: string;
  reportType: ReportType;
  params: Record<string, unknown>;
}

@Processor(QUEUES.REPORTS)
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates reports asynchronously and notifies the requesting user when done.
   *
   * Current implementation is a placeholder:
   * - In production, generate a PDF/Excel via a dedicated service, upload to S3,
   *   and include a signed download URL in the notification data.
   * - The job retries automatically (BullMQ backoff) if an error is thrown.
   */
  @Process('GENERATE_REPORT')
  async generateReport(job: Job<ReportJobData>): Promise<void> {
    const { tenantId, userId, reportType, params } = job.data;

    this.logger.log(
      `Starting report generation — tenantId=${tenantId} userId=${userId} reportType=${reportType}`,
    );

    try {
      // ── TODO: call report generation service / upload to S3 ──
      // const fileKey = await this.reportGeneratorService.generate(reportType, params);
      // const downloadUrl = await this.s3Service.getSignedUrl(fileKey);

      await this.prisma.notification.create({
        data: {
          tenantId,
          userId,
          type: 'REPORT_READY',
          title: 'Relatório pronto para download',
          body: `O relatório "${reportType}" foi gerado com sucesso e está disponível para download.`,
          entityType: 'Report',
          entityId: job.id?.toString() ?? job.data.reportType,
          data: {
            reportType,
            params,
            generatedAt: new Date().toISOString(),
            // downloadUrl will be added here when S3 integration is implemented
          } as never,
        },
      });

      this.logger.log(
        `Report notification sent — tenantId=${tenantId} reportType=${reportType} userId=${userId}`,
      );
    } catch (err) {
      this.logger.error(
        {
          err,
          tenantId,
          reportType,
          userId,
          jobId: job.id,
        },
        'Report generation failed — BullMQ will retry',
      );
      // Re-throw so BullMQ marks the job as failed and applies the backoff policy
      throw err;
    }
  }

  /**
   * Generates a monthly fuel summary report.
   * Kept separate to allow independent retry behaviour.
   */
  @Process('GENERATE_FUEL_MONTHLY')
  async generateFuelMonthly(job: Job<ReportJobData>): Promise<void> {
    const { tenantId, userId, params } = job.data;

    this.logger.log(
      `Starting fuel monthly report — tenantId=${tenantId} month=${String(params['month'])}`,
    );

    try {
      const month = params['month'] as string | undefined; // expected: 'YYYY-MM'
      if (!month) throw new Error('params.month is required for GENERATE_FUEL_MONTHLY');

      const [year, monthNum] = month.split('-').map(Number);
      if (!year || !monthNum) throw new Error(`Invalid month format: ${month}`);

      const startDate = new Date(year, monthNum - 1, 1);
      const endDate   = new Date(year, monthNum, 0, 23, 59, 59, 999);

      const stats = await this.prisma.fuelRecord.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          suppliedAt: { gte: startDate, lte: endDate },
        },
        _sum: { liters: true, totalAmount: true },
        _count: { id: true },
        _avg: { liters: true },
      });

      const anomalyCount = await this.prisma.fuelRecord.count({
        where: {
          tenantId,
          deletedAt: null,
          suppliedAt: { gte: startDate, lte: endDate },
          anomalyFlag: true,
        },
      });

      await this.prisma.notification.create({
        data: {
          tenantId,
          userId,
          type: 'REPORT_READY',
          title: `Relatório Mensal de Combustível — ${month}`,
          body: `Relatório gerado: ${stats._count.id} abastecimentos, ${Number(stats._sum.liters ?? 0).toFixed(1)} L total, ${anomalyCount} anomalias.`,
          data: {
            reportType: 'FUEL_MONTHLY',
            month,
            totalRecords: stats._count.id,
            totalLiters: Number(stats._sum.liters ?? 0),
            totalAmount: Number(stats._sum.totalAmount ?? 0),
            anomalyCount,
            generatedAt: new Date().toISOString(),
          } as never,
        },
      });

      this.logger.log(
        `Fuel monthly report completed — tenantId=${tenantId} month=${month} records=${stats._count.id}`,
      );
    } catch (err) {
      this.logger.error({ err, tenantId, userId }, 'Fuel monthly report failed — retrying');
      throw err;
    }
  }
}
