import { z } from 'zod';

export const AssignPermissionSchema = z.object({
  permissionId: z.string().uuid({ message: 'ID da permissão inválido' }),
  scope: z.enum(['all', 'own_branch']).optional(),
});

export type AssignPermissionDto = z.infer<typeof AssignPermissionSchema>;
