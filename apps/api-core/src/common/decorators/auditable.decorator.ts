import { SetMetadata } from '@nestjs/common';
import { AUDITABLE_KEY } from '../constants/permissions.constants';

/**
 * Mark a route handler as auditable.
 * The AuditInterceptor will capture the action string and write an audit log entry.
 * @param action - Action identifier, e.g. 'user.login', 'fuel.create'
 */
export const Auditable = (action: string) =>
  SetMetadata(AUDITABLE_KEY, action);
