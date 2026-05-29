import { z } from 'zod';

export const DriverFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  availabilityStatus: z
    .enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE'])
    .optional(),
  search: z.string().max(100).optional(),
});

export type DriverFiltersDto = z.infer<typeof DriverFiltersSchema>;
