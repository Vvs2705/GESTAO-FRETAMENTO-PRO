import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

interface ExpiryThreshold {
  days: number;
  notifType: string;
  title: string;
}

const EXPIRY_THRESHOLDS: ExpiryThreshold[] = [
  { days: 7,  notifType: 'DOCUMENT_EXPIRING_7D',  title: 'Documento vence em 7 dias' },
  { days: 30, notifType: 'DOCUMENT_EXPIRING_30D', title: 'Documento vence em 30 dias' },
  { days: 60, notifType: 'DOCUMENT_EXPIRING_60D', title: 'Documento vence em 60 dias' },
];

@Injectable()
export class DocumentExpiryProcessor {
  private readonly logger = new Logger(DocumentExpiryProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs daily at 08:00.
   * Scans for documents expiring exactly on each threshold date and creates
   * in-app notifications + outbox events for further downstream processing.
   *
   * Using exact date windows (start/end of day) prevents duplicate notifications:
   * a document expiring in 7 days only appears in the 7d check, not in 30d or 60d.
   */
  @Cron('0 8 * * *')
  async checkExpiringDocuments(): Promise<void> {
    this.logger.log('Starting document expiry check...');
    const now = new Date();

    for (const threshold of EXPIRY_THRESHOLDS) {
      await this.processThreshold(now, threshold);
    }

    this.logger.log('Document expiry check completed');
  }

  private async processThreshold(
    now: Date,
    threshold: ExpiryThreshold,
  ): Promise<void> {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + threshold.days);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const expiringDocs = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        expiresAt: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        id: true,
        tenantId: true,
        documentType: true,
        entityType: true,
        entityId: true,
        expiresAt: true,
      },
    });

    if (expiringDocs.length === 0) return;

    let notifCount = 0;

    for (const doc of expiringDocs) {
      // Find users with document.read in this tenant
      const users = await this.prisma.user.findMany({
        where: {
          tenantId: doc.tenantId,
          deletedAt: null,
          status: 'ACTIVE',
          employee: {
            role: {
              rolePermissions: {
                some: { permission: { key: 'document.read' } },
              },
            },
          },
        },
        select: { id: true },
      });

      if (users.length === 0) continue;

      await this.prisma.$transaction(async (tx) => {
        // Create in-app notifications — skipDuplicates guards against re-runs on same day
        await tx.notification.createMany({
          data: users.map((user) => ({
            tenantId: doc.tenantId,
            userId: user.id,
            type: threshold.notifType,
            title: threshold.title,
            body: `O documento "${doc.documentType}" vence em ${threshold.days} dias.`,
            entityType: 'Document',
            entityId: doc.id,
            data: {
              daysUntilExpiry: threshold.days,
              documentType: doc.documentType,
              entityType: doc.entityType,
              entityId: doc.entityId,
              expiresAt: doc.expiresAt?.toISOString(),
            } as never,
          })),
          skipDuplicates: true,
        });

        // Publish domain event into the outbox for further fanout (e.g. e-mail, WhatsApp)
        await tx.outboxEvent.create({
          data: {
            tenantId: doc.tenantId,
            aggregateId: doc.id,
            eventType: 'DocumentExpiringSoon',
            payload: {
              documentId: doc.id,
              documentType: doc.documentType,
              entityType: doc.entityType,
              entityId: doc.entityId,
              daysUntilExpiry: threshold.days,
              expiresAt: doc.expiresAt?.toISOString(),
            } as never,
          },
        });
      });

      notifCount++;
    }

    this.logger.log(
      `Document expiry check — threshold=${threshold.days}d docsFound=${expiringDocs.length} notifBatchesCreated=${notifCount}`,
    );
  }
}
