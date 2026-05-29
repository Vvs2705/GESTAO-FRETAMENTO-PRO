import { z } from 'zod';

export const CreateMaintenanceOrderSchema = z.object({
  vehicleId: z.string().uuid(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']),
  description: z.string().min(1).max(2000),
  supplierName: z.string().max(200).optional(),
  supplierDocument: z.string().max(20).optional(),
  expectedStartAt: z.coerce.date().optional(),
  expectedEndAt: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateMaintenanceOrderDto = z.infer<typeof CreateMaintenanceOrderSchema>;

export const AddMaintenanceItemSchema = z.object({
  description: z.string().min(1).max(2000),
  partName: z.string().max(200).optional(),
  partCode: z.string().max(50).optional(),
  quantity: z.number().positive().default(1),
  unitCost: z.number().nonnegative(),
});

export type AddMaintenanceItemDto = z.infer<typeof AddMaintenanceItemSchema>;

export const CompleteMaintenanceSchema = z.object({
  actualEndAt: z.coerce.date().optional(),
  totalCost: z.number().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export type CompleteMaintenanceDto = z.infer<typeof CompleteMaintenanceSchema>;
