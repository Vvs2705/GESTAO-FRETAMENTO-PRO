import { z } from 'zod';

export const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  document: z.string().max(20).optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().max(300).optional(),
  contactPhone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateClientDto = z.infer<typeof CreateClientSchema>;

export const CreateContractSchema = z.object({
  number: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  value: z.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateContractDto = z.infer<typeof CreateContractSchema>;
