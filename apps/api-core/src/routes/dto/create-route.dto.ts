import { z } from 'zod';

export const RoutePointSchema = z.object({
  sequence: z.number().int().nonnegative(),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  plannedTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  type: z.enum(['ORIGIN', 'STOP', 'DESTINATION']).default('STOP'),
});

export const CreateRouteSchema = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  origin: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  estimatedDistanceKm: z.number().positive().optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  routePoints: z.array(RoutePointSchema).optional().default([]),
});

export type CreateRouteDto = z.infer<typeof CreateRouteSchema>;
export type RoutePointDto = z.infer<typeof RoutePointSchema>;
