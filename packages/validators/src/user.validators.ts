/**
 * user.validators.ts
 * Zod schemas for user management endpoints.
 */

import { z } from 'zod';
import { UUIDSchema, PaginationSchema } from './common.validators';

export const CreateUserSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    .max(200, { message: 'Nome deve ter no máximo 200 caracteres' }),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' })
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
    .max(100, { message: 'Senha deve ter no máximo 100 caracteres' }),
  phone: z.string().max(30).optional(),
  employeeId: UUIDSchema.optional(),
  roleId: UUIDSchema.optional(),
});

export const UpdateUserSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    email: z.string().email().toLowerCase().optional(),
    phone: z.string().max(30).optional(),
    employeeId: UUIDSchema.optional(),
    roleId: UUIDSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
    .max(100),
});

export const ChangeUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    required_error: 'Status é obrigatório',
  }),
  reason: z.string().max(500).optional(),
});

export const UserListFiltersSchema = PaginationSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  search: z.string().max(100).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type ChangeUserStatusDto = z.infer<typeof ChangeUserStatusSchema>;
export type UserListFiltersDto = z.infer<typeof UserListFiltersSchema>;
