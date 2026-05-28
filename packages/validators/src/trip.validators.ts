/**
 * trip.validators.ts
 * Zod schemas for trip CRUD and status transition endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const TRIP_STATUS_VALUES = [
  'DRAFT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'DELAYED',
  'CANCELED',
] as const;

const BaseTripSchema = z.object({
  clientId: UUIDSchema.optional(),
  routeId: UUIDSchema.optional(),
  vehicleId: UUIDSchema.optional(),
  driverId: UUIDSchema.optional(),
  scheduledStartAt: z.coerce
    .date({ invalid_type_error: 'Data de início inválida' })
    .refine((d) => d >= new Date(Date.now() - 60_000), {
      message: 'Data de início não pode ser no passado',
    }),
  scheduledEndAt: z.coerce.date({ invalid_type_error: 'Data de fim inválida' }).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const CreateTripSchema = BaseTripSchema.refine(
  (data) =>
    data.scheduledEndAt === undefined || data.scheduledEndAt > data.scheduledStartAt,
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['scheduledEndAt'],
  },
);

export const UpdateTripSchema = BaseTripSchema.partial();

export const ChangeTripStatusSchema = z.object({
  status: z.enum(TRIP_STATUS_VALUES, {
    errorMap: () => ({ message: 'Status de viagem inválido' }),
  }),
  reason: z.string().trim().max(1000).optional(),
});

export const TripFiltersSchema = PaginationSchema.extend({
  status: z.enum(TRIP_STATUS_VALUES).optional(),
  vehicleId: UUIDSchema.optional(),
  driverId: UUIDSchema.optional(),
  clientId: UUIDSchema.optional(),
  routeId: UUIDSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});

export type CreateTripDto = z.infer<typeof CreateTripSchema>;
export type UpdateTripDto = z.infer<typeof UpdateTripSchema>;
export type ChangeTripStatusDto = z.infer<typeof ChangeTripStatusSchema>;
export type TripFiltersDto = z.infer<typeof TripFiltersSchema>;
