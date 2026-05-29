import { z } from 'zod';

export const CreateBranchSchema = z.object({
  name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  state: z.string().length(2, { message: 'Estado deve ter exatamente 2 caracteres (ex: SP)' }),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
