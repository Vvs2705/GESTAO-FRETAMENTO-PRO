/**
 * auth.validators.ts
 * Zod schemas for authentication endpoints.
 */

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' })
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token é obrigatório' }),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token é obrigatório' }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RefreshDto = z.infer<typeof RefreshSchema>;
export type LogoutDto = z.infer<typeof LogoutSchema>;
