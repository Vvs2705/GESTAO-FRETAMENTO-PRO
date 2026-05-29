import { z } from 'zod';

export const UpdateMaintenanceOrderSchema = z.object({
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']).optional(),
  description: z.string().min(1).max(2000).optional(),
  supplierName: z.string().max(200).nullable().optional(),
  supplierDocument: z.string().max(20).nullable().optional(),
  expectedStartAt: z.coerce.date().nullable().optional(),
  expectedEndAt: z.coerce.date().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type UpdateMaintenanceOrderDto = z.infer<typeof UpdateMaintenanceOrderSchema>;
