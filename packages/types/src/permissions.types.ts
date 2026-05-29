/**
 * permissions.types.ts
 * All system permissions as a union literal type.
 * Follows the `resource.action` naming convention from docs/04-cargos-permissoes-dashboards.md.
 */

export type Permission =
  // Vehicle
  | 'vehicle.read'
  | 'vehicle.create'
  | 'vehicle.update'
  | 'vehicle.delete'
  | 'vehicle.assign'
  // Driver
  | 'driver.read'
  | 'driver.create'
  | 'driver.update'
  | 'driver.delete'
  | 'driver.document.read'
  | 'driver.document.sensitive.read'
  // Trip
  | 'trip.read'
  | 'trip.create'
  | 'trip.update'
  | 'trip.cancel'
  | 'trip.start'
  | 'trip.complete'
  | 'trip.export'
  // Client
  | 'client.read'
  | 'client.create'
  | 'client.update'
  | 'client.delete'
  // Route
  | 'route.read'
  | 'route.create'
  | 'route.update'
  | 'route.delete'
  // Occurrence
  | 'occurrence.read'
  | 'occurrence.create'
  | 'occurrence.update'
  | 'occurrence.resolve'
  | 'occurrence.close.critical'
  | 'occurrence.reopen'
  // Fuel — produtos, tanques, bombas
  | 'fuel.product.read'
  | 'fuel.product.create'
  | 'fuel.product.update'
  | 'fuel.tank.read'
  | 'fuel.tank.create'
  | 'fuel.tank.update'
  | 'fuel.pump.read'
  | 'fuel.pump.create'
  | 'fuel.pump.update'
  | 'fuel.supplier.read'
  | 'fuel.supplier.create'
  | 'fuel.supplier.update'
  | 'fuel.supplier.approve'
  | 'fuel.station.read'
  | 'fuel.station.create'
  | 'fuel.station.approve'
  // Fuel — abastecimento interno
  | 'fuel.internal.read'
  | 'fuel.internal.create'
  | 'fuel.internal.approve'
  | 'fuel.internal.reject'
  | 'fuel.internal.correct'
  // Fuel — entrega por carreta
  | 'fuel.delivery.read'
  | 'fuel.delivery.create'
  | 'fuel.delivery.approve'
  | 'fuel.delivery.reject'
  // Fuel — abastecimento externo
  | 'fuel.external.read'
  | 'fuel.external.create'
  | 'fuel.external.approve'
  | 'fuel.external.reject'
  // Fuel — reconciliação e estoque
  | 'fuel.reconciliation.read'
  | 'fuel.reconciliation.create'
  | 'fuel.reconciliation.approve'
  | 'fuel.stock.read'
  | 'fuel.stock.adjust'
  // Fuel — incidentes
  | 'fuel.incident.read'
  | 'fuel.incident.create'
  | 'fuel.incident.resolve'
  // Fuel — legado (mantido para compatibilidade)
  | 'fuel.read'
  | 'fuel.create'
  | 'fuel.update'
  | 'fuel.approve'
  | 'fuel.delete'
  | 'fuel.anomaly.view'
  | 'fuel.export'
  // Analytics por cargo
  | 'analytics.executive.read'
  | 'analytics.fuel.read'
  | 'analytics.fleet.read'
  | 'analytics.operations.read'
  | 'analytics.finance.read'
  | 'analytics.maintenance.read'
  // Maintenance
  | 'maintenance.read'
  | 'maintenance.create'
  | 'maintenance.update'
  | 'maintenance.complete'
  // Document
  | 'document.read'
  | 'document.create'
  | 'document.delete'
  // Finance
  | 'finance.read'
  | 'finance.create'
  | 'finance.update'
  | 'finance.export'
  | 'finance.account.create'
  | 'finance.account.update'
  // Audit
  | 'audit.read'
  | 'audit.export'
  // Notification
  | 'notification.read'
  // User management
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  // Role management
  | 'role.read'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  | 'role.manage'
  // Permission management
  | 'permission.manage'
  // Tenant
  | 'tenant.read'
  | 'tenant.update'
  // Branch
  | 'branch.read'
  | 'branch.create'
  | 'branch.update'
  // Dashboards
  | 'dashboard.executive'
  | 'dashboard.operation'
  | 'dashboard.fleet'
  | 'dashboard.fuel'
  // Reports
  | 'report.export';

export const ALL_PERMISSIONS: readonly Permission[] = [
  'vehicle.read',
  'vehicle.create',
  'vehicle.update',
  'vehicle.delete',
  'vehicle.assign',
  'driver.read',
  'driver.create',
  'driver.update',
  'driver.delete',
  'driver.document.read',
  'driver.document.sensitive.read',
  'trip.read',
  'trip.create',
  'trip.update',
  'trip.cancel',
  'trip.start',
  'trip.complete',
  'trip.export',
  'client.read',
  'client.create',
  'client.update',
  'client.delete',
  'route.read',
  'route.create',
  'route.update',
  'route.delete',
  'occurrence.read',
  'occurrence.create',
  'occurrence.update',
  'occurrence.resolve',
  'occurrence.close.critical',
  'occurrence.reopen',
  'fuel.product.read',
  'fuel.product.create',
  'fuel.product.update',
  'fuel.tank.read',
  'fuel.tank.create',
  'fuel.tank.update',
  'fuel.pump.read',
  'fuel.pump.create',
  'fuel.pump.update',
  'fuel.supplier.read',
  'fuel.supplier.create',
  'fuel.supplier.update',
  'fuel.supplier.approve',
  'fuel.station.read',
  'fuel.station.create',
  'fuel.station.approve',
  'fuel.internal.read',
  'fuel.internal.create',
  'fuel.internal.approve',
  'fuel.internal.reject',
  'fuel.internal.correct',
  'fuel.delivery.read',
  'fuel.delivery.create',
  'fuel.delivery.approve',
  'fuel.delivery.reject',
  'fuel.external.read',
  'fuel.external.create',
  'fuel.external.approve',
  'fuel.external.reject',
  'fuel.reconciliation.read',
  'fuel.reconciliation.create',
  'fuel.reconciliation.approve',
  'fuel.stock.read',
  'fuel.stock.adjust',
  'fuel.incident.read',
  'fuel.incident.create',
  'fuel.incident.resolve',
  'fuel.read',
  'fuel.create',
  'fuel.update',
  'fuel.approve',
  'fuel.delete',
  'fuel.anomaly.view',
  'fuel.export',
  'analytics.executive.read',
  'analytics.fuel.read',
  'analytics.fleet.read',
  'analytics.operations.read',
  'analytics.finance.read',
  'analytics.maintenance.read',
  'maintenance.read',
  'maintenance.create',
  'maintenance.update',
  'maintenance.complete',
  'document.read',
  'document.create',
  'document.delete',
  'finance.read',
  'finance.create',
  'finance.update',
  'finance.export',
  'finance.account.create',
  'finance.account.update',
  'audit.read',
  'audit.export',
  'notification.read',
  'user.read',
  'user.create',
  'user.update',
  'user.delete',
  'role.read',
  'role.create',
  'role.update',
  'role.delete',
  'role.manage',
  'permission.manage',
  'tenant.read',
  'tenant.update',
  'branch.read',
  'branch.create',
  'branch.update',
  'dashboard.executive',
  'dashboard.operation',
  'dashboard.fleet',
  'dashboard.fuel',
  'report.export',
] as const;
