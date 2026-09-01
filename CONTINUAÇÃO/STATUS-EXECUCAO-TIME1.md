# STATUS DE EXECUÇÃO — TIME 1 BACKEND
## Checkpoint: 2026-05-29

---

## CONCLUÍDO

### SCHEMA PRISMA (packages/database/schema/schema.prisma)
- Branch: adicionado type, latitude, longitude, relações fuel
- Vehicle: adicionadas relações internalFuelings, externalFuelings
- UserBranchScope — ABAC por filial
- FuelProduct — produtos (diesel_s10, diesel_s500, gasoline, ethanol, arla32)
- FuelSupplier — fornecedores com campo approved
- FuelTank — tanques internos com currentStockLiters
- FuelPump — bombas/bicos por tanque
- InternalFueling — abastecimento interno completo (mobile sync, idempotência)
- InternalFuelingEvidence
- ExternalFueling — abastecimento externo (paymentMethod, mobile sync)
- ExternalFuelingEvidence
- FuelDelivery — entrega por carreta (15 campos: lacres, NF, divergência)
- FuelDeliveryEvidence
- FuelInventoryMovement — LIVRO RAZÃO APPEND-ONLY
- FuelAttendantProfile — perfil + escopos ABAC
- FuelIncident — imprevistos
- CostCenter — centros de custo

### PERMISSÕES (packages/types/src/permissions.types.ts)
- 35+ novas permissões granulares de combustível
- analytics.executive.read, analytics.fuel.read, analytics.fleet.read, analytics.operations.read

### MÓDULOS NESTJS (apps/api-core/src/fuel/)
- fuel/products/ — CRUD produtos
- fuel/suppliers/ — CRUD + /approve
- fuel/tanks/ — CRUD + /stock com isLow, isCritical, stockPercent
- fuel/pumps/ — CRUD
- fuel/internal/ — COMPLETO:
  * Validação veículo/tanque/bomba/produto/estoque/odômetro/duplicata/ABAC
  * Anomalia km/l < 80% historico
  * Transação: InternalFueling + FuelInventoryMovement + estoque + OutboxEvent + AuditLog
  * POST /:id/approve, POST /:id/evidence
  * Idempotência mobile
- fuel/deliveries/ — COMPLETO:
  * Fornecedor aprovado, produto/tanque, NF duplicada, capacidade
  * POST /:id/receipt — recebimento + divergência
  * POST /:id/approve — delivery_in no livro razão + estoque
  * POST /:id/evidence
- fuel/external/ — COMPLETO:
  * Posto não cadastrado → under_review
  * POST /:id/approve, POST /:id/evidence
- fuel/incidents/ — GET, POST, POST /:id/resolve
- fuel.module.ts — atualizado com 8 sub-módulos

### AUDITORIA
- AuditActions constants para todos os actions de combustível
- correlationId no AuditLogEntry
- logMany() para bulk audit
- Migration SQL: add_correlation_id_audit.sql

### ANALYTICS
- GET /v1/analytics/executive — analytics.executive.read
- GET /v1/analytics/fuel — analytics.fuel.read
- GET /v1/analytics/fleet — analytics.fleet.read
- GET /v1/analytics/operations — analytics.operations.read
- SQL direto $queryRawUnsafe, cache Redis por tenant+período

### MOBILE SYNC / IDEMPOTÊNCIA
- IdempotencyInterceptor: header X-Idempotency-Key, scoped por tenantId
- InternalFueling + ExternalFueling: clientGeneratedId, deviceId, localCreatedAt, idempotencyKey
- UNIQUE constraint (tenantId, idempotencyKey)

### SEEDS
- packages/database/seed/seed-fuel-infrastructure.ts — NOVO
  * 5 FuelProducts, 2 FuelSuppliers aprovados
  * Tanks + Pumps por filial
  * FuelDeliveries aprovadas (estoca tanques em 75%)
  * FuelInventoryMovements (delivery_in)
  * 3 InternalFueling + 2 ExternalFueling aprovados
  * 1 FuelIncident medium/open
- packages/database/seed/seed-demo.ts — NOVO (seed completo demo)
- scripts db:seed:fuel e db:seed:all no package.json

### TESTES (apps/api-core/src/tests/tenant-isolation.spec.ts)
1. Tenant A nao ve veiculos do Tenant B
2. Tenant A nao ve abastecimentos do Tenant B
3. Sem fuel.internal.approve -> 403
4. Abastecedor sem acesso ao tanque -> 403
5. Mesmo idempotencyKey -> sem duplicata
6. Odometro regressivo -> ODOMETER_INVALID

---

## PENDENTE / PROXIMO PASSO

### COMANDOS PARA EXECUTAR AGORA:
  cd packages/database && pnpm db:generate
  pnpm db:migrate
  pnpm db:seed:all
  cd apps/api-core && pnpm typecheck
  pnpm test src/tests/tenant-isolation.spec.ts

### VERIFICAR:
- Confirmar que IdempotencyInterceptor esta registrado no app.module.ts
- Confirmar que fuel/external/dto/external-fueling.dto.ts esta completo

### AINDA FALTANDO:
- FuelStation CRUD dedicado
- FuelReconciliation endpoints (GET/POST /fuel/reconciliation)
- FuelAttendantProfile CRUD
- CostCenter CRUD
- Worker cron para read models (FuelDailySummary, TankStockSnapshot)
- RLS no PostgreSQL por tenantId
- OpenAPI spec gerado

---

## TODOS OS ARQUIVOS TOCADOS:

packages/database/schema/schema.prisma
packages/database/schema/migrations/add_correlation_id_audit.sql
packages/database/seed/seed-fuel-infrastructure.ts
packages/database/seed/seed-demo.ts
packages/database/package.json

packages/types/src/permissions.types.ts

apps/api-core/src/fuel/fuel.module.ts
apps/api-core/src/fuel/products/ (module/controller/service/dto)
apps/api-core/src/fuel/suppliers/ (module/controller/service/dto)
apps/api-core/src/fuel/tanks/ (module/controller/service/dto)
apps/api-core/src/fuel/pumps/ (module/controller/service/dto)
apps/api-core/src/fuel/internal/ (module/controller/service/dto)
apps/api-core/src/fuel/deliveries/ (module/controller/service/dto)
apps/api-core/src/fuel/external/ (module/controller/service/dto)
apps/api-core/src/fuel/incidents/ (module/controller/service/dto)

apps/api-core/src/common/services/audit.service.ts
apps/api-core/src/common/interceptors/idempotency.interceptor.ts
apps/api-core/src/analytics/analytics.service.ts
apps/api-core/src/analytics/analytics.controller.ts
apps/api-core/src/analytics/dto/analytics-response.dto.ts
apps/api-core/src/tests/tenant-isolation.spec.ts
