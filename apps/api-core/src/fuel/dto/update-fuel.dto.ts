import { z } from 'zod';

// Only non-critical fields can be updated
export const UpdateFuelRecordSchema = z.object({
  fuelStationName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export type UpdateFuelRecordDto = z.infer<typeof UpdateFuelRecordSchema>;
