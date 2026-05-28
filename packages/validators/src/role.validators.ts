/**
 * role.validators.ts
 * Zod schemas for role and permission management endpoints.
 */

import { z } from 'zod';
import { UUIDSchema } from './common.validators';

export const CreateRoleSchema = z.object({
  name: z
    .string({ required_error: 'Nome do cargo é obrigatório' })
    .min(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  department: z.string().max(100).optional(),
  hierarchyLevel: z
    .number()
    .int()
    .min(1)
    .max(5)
    .default(1),
  description: z.string().max(500).optional(),
});

export const UpdateRoleSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    department: z.string().max(100).optional(),
    hierarchyLevel: z.number().int().min(1).max(5).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export const AssignPermissionSchema = z.object({
  permissionId: UUIDSchema,
  scope: z.string().max(50).optional(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
export type AssignPermissionDto = z.infer<typeof AssignPermissionSchema>;
