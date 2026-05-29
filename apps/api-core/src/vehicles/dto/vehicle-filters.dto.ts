import { z } from 'zod';

export const VehicleFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['AVAILABLE', 'IN_MAINTENANCE', 'UNAVAILABLE', 'RETIRED']).optional(),
  branchId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});

export type VehicleFiltersDto = z.infer<typeof VehicleFiltersSchema>;
