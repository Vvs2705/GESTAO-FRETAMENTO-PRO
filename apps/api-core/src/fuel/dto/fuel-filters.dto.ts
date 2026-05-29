import { z } from 'zod';

export const FuelFiltersSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  anomalyFlag: z.coerce.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type FuelFiltersDto = z.infer<typeof FuelFiltersSchema>;

export const FuelStatsFiltersSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type FuelStatsFiltersDto = z.infer<typeof FuelStatsFiltersSchema>;
