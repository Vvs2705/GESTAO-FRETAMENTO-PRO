/**
 * fuel.validators.ts
 * Zod schemas for fuel record CRUD endpoints.
 * Business rules enforced here:
 * - liters > 0
 * - unitPrice > 0
 * - odometer > 0
 * Odometer strictly-greater-than-previous validation happens at the service layer
 * (requires DB lookup) — not here.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const FUEL_TYPES = ['DIESEL', 'GASOLINE', 'ETHANOL', 'GNV', 'DIESEL_S10'] as const;

export const CreateFuelRecordSchema = z.object({
  vehicleId: UUIDSchema,
  driverId: UUIDSchema.optional(),
  branchId: UUIDSchema.optional(),
  fuelStationName: z.string().trim().max(200).optional(),
  fuelType: z.enum(FUEL_TYPES, {
    errorMap: () => ({
      message: `Tipo de combustível inválido. Use: ${FUEL_TYPES.join(', ')}`,
    }),
  }),
  liters: z
    .number({ required_error: 'Litros é obrigatório' })
    .positive({ message: 'Litros deve ser maior que zero' }),
  unitPrice: z
    .number({ required_error: 'Preço unitário é obrigatório' })
    .positive({ message: 'Preço unitário deve ser maior que zero' }),
  odometer: z
    .number({ required_error: 'Hodômetro é obrigatório' })
    .positive({ message: 'Hodômetro deve ser maior que zero' }),
  suppliedAt: z.coerce.date({ invalid_type_error: 'Data de abastecimento inválida' }),
  notes: z.string().trim().max(2000).optional(),
});

export const UpdateFuelRecordSchema = z.object({
  fuelStationName: z.string().trim().max(200).optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  liters: z.number().positive({ message: 'Litros deve ser maior que zero' }).optional(),
  unitPrice: z.number().positive({ message: 'Preço unitário deve ser maior que zero' }).optional(),
  odometer: z.number().positive({ message: 'Hodômetro deve ser maior que zero' }).optional(),
  suppliedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const FuelFiltersSchema = PaginationSchema.extend({
  vehicleId: UUIDSchema.optional(),
  driverId: UUIDSchema.optional(),
  branchId: UUIDSchema.optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  anomalyFlag: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});

export type CreateFuelRecordDto = z.infer<typeof CreateFuelRecordSchema>;
export type UpdateFuelRecordDto = z.infer<typeof UpdateFuelRecordSchema>;
export type FuelFiltersDto = z.infer<typeof FuelFiltersSchema>;
