/**
 * occurrence.validators.ts
 * Zod schemas for occurrence CRUD and state transition endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const OCCURRENCE_SEVERITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const OCCURRENCE_STATUS_VALUES = [
  'OPEN',
  'IN_ANALYSIS',
  'RESOLVED',
  'CRITICAL',
] as const;

export const CreateOccurrenceSchema = z.object({
  tripId: UUIDSchema.optional(),
  vehicleId: UUIDSchema.optional(),
  driverId: UUIDSchema.optional(),
  clientId: UUIDSchema.optional(),
  type: z
    .string({ required_error: 'Tipo de ocorrência é obrigatório' })
    .trim()
    .min(1)
    .max(100),
  severity: z.enum(OCCURRENCE_SEVERITY_VALUES, {
    errorMap: () => ({
      message: `Gravidade inválida. Use: ${OCCURRENCE_SEVERITY_VALUES.join(', ')}`,
    }),
  }),
  description: z
    .string({ required_error: 'Descrição da ocorrência é obrigatória' })
    .trim()
    .min(10, { message: 'Descrição deve ter ao menos 10 caracteres' })
    .max(5000),
});

export const UpdateOccurrenceSchema = z.object({
  type: z.string().trim().min(1).max(100).optional(),
  severity: z.enum(OCCURRENCE_SEVERITY_VALUES).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  status: z.enum(OCCURRENCE_STATUS_VALUES).optional(),
  responsibleUserId: UUIDSchema.optional(),
  actionTaken: z.string().trim().max(5000).optional(),
});

export const ResolveOccurrenceSchema = z.object({
  actionTaken: z
    .string({ required_error: 'Ação tomada é obrigatória para resolução' })
    .trim()
    .min(10, { message: 'Ação tomada deve ter ao menos 10 caracteres' })
    .max(5000),
  resolvedAt: z.coerce.date().optional(),
});

export const OccurrenceFiltersSchema = PaginationSchema.extend({
  status: z.enum(OCCURRENCE_STATUS_VALUES).optional(),
  severity: z.enum(OCCURRENCE_SEVERITY_VALUES).optional(),
  tripId: UUIDSchema.optional(),
  vehicleId: UUIDSchema.optional(),
  driverId: UUIDSchema.optional(),
  clientId: UUIDSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});

export type CreateOccurrenceDto = z.infer<typeof CreateOccurrenceSchema>;
export type UpdateOccurrenceDto = z.infer<typeof UpdateOccurrenceSchema>;
export type ResolveOccurrenceDto = z.infer<typeof ResolveOccurrenceSchema>;
export type OccurrenceFiltersDto = z.infer<typeof OccurrenceFiltersSchema>;
