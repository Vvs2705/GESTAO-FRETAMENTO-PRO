import { z } from 'zod';

export const CreateTripSchema = z.object({
  clientId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  scheduledStartAt: z.coerce.date(),
  scheduledEndAt: z.coerce.date().optional(),
  passengerCount: z.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateTripDto = z.infer<typeof CreateTripSchema>;

export const AddPassengerSchema = z.object({
  name: z.string().min(1).max(200),
  document: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  boardingPoint: z.string().max(200).optional(),
});

export type AddPassengerDto = z.infer<typeof AddPassengerSchema>;

export const CancelTripSchema = z.object({
  reason: z.string().min(1).max(2000),
});

export type CancelTripDto = z.infer<typeof CancelTripSchema>;
