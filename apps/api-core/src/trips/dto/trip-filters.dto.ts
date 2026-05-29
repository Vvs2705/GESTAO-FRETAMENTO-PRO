import { z } from 'zod';

export const TripFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z
    .enum(['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELED'])
    .optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
});

export type TripFiltersDto = z.infer<typeof TripFiltersSchema>;
