/**
 * document.validators.ts
 * Zod schemas for document management endpoints.
 */

import { z } from 'zod';

export const ENTITY_TYPES = [
  'vehicle',
  'driver',
  'employee',
  'tenant',
  'branch',
] as const;

export const SENSITIVITY_LEVELS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] as const;

export const CreateDocumentSchema = z.object({
  entityType: z.enum(ENTITY_TYPES, {
    errorMap: () => ({
      message: `Tipo de entidade inválido. Use: ${ENTITY_TYPES.join(', ')}`,
    }),
  }),
  entityId: z.string().uuid({ message: 'ID da entidade inválido' }),
  documentType: z
    .string({ required_error: 'Tipo de documento é obrigatório' })
    .trim()
    .min(1)
    .max(100),
  expiresAt: z.coerce.date({ invalid_type_error: 'Data de validade inválida' }).optional(),
  notes: z.string().trim().max(2000).optional(),
  sensitivityLevel: z.enum(SENSITIVITY_LEVELS).optional(),
});

export type CreateDocumentDto = z.infer<typeof CreateDocumentSchema>;
