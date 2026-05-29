/**
 * @gestao-fretamento-pro/types
 * Shared TypeScript interfaces for the Gestão Fretamento Pro monorepo.
 * Consumed by both api-core (backend) and web-admin (frontend).
 *
 * IMPORTANT: This package NEVER imports from Prisma.
 * All types are independent domain interfaces.
 */

export * from './common.types';
export * from './tenant.types';
export * from './user.types';
export * from './role.types';
export * from './vehicle.types';
export * from './driver.types';
export * from './trip.types';
export * from './route.types';
export * from './client.types';
export * from './occurrence.types';
export * from './fuel.types';
export * from './maintenance.types';
export * from './document.types';
export * from './finance.types';
export * from './audit.types';
export * from './notification.types';
export * from './events.types';
export * from './permissions.types';
export * from './dashboard.types';
export * from './api.generated';
