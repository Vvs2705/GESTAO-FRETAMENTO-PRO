import { z } from 'zod';

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
  roleId: z.string().uuid({ message: 'ID do cargo inválido' }).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
