import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * ZodValidationPipe — applies a Zod schema to transform and validate input.
 * Throws a 400 BadRequest with structured error details on failure.
 *
 * Usage:
 *   @Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: result.error.flatten(),
      });
    }

    return result.data;
  }
}
