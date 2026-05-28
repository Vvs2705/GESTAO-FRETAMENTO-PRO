/**
 * document.types.ts
 * Document interfaces and DTOs.
 */

import type { TenantId, DocumentId } from './common.types';

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export interface Document {
  id: DocumentId;
  tenantId: TenantId;
  entityType: string;
  entityId: string;
  documentType: string;
  fileId?: string;
  expiresAt?: Date;
  status: string;
  sensitivityLevel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateDocumentDto {
  entityType: string;
  entityId: string;
  documentType: string;
  expiresAt?: Date;
  notes?: string;
  sensitivityLevel?: string;
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

export interface DocumentExpiringAlert {
  document: Document;
  daysUntilExpiry: number;
  entityType: string;
  entityName: string;
}
