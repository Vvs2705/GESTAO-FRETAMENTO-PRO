/**
 * common.validators.ts
 * Reusable Zod primitives shared across all validator files.
 */

import { z } from 'zod';

export const UUIDSchema = z.string().uuid({ message: 'ID inválido' });

export const DateRangeSchema = z
  .object({
    from: z.coerce.date({ invalid_type_error: 'Data inicial inválida' }),
    to: z.coerce.date({ invalid_type_error: 'Data final inválida' }),
  })
  .refine((d) => d.to >= d.from, {
    message: 'Data final deve ser maior ou igual à data inicial',
    path: ['to'],
  });

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const SortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export type DateRangeDto = z.infer<typeof DateRangeSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type SortOrderDto = z.infer<typeof SortOrderSchema>;
