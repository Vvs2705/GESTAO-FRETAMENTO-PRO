import { z } from 'zod';

export const AuditFiltersSchema = z.object({
  actorUserId: z.string().uuid().optional(),
  action: z.string().max(200).optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type AuditFiltersDto = z.infer<typeof AuditFiltersSchema>;
