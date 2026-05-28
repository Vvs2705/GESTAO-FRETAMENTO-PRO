/**
 * vehicle.validators.ts
 * Zod schemas for vehicle CRUD and listing endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

/**
 * Accepts both old Brazilian plates (ABC-1234) and Mercosul plates (ABC1D23).
 * Pattern: 3 uppercase letters + digit + letter-or-digit + 2 digits (Mercosul)
 *          OR 3 uppercase letters + 4 digits (old format).
 */
const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/;

export const VEHICLE_STATUS_VALUES = [
  'AVAILABLE',
  'IN_MAINTENANCE',
  'UNAVAILABLE',
  'RETIRED',
] as const;

export const CreateVehicleSchema = z.object({
  plate: z
    .string({ required_error: 'Placa é obrigatória' })
    .trim()
    .toUpperCase()
    .regex(PLATE_REGEX, { message: 'Placa inválida. Use o formato ABC1234 ou ABC1D23' }),
  prefix: z.string().trim().max(20).optional(),
  type: z.string({ required_error: 'Tipo do veículo é obrigatório' }).trim().min(1),
  capacity: z.number().int().positive().optional(),
  brand: z.string().trim().max(100).optional(),
  model: z.string().trim().max(100).optional(),
  year: z
    .number()
    .int()
    .min(1970)
    .max(new Date().getFullYear() + 2)
    .optional(),
  currentOdometer: z.number().nonnegative().optional(),
  branchId: UUIDSchema.optional(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  status: z.enum(VEHICLE_STATUS_VALUES).optional(),
});

export const VehicleFiltersSchema = PaginationSchema.extend({
  status: z.enum(VEHICLE_STATUS_VALUES).optional(),
  search: z.string().trim().optional(),
  branchId: UUIDSchema.optional(),
});

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;
export type VehicleFiltersDto = z.infer<typeof VehicleFiltersSchema>;
