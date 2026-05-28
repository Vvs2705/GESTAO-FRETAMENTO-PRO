/**
 * maintenance.validators.ts
 * Zod schemas for maintenance order CRUD endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const MAINTENANCE_TYPE_VALUES = ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION'] as const;
export const MAINTENANCE_STATUS_VALUES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
] as const;

export const CreateMaintenanceItemSchema = z.object({
  description: z
    .string({ required_error: 'Descrição do item é obrigatória' })
    .trim()
    .min(1)
    .max(500),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória' })
    .int()
    .positive({ message: 'Quantidade deve ser maior que zero' }),
  unitPrice: z
    .number()
    .positive({ message: 'Preço unitário deve ser maior que zero' })
    .optional(),
});

export const CreateMaintenanceOrderSchema = z
  .object({
    vehicleId: UUIDSchema,
    type: z.enum(MAINTENANCE_TYPE_VALUES, {
      errorMap: () => ({
        message: `Tipo de manutenção inválido. Use: ${MAINTENANCE_TYPE_VALUES.join(', ')}`,
      }),
    }),
    description: z
      .string({ required_error: 'Descrição é obrigatória' })
      .trim()
      .min(5)
      .max(2000),
    supplierName: z.string().trim().max(200).optional(),
    expectedStartAt: z.coerce.date().optional(),
    expectedEndAt: z.coerce.date().optional(),
    items: z.array(CreateMaintenanceItemSchema).optional(),
  })
  .refine(
    (data) =>
      data.expectedEndAt === undefined ||
      data.expectedStartAt === undefined ||
      data.expectedEndAt >= data.expectedStartAt,
    {
      message: 'Data prevista de conclusão deve ser após a data de início',
      path: ['expectedEndAt'],
    },
  );

export const UpdateMaintenanceOrderSchema = z.object({
  type: z.enum(MAINTENANCE_TYPE_VALUES).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  supplierName: z.string().trim().max(200).optional(),
  expectedStartAt: z.coerce.date().optional(),
  expectedEndAt: z.coerce.date().optional(),
  actualEndAt: z.coerce.date().optional(),
  totalCost: z
    .number()
    .nonnegative({ message: 'Custo total não pode ser negativo' })
    .optional(),
  status: z.enum(MAINTENANCE_STATUS_VALUES).optional(),
});

export const MaintenanceFiltersSchema = PaginationSchema.extend({
  status: z.enum(MAINTENANCE_STATUS_VALUES).optional(),
  type: z.enum(MAINTENANCE_TYPE_VALUES).optional(),
  vehicleId: UUIDSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});

export type CreateMaintenanceItemDto = z.infer<typeof CreateMaintenanceItemSchema>;
export type CreateMaintenanceOrderDto = z.infer<typeof CreateMaintenanceOrderSchema>;
export type UpdateMaintenanceOrderDto = z.infer<typeof UpdateMaintenanceOrderSchema>;
export type MaintenanceFiltersDto = z.infer<typeof MaintenanceFiltersSchema>;
