import { z } from 'zod';

export const NotificationFiltersSchema = z.object({
  unreadOnly: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional()
    .default(false),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
});

export type NotificationFiltersDto = z.infer<typeof NotificationFiltersSchema>;
