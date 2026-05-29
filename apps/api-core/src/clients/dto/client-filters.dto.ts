import { z } from 'zod';

export const ClientFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  search: z.string().max(100).optional(),
});

export type ClientFiltersDto = z.infer<typeof ClientFiltersSchema>;
