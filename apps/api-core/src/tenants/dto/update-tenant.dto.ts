import { z } from 'zod';

export const UpdateTenantSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  tradeName: z.string().max(200).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
