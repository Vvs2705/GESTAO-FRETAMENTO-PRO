import { z } from 'zod';

export const FuelDashboardFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type FuelDashboardFiltersDto = z.infer<typeof FuelDashboardFiltersSchema>;
