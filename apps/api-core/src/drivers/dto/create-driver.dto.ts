import { z } from 'zod';

export const CreateDriverSchema = z.object({
  employeeId: z.string().uuid().optional(),
  licenseNumber: z.string().min(1).max(20),
  licenseCategory: z.enum(['B', 'C', 'D', 'E']),
  licenseExpiresAt: z.coerce.date(),
  availabilityStatus: z
    .enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE'])
    .optional()
    .default('AVAILABLE'),
  preferredVehicleId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateDriverDto = z.infer<typeof CreateDriverSchema>;
