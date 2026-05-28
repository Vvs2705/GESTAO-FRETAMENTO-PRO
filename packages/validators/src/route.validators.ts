/**
 * route.validators.ts
 * Zod schemas for route CRUD endpoints.
 */

import { z } from 'zod';
import { UUIDSchema } from './common.validators';

export const CreateRoutePointSchema = z.object({
  sequence: z.number().int().min(1),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  plannedTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: 'Horário deve estar no formato HH:MM' })
    .optional(),
});

export const CreateRouteSchema = z.object({
  clientId: UUIDSchema.optional(),
  name: z.string({ required_error: 'Nome da rota é obrigatório' }).trim().min(1).max(200),
  origin: z.string({ required_error: 'Origem é obrigatória' }).trim().min(1).max(300),
  destination: z.string({ required_error: 'Destino é obrigatório' }).trim().min(1).max(300),
  estimatedDistanceKm: z.number().positive().optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  routePoints: z.array(CreateRoutePointSchema).optional(),
});

export const UpdateRouteSchema = CreateRouteSchema.partial().extend({
  status: z.string().optional(),
});

export type CreateRouteDto = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteDto = z.infer<typeof UpdateRouteSchema>;
