import { z } from 'zod';

export const CreateOccurrenceSchema = z.object({
  tripId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  type: z.string().min(1).max(100),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1).max(5000),
  responsibleUserId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateOccurrenceDto = z.infer<typeof CreateOccurrenceSchema>;

export const ResolveOccurrenceSchema = z.object({
  actionTaken: z.string().min(1).max(5000),
  notes: z.string().max(2000).optional(),
});

export type ResolveOccurrenceDto = z.infer<typeof ResolveOccurrenceSchema>;
