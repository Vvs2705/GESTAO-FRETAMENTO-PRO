/**
 * tenant.validators.ts
 * Zod schemas for tenant and branch management endpoints.
 */

import { z } from 'zod';

export const UpdateTenantSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    tradeName: z.string().max(200).optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export const CreateBranchSchema = z.object({
  name: z
    .string({ required_error: 'Nome da filial é obrigatório' })
    .min(2)
    .max(200),
  city: z
    .string({ required_error: 'Cidade é obrigatória' })
    .min(2)
    .max(100),
  state: z
    .string({ required_error: 'Estado é obrigatório' })
    .length(2, { message: 'Estado deve ter 2 caracteres (ex: SP, RJ)' })
    .toUpperCase(),
  address: z.string().max(500).optional(),
  zipCode: z.string().max(10).optional(),
  phone: z.string().max(30).optional(),
});

export const UpdateBranchSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().length(2).toUpperCase().optional(),
    address: z.string().max(500).optional(),
    zipCode: z.string().max(10).optional(),
    phone: z.string().max(30).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;
