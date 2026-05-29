import { z } from 'zod';

export const CreateVehicleSchema = z.object({
  plate: z.string().min(7).max(10).toUpperCase(),
  prefix: z.string().max(20).optional(),
  type: z.enum(['BUS', 'VAN', 'MICRO_BUS']),
  capacity: z.number().int().positive(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  fuelType: z.enum(['DIESEL', 'GASOLINE', 'ETHANOL', 'GNV']).optional(),
  currentOdometer: z.number().nonnegative().optional(),
  branchId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
