/**
 * client.validators.ts
 * Zod schemas for client and contract CRUD endpoints.
 */

import { z } from 'zod';

export const CONTRACT_STATUS_VALUES = [
  'ACTIVE',
  'EXPIRED',
  'CANCELED',
  'SUSPENDED',
] as const;

export const CreateClientSchema = z.object({
  name: z
    .string({ required_error: 'Nome do cliente é obrigatório' })
    .trim()
    .min(1)
    .max(300),
  document: z.string().trim().max(20).optional(),
  contactName: z.string().trim().max(200).optional(),
  contactEmail: z
    .string()
    .email({ message: 'E-mail de contato inválido' })
    .toLowerCase()
    .optional(),
  contactPhone: z.string().trim().max(30).optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial().extend({
  status: z.string().optional(),
});

export const CreateContractSchema = z
  .object({
    name: z
      .string({ required_error: 'Nome do contrato é obrigatório' })
      .trim()
      .min(1)
      .max(300),
    value: z.number().positive({ message: 'Valor do contrato deve ser positivo' }).optional(),
    startDate: z.coerce.date({ invalid_type_error: 'Data de início do contrato inválida' }),
    endDate: z.coerce.date({ invalid_type_error: 'Data de fim do contrato inválida' }).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => data.endDate === undefined || data.endDate > data.startDate,
    {
      message: 'Data de fim do contrato deve ser posterior à data de início',
      path: ['endDate'],
    },
  );

export const UpdateContractSchema = CreateContractSchema.partial().extend({
  status: z.enum(CONTRACT_STATUS_VALUES).optional(),
});

export type CreateClientDto = z.infer<typeof CreateClientSchema>;
export type UpdateClientDto = z.infer<typeof UpdateClientSchema>;
export type CreateContractDto = z.infer<typeof CreateContractSchema>;
export type UpdateContractDto = z.infer<typeof UpdateContractSchema>;
