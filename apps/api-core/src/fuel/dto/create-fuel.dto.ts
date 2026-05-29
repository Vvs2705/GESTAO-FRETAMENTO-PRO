import { z } from 'zod';

export const CreateFuelRecordSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  fuelStationName: z.string().max(200).optional(),
  fuelType: z.enum(['DIESEL', 'GASOLINE', 'ETHANOL', 'GNV']),
  liters: z.number().positive(),
  unitPrice: z.number().positive(),
  totalAmount: z.number().positive(),
  odometer: z.number().nonnegative(),
  suppliedAt: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

export type CreateFuelRecordDto = z.infer<typeof CreateFuelRecordSchema>;
