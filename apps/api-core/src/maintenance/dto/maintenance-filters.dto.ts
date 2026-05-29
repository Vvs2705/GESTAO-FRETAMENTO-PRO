import { z } from 'zod';

export const MaintenanceFiltersSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']).optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type MaintenanceFiltersDto = z.infer<typeof MaintenanceFiltersSchema>;
