import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@empresa.com.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @ApiProperty({ minLength: 8 })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password!: string;
}

export const LoginDtoSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' })
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
});
