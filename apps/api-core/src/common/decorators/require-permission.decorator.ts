import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@gestao-fretamento-pro/types';
import { PERMISSIONS_KEY } from '../constants/permissions.constants';

export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
