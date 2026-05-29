import { z } from 'zod';

export const FuelDashboardFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type FuelDashboardFiltersDto = z.infer<typeof FuelDashboardFiltersSchema>;

// ---------------------------------------------------------------------------
// Analytics module filters (TAREFA 1)
// ---------------------------------------------------------------------------

export const AnalyticsFiltersSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  branchId: z.string().uuid().optional(),
});

export type AnalyticsFiltersDto = z.infer<typeof AnalyticsFiltersSchema>;
