/**
 * driver.validators.ts
 * Zod schemas for driver CRUD and listing endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const DRIVER_LICENSE_CATEGORIES = ['B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'] as const;

export const DRIVER_AVAILABILITY_STATUS_VALUES = [
  'AVAILABLE',
  'ON_TRIP',
  'ON_LEAVE',
  'SUSPENDED',
  'INACTIVE',
] as const;

export const CreateDriverSchema = z.object({
  employeeId: UUIDSchema.optional(),
  licenseNumber: z
    .string({ required_error: 'Número de CNH é obrigatório' })
    .trim()
    .min(1)
    .max(20),
  licenseCategory: z.enum(DRIVER_LICENSE_CATEGORIES, {
    errorMap: () => ({
      message: `Categoria de CNH inválida. Use: ${DRIVER_LICENSE_CATEGORIES.join(', ')}`,
    }),
  }),
  licenseExpiresAt: z.coerce
    .date({ invalid_type_error: 'Data de validade da CNH inválida' })
    .refine((d) => d >= new Date(), {
      message: 'CNH já vencida — não é possível cadastrar motorista com CNH expirada',
    }),
  availabilityStatus: z.enum(DRIVER_AVAILABILITY_STATUS_VALUES).optional(),
});

export const UpdateDriverSchema = CreateDriverSchema.partial().extend({
  licenseExpiresAt: z.coerce.date({ invalid_type_error: 'Data de validade da CNH inválida' }).optional(),
});

export const DriverFiltersSchema = PaginationSchema.extend({
  availabilityStatus: z.enum(DRIVER_AVAILABILITY_STATUS_VALUES).optional(),
  search: z.string().trim().optional(),
  branchId: UUIDSchema.optional(),
});

export type CreateDriverDto = z.infer<typeof CreateDriverSchema>;
export type UpdateDriverDto = z.infer<typeof UpdateDriverSchema>;
export type DriverFiltersDto = z.infer<typeof DriverFiltersSchema>;
