import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { QUEUES } from '../outbox/outbox.processor';

export type ReportType = 'FUEL_MONTHLY' | 'TRIPS_MONTHLY' | 'FLEET_PERFORMANCE';

export interface ReportJobData {
  tenantId: string;
  userId: string;
  reportType: ReportType;
  params: Record<string, unknown>;
}

interface ColumnDef {
  header: string;
  key: string;
  width?: number;
}

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Processor(QUEUES.REPORTS)
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /**
   * Geração genérica de relatórios — roteia por reportType, consulta dados REAIS,
   * gera um arquivo Excel (.xlsx), faz upload ao S3 e notifica o usuário com a URL
   * assinada de download. Em caso de erro, relança para o BullMQ aplicar o backoff.
   */
  @Process('GENERATE_REPORT')
  async generateReport(job: Job<ReportJobData>): Promise<void> {
    const { tenantId, userId, reportType, params } = job.data;
    this.logger.log(
      `Iniciando relatório — tenantId=${tenantId} userId=${userId} tipo=${reportType}`,
    );

    try {
      switch (reportType) {
        case 'FUEL_MONTHLY':
          await this.buildFuelMonthly(tenantId, userId, params);
          break;
        case 'TRIPS_MONTHLY':
          await this.buildTripsMonthly(tenantId, userId, params);
          break;
        case 'FLEET_PERFORMANCE':
          await this.buildFleetPerformance(tenantId, userId);
          break;
        default:
          throw new Error(`reportType desconhecido: ${String(reportType)}`);
      }
    } catch (err) {
      this.logger.error(
        { err, tenantId, reportType, userId, jobId: job.id },
        'Falha na geração do relatório — BullMQ irá retentar',
      );
      throw err;
    }
  }

  /** Atalho dedicado para o relatório mensal de combustível. */
  @Process('GENERATE_FUEL_MONTHLY')
  async generateFuelMonthly(job: Job<ReportJobData>): Promise<void> {
    const { tenantId, userId, params } = job.data;
    try {
      await this.buildFuelMonthly(tenantId, userId, params);
    } catch (err) {
      this.logger.error({ err, tenantId, userId }, 'Relatório mensal de combustível falhou — retentando');
      throw err;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Relatórios concretos (dados reais)
  // ────────────────────────────────────────────────────────────────────────

  private parseMonth(params: Record<string, unknown>): { year: number; monthNum: number; label: string } {
    const month = params['month'] as string | undefined; // 'YYYY-MM'
    if (!month) throw new Error('params.month (YYYY-MM) é obrigatório');
    const [year, monthNum] = month.split('-').map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new Error(`Formato de mês inválido: ${month}`);
    }
    return { year, monthNum, label: month };
  }

  private async buildFuelMonthly(
    tenantId: string,
    userId: string,
    params: Record<string, unknown>,
  ): Promise<void> {
    const { year, monthNum, label } = this.parseMonth(params);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const records = await this.prisma.fuelRecord.findMany({
      where: { tenantId, deletedAt: null, suppliedAt: { gte: startDate, lte: endDate } },
      orderBy: { suppliedAt: 'asc' },
      include: { vehicle: { select: { plate: true, prefix: true } } },
    });

    let totalLiters = 0;
    let totalAmount = 0;
    let anomalyCount = 0;
    const rows = records.map((r) => {
      const liters = Number(r.liters);
      const amount = Number(r.totalAmount);
      totalLiters += liters;
      totalAmount += amount;
      if (r.anomalyFlag) anomalyCount += 1;
      return {
        suppliedAt: r.suppliedAt.toISOString().slice(0, 10),
        vehicle: r.vehicle?.prefix ?? r.vehicle?.plate ?? '—',
        station: r.fuelStationName ?? '—',
        liters: liters.toFixed(3),
        amount: amount.toFixed(2),
        odometer: Number(r.odometer).toFixed(1),
        anomaly: r.anomalyFlag ? 'SIM' : '',
      };
    });

    const columns: ColumnDef[] = [
      { header: 'Data', key: 'suppliedAt', width: 12 },
      { header: 'Veículo', key: 'vehicle', width: 16 },
      { header: 'Posto', key: 'station', width: 28 },
      { header: 'Litros', key: 'liters', width: 12 },
      { header: 'Valor (R$)', key: 'amount', width: 14 },
      { header: 'Hodômetro', key: 'odometer', width: 14 },
      { header: 'Anomalia', key: 'anomaly', width: 10 },
    ];

    const buffer = await this.buildXlsx(`Combustível ${label}`, columns, rows, [
      { label: 'Total de abastecimentos', value: records.length },
      { label: 'Litros totais', value: totalLiters.toFixed(3) },
      { label: 'Valor total (R$)', value: totalAmount.toFixed(2) },
      { label: 'Anomalias detectadas', value: anomalyCount },
    ]);

    await this.deliverReport({
      tenantId,
      userId,
      reportType: 'FUEL_MONTHLY',
      title: `Relatório Mensal de Combustível — ${label}`,
      fileName: `combustivel-${label}.xlsx`,
      buffer,
      summary: {
        month: label,
        totalRecords: records.length,
        totalLiters,
        totalAmount,
        anomalyCount,
      },
    });
  }

  private async buildTripsMonthly(
    tenantId: string,
    userId: string,
    params: Record<string, unknown>,
  ): Promise<void> {
    const { year, monthNum, label } = this.parseMonth(params);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const trips = await this.prisma.trip.findMany({
      where: { tenantId, deletedAt: null, scheduledStartAt: { gte: startDate, lte: endDate } },
      orderBy: { scheduledStartAt: 'asc' },
      include: {
        vehicle: { select: { plate: true, prefix: true } },
        driver: { select: { licenseNumber: true, employee: { select: { name: true } } } },
        route: { select: { name: true } },
      },
    });

    const byStatus: Record<string, number> = {};
    const rows = trips.map((t) => {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      return {
        scheduledStartAt: t.scheduledStartAt.toISOString().slice(0, 16).replace('T', ' '),
        route: t.route?.name ?? '—',
        vehicle: t.vehicle?.prefix ?? t.vehicle?.plate ?? '—',
        driver: t.driver?.employee?.name ?? t.driver?.licenseNumber ?? '—',
        status: t.status,
      };
    });

    const columns: ColumnDef[] = [
      { header: 'Início Previsto', key: 'scheduledStartAt', width: 18 },
      { header: 'Rota', key: 'route', width: 28 },
      { header: 'Veículo', key: 'vehicle', width: 16 },
      { header: 'Motorista', key: 'driver', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    const summaryRows = Object.entries(byStatus).map(([status, count]) => ({
      label: `Viagens ${status}`,
      value: count,
    }));

    const buffer = await this.buildXlsx(`Viagens ${label}`, columns, rows, [
      { label: 'Total de viagens', value: trips.length },
      ...summaryRows,
    ]);

    await this.deliverReport({
      tenantId,
      userId,
      reportType: 'TRIPS_MONTHLY',
      title: `Relatório Mensal de Viagens — ${label}`,
      fileName: `viagens-${label}.xlsx`,
      buffer,
      summary: { month: label, totalTrips: trips.length, byStatus },
    });
  }

  private async buildFleetPerformance(tenantId: string, userId: string): Promise<void> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { prefix: 'asc' },
      select: {
        plate: true,
        prefix: true,
        brand: true,
        model: true,
        currentOdometer: true,
        status: true,
      },
    });

    const rows = vehicles.map((v) => ({
      prefix: v.prefix ?? '—',
      plate: v.plate,
      brand: v.brand ?? '—',
      model: v.model ?? '—',
      odometer: v.currentOdometer ? Number(v.currentOdometer).toFixed(1) : '—',
      status: v.status,
    }));

    const columns: ColumnDef[] = [
      { header: 'Prefixo', key: 'prefix', width: 12 },
      { header: 'Placa', key: 'plate', width: 12 },
      { header: 'Marca', key: 'brand', width: 18 },
      { header: 'Modelo', key: 'model', width: 18 },
      { header: 'Hodômetro', key: 'odometer', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    const buffer = await this.buildXlsx('Desempenho da Frota', columns, rows, [
      { label: 'Total de veículos', value: vehicles.length },
    ]);

    await this.deliverReport({
      tenantId,
      userId,
      reportType: 'FLEET_PERFORMANCE',
      title: 'Relatório de Desempenho da Frota',
      fileName: `frota-${new Date().toISOString().slice(0, 10)}.xlsx`,
      buffer,
      summary: { totalVehicles: vehicles.length },
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────

  /** Monta uma planilha .xlsx com cabeçalho, linhas e um bloco de resumo. */
  private async buildXlsx(
    sheetName: string,
    columns: ColumnDef[],
    rows: Array<Record<string, unknown>>,
    summary: Array<{ label: string; value: unknown }>,
  ): Promise<Buffer> {
    const wb = new Workbook();
    wb.creator = 'Gestão Fretamento Pro';
    wb.created = new Date();

    const ws = wb.addWorksheet(sheetName.slice(0, 31));
    ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 16 }));
    ws.getRow(1).font = { bold: true };
    for (const row of rows) ws.addRow(row);

    if (summary.length > 0) {
      ws.addRow({});
      const sep = ws.addRow({ [columns[0]!.key]: 'RESUMO' });
      sep.font = { bold: true };
      for (const item of summary) {
        ws.addRow({ [columns[0]!.key]: item.label, [columns[1]?.key ?? columns[0]!.key]: item.value });
      }
    }

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  /**
   * Faz upload do arquivo ao S3 (se configurado) e cria a notificação com a URL
   * assinada de download. Se o S3 não estiver configurado, notifica mesmo assim
   * com o resumo dos dados (sem URL), sem quebrar o worker.
   */
  private async deliverReport(args: {
    tenantId: string;
    userId: string;
    reportType: ReportType;
    title: string;
    fileName: string;
    buffer: Buffer;
    summary: Record<string, unknown>;
  }): Promise<void> {
    const { tenantId, userId, reportType, title, fileName, buffer, summary } = args;

    let downloadUrl: string | null = null;
    let storageKey: string | null = null;

    if (this.s3.isConfigured()) {
      storageKey = `reports/${tenantId}/${Date.now()}-${fileName}`;
      await this.s3.uploadBuffer(storageKey, buffer, XLSX_CONTENT_TYPE);
      downloadUrl = await this.s3.getSignedDownloadUrl(storageKey, 24 * 3600);
    } else {
      this.logger.warn(
        `S3 não configurado — relatório "${reportType}" gerado (${buffer.length} bytes) mas sem URL de download.`,
      );
    }

    const body = downloadUrl
      ? `O relatório "${title}" está pronto para download.`
      : `O relatório "${title}" foi gerado. Configure o armazenamento (S3) para habilitar o download.`;

    await this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        type: 'REPORT_READY',
        title,
        body,
        entityType: 'Report',
        entityId: storageKey ?? reportType,
        data: {
          reportType,
          fileName,
          fileSizeBytes: buffer.length,
          storageKey,
          downloadUrl,
          generatedAt: new Date().toISOString(),
          ...summary,
        } as never,
      },
    });

    this.logger.log(
      `Relatório entregue — tenantId=${tenantId} tipo=${reportType} bytes=${buffer.length} url=${downloadUrl ? 'sim' : 'não'}`,
    );
  }
}
