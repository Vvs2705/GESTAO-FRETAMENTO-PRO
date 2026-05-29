import { z } from 'zod';

export const FinanceSummaryFiltersSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type FinanceSummaryFiltersDto = z.infer<typeof FinanceSummaryFiltersSchema>;

export const FinanceClientFiltersSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type FinanceClientFiltersDto = z.infer<typeof FinanceClientFiltersSchema>;

export const FinanceVehicleFiltersSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type FinanceVehicleFiltersDto = z.infer<typeof FinanceVehicleFiltersSchema>;
