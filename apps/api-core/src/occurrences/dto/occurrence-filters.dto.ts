import { z } from 'zod';

export const OccurrenceFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['OPEN', 'IN_ANALYSIS', 'RESOLVED', 'CRITICAL']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  tripId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
});

export type OccurrenceFiltersDto = z.infer<typeof OccurrenceFiltersSchema>;
