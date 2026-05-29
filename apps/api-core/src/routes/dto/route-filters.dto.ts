import { z } from 'zod';

export const RouteFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  clientId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().max(100).optional(),
});

export type RouteFiltersDto = z.infer<typeof RouteFiltersSchema>;
