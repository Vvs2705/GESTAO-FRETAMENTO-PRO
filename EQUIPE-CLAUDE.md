# EQUIPE CLAUDE — Backend, Banco, Worker e Infraestrutura

## Identidade da equipe

Você é a equipe de backend e infraestrutura do projeto **Gestão Fretamento Pro**.
Sua responsabilidade é construir tudo que roda no servidor: banco de dados, API REST, worker de jobs, OpenAPI, Docker, Terraform e CI/CD.

A Equipe Antigravity constrói o frontend em paralelo. Ela depende dos seus contratos OpenAPI e dos schemas de tipos compartilhados.

---

## Leitura obrigatória antes de escrever qualquer linha de código

Leia os arquivos nesta ordem. Não pule nenhum.

```
docs/00-manifesto-qualidade-produto.md      ← Princípios que guiam toda decisão
docs/01-decisao-stack-tecnologica.md        ← Stack oficial e ADRs de decisão
docs/02-arquitetura-produto-escalavel.md    ← Bounded contexts, Saga, Outbox, C4
docs/03-dominios-modulos-negocio.md         ← Invariantes de domínio, ACLs
docs/04-cargos-permissoes-dashboards.md     ← RBAC+ABAC, permissões, step-up auth
docs/06-backend-api-integracoes-eventos.md  ← Padrão REST, eventos, idempotência
docs/07-dados-banco-analytics-bi.md         ← Schema, tipos, índices, RLS, partições
docs/08-seguranca-lgpd-governanca.md        ← LGPD, STRIDE, JWT, Argon2id, secrets
docs/09-devops-infra-observabilidade.md     ← SLOs, IaC, CI/CD, Docker, alertas
docs/10-qa-testes-release-qualidade.md      ← Testes de integração, contrato, chaos
```

---

## Regras de operação

- **Não pedir autorização** para continuar entre fases. Avançar automaticamente.
- **Não fazer commit, push ou deploy** até o sistema estar 100% concluído pela equipe.
- **Salvar progresso a cada 10%** — registrar no arquivo `PROGRESSO-CLAUDE.md` na raiz do projeto.
- **Sinalizar no chat** quando encontrar dependência que bloqueia (ex.: precisa de contrato do frontend primeiro).
- **Se uma pasta já tiver conteúdo**, ler antes de criar — nunca sobrescrever trabalho existente.
- **TypeScript strict mode** obrigatório. Configuração em `packages/tsconfig/base.json`.
- **Sem any implícito.** Sem `// @ts-ignore` sem comentário explicativo.
- **Secrets nunca em código** — usar variáveis de ambiente com validação via Zod no bootstrap.

---

## Estrutura de pastas sob sua responsabilidade

```
packages/
  tsconfig/          ← Base tsconfig para todo o monorepo
  eslint-config/     ← Regras ESLint compartilhadas
  config/            ← Env schema e configurações globais
  database/          ← Prisma schema, migrations, seed
  types/             ← Interfaces TypeScript compartilhadas (exportadas para o frontend)
  validators/        ← Schemas Zod compartilhados
  auth/              ← Lógica de JWT, refresh, hash de senha

apps/
  api-core/          ← Backend NestJS — RESPONSABILIDADE CENTRAL
  worker/            ← Jobs em background (BullMQ)

infra/
  docker/            ← Dockerfiles de api-core, worker
  terraform/         ← IaC para banco, rede, compute, secrets

openapi/v1/          ← Contrato OpenAPI 3.1 — compartilhado com frontend
.github/workflows/   ← Pipelines de CI/CD
scripts/db/          ← Scripts de banco (reset, check, stats)
scripts/seed/        ← Scripts de seed para dev e staging
tests/contracts/     ← Testes de contrato Pact (lado producer)
tests/performance/   ← Scripts k6 para endpoints críticos
```

---

## Fases de execução com checkpoints de 10%

### FASE 1 — Fundação do Monorepo (0% → 10%)

**Checkpoint: 10%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

Arquivos a criar:
- `package.json` raiz com Turborepo e PNPM workspaces
- `turbo.json` — pipeline de build, test, lint
- `pnpm-workspace.yaml` — lista de workspaces
- `.nvmrc` / `.node-version` — Node.js LTS
- `.gitignore` raiz
- `packages/tsconfig/base.json` — strict: true, noUncheckedIndexedAccess, exactOptionalPropertyTypes
- `packages/tsconfig/nestjs.json` — extends base, ajustes para NestJS
- `packages/tsconfig/package.json`
- `packages/eslint-config/index.js` — regras base TypeScript + Prettier
- `packages/eslint-config/nestjs.js`
- `packages/eslint-config/package.json`
- `packages/config/src/env.schema.ts` — schema Zod de todas as variáveis de ambiente
- `packages/config/src/index.ts`
- `packages/config/package.json`

Critério de aceite:
- `pnpm install` na raiz instala tudo sem erro
- `pnpm turbo lint` passa em todos os workspaces

---

### FASE 2 — Schema do Banco de Dados (10% → 20%)

**Checkpoint: 20%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

Leitura obrigatória antes de iniciar: `docs/07-dados-banco-analytics-bi.md` (seções de Padrões, Entidades Centrais e Tipos de Dados)

Arquivos a criar em `packages/database/`:
- `schema/schema.prisma` — schema completo com TODAS as entidades:
  - `tenants`, `branches`
  - `users`, `employees`, `roles`, `permissions`, `role_permissions`
  - `vehicles`, `drivers`
  - `clients`, `contracts`, `routes`, `route_points`
  - `trips`, `trip_passengers`
  - `occurrences`
  - `fuel_records`, `fuel_stations`
  - `maintenance_orders`, `maintenance_items`
  - `documents`
  - `notifications`
  - `audit_logs`
  - `outbox_events`
  - `idempotency_keys`
- `migrations/` — primeira migration gerada pelo Prisma
- `seed/index.ts` — seed realista: 1 tenant, 2 filiais, 20 veículos, 30 motoristas, 5 clientes, 15 rotas, 100 viagens, 50 abastecimentos, 20 ocorrências
- `package.json`

Regras obrigatórias do schema:
- Toda tabela operacional tem: `id uuid`, `tenant_id uuid`, `created_at timestamptz`, `updated_at timestamptz`, `created_by uuid?`, `updated_by uuid?`, `deleted_at timestamptz?`
- Campos monetários: `Decimal @db.Decimal(19,4)` — nunca Float
- Status: `String` com `@db.Text` — validação no código, não enum do banco
- Chaves primárias: `String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`

Critério de aceite:
- `prisma validate` sem erros
- `prisma migrate dev` roda sem erro em banco limpo
- Seed executa com dados realistas e sem violação de constraints

---

### FASE 3 — Packages Compartilhados (20% → 30%)

**Checkpoint: 30%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

**`packages/types/src/`**

Criar interfaces TypeScript para todas as entidades do schema. Estas interfaces são consumidas pelo frontend — exportar com cuidado, sem expor tipos internos do Prisma.

Arquivos:
- `tenant.types.ts`, `user.types.ts`, `role.types.ts`
- `vehicle.types.ts`, `driver.types.ts`
- `trip.types.ts`, `route.types.ts`
- `occurrence.types.ts`, `fuel.types.ts`
- `maintenance.types.ts`, `document.types.ts`
- `finance.types.ts`, `client.types.ts`
- `audit.types.ts`, `notification.types.ts`
- `common.types.ts` — Pagination, ApiResponse, ApiError, SortOrder, DateRange
- `permissions.types.ts` — lista de todas as permissões como union type
- `events.types.ts` — payloads de todos os eventos de domínio
- `index.ts` — re-exporta tudo

**`packages/validators/src/`**

Schemas Zod para validação de entrada em formulários (frontend) e APIs (backend):
- `trip.validators.ts`, `vehicle.validators.ts`, `driver.validators.ts`
- `fuel.validators.ts`, `occurrence.validators.ts`
- `auth.validators.ts`, `user.validators.ts`
- `common.validators.ts` — UUID, DateRange, Pagination
- `index.ts`

**`packages/auth/src/`**

Utilitários de autenticação:
- `password.ts` — hash com Argon2id, verify
- `jwt.ts` — sign, verify, decode, refresh rotation logic
- `tokens.ts` — geração de tokens seguros com CSPRNG
- `index.ts`

Critério de aceite:
- Todos os packages compilam sem erro
- Frontend consegue importar de `@gfp/types` e `@gfp/validators`

---

### FASE 4 — API Core: Fundação e Auth (30% → 45%)

**Checkpoint: 40%** — Registrar em `PROGRESSO-CLAUDE.md` ao atingir os módulos auth + tenants + users.
**Checkpoint: 45%** — Registrar ao atingir roles-permissions.

Leitura obrigatória: `docs/06-backend-api-integracoes-eventos.md` completo, `docs/08-seguranca-lgpd-governanca.md` seções JWT e Auth.

Criar `apps/api-core/` do zero com NestJS:

**Bootstrap e configuração:**
- `src/main.ts` — bootstrap com OpenTelemetry ANTES do NestFactory, graceful shutdown
- `src/app.module.ts` — importa ConfigModule global, PrismaModule, todos os feature modules
- `src/prisma/prisma.service.ts` — wrapper do PrismaClient com logging e shutdown hook
- `src/common/` — todos os guards, decorators, filters, interceptors, pipes, middlewares, policies

**Módulo `auth`:**
- `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
- `strategies/jwt.strategy.ts`, `strategies/refresh.strategy.ts`
- `guards/jwt-auth.guard.ts`, `guards/refresh.guard.ts`
- `dto/login.dto.ts`, `dto/refresh.dto.ts`, `dto/logout.dto.ts`
- Endpoints: `POST /v1/auth/login`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`
- Refresh token rotation com reuse detection
- Rate limiting no login: 10 tentativas/min por IP
- Auditoria de login, falha, logout

**Módulo `tenants`:**
- CRUD completo de empresas e filiais
- Middleware que injeta `tenantId` no request context a partir do JWT
- `TenantContextService` global

**Módulo `users`:**
- CRUD de usuários por tenant
- Ativação/desativação com auditoria
- Endpoint de perfil autenticado `GET /v1/me`

**Módulo `roles-permissions`:**
- CRUD de cargos por tenant
- Atribuição de permissões a cargos
- `PermissionGuard` que verifica `recurso.ação` por cargo
- `PolicyService` com método `can(user, action, resource)`
- Testes: motorista não acessa financeiro, operador não altera permissões

Critério de aceite de FASE 4:
- Fluxo completo: login → JWT → request autenticado → logout
- Refresh token rotation funciona: token antigo invalidado após uso
- Tentativa de login com senha errada 10x bloqueia por 1 min
- Usuário de tenant A não acessa recursos de tenant B

---

### FASE 5 — API Core: Módulos Operacionais (45% → 60%)

**Checkpoint: 55%** — Registrar ao concluir trips + vehicles + drivers.
**Checkpoint: 60%** — Registrar ao concluir clients + occurrences + fuel + documents.

Para cada módulo, criar a estrutura padrão:
```
módulo/
  nome.module.ts
  nome.controller.ts       ← só recebe, valida DTO, chama use case
  nome.service.ts          ← orquestra use cases
  use-cases/               ← um arquivo por use case
  repositories/            ← acesso ao banco via Prisma
  dto/                     ← DTOs de entrada e saída com validação Zod/class-validator
  events/                  ← eventos de domínio publicados no outbox
  guards/                  ← guards específicos do módulo se necessário
```

**Módulos a implementar nesta fase:**

`trips` — Coração do MVP:
- CRUD completo com state machine de status (DRAFT→CONFIRMED→IN_PROGRESS→etc.)
- Saga de criação: validar veículo → alocar → validar motorista → atribuir → criar trip → publicar evento
- Endpoints: CRUD + `PATCH /v1/trips/:id/status`, `GET /v1/trips/today`, `GET /v1/trips/delayed`
- Eventos: TripCreated, TripStarted, TripDelayed, TripCompleted, TripCanceled

`vehicles` — Gestão da frota:
- CRUD + histórico de status
- Bloqueio automático de veículo com documento vencido
- Verificação de disponibilidade (não aloca veículo em manutenção)
- Eventos: VehicleStatusChanged, VehicleDocumentExpiring

`drivers` — Motoristas:
- CRUD + validação de CNH (bloqueia se vencida)
- Disponibilidade: não aloca motorista com ocorrência grave aberta sem aprovação
- Histórico de viagens por motorista

`clients` — Clientes contratantes:
- CRUD + contratos + SLA por cliente
- Indicadores: clientes ativos, contratos vencendo

`occurrences` — Ocorrências:
- CRUD com state machine (OPEN→IN_ANALYSIS→RESOLVED, OPEN→CRITICAL)
- Tipos, gravidade, responsável, ação tomada
- Vinculação a viagem, veículo, motorista, cliente
- Eventos: OccurrenceCreated, OccurrenceEscalated, OccurrenceResolved

`fuel` — Abastecimento:
- CRUD com validação de hodômetro (nunca decrementar)
- Detecção de anomalia: km/l < 80% da média histórica do veículo
- Flag de comprovante ausente
- Endpoints: CRUD + `GET /v1/fuel-records/anomalies`
- Eventos: FuelRecordCreated, FuelAnomalyDetected

`documents` — Documentos:
- CRUD vinculado a entidade (veículo, motorista, empresa)
- Alertas de vencimento em 60, 30 e 7 dias
- URL assinada para acesso seguro ao arquivo

Critério de aceite:
- Tentativa de criar viagem com veículo em manutenção retorna erro de domínio claro
- Abastecimento com hodômetro menor que o anterior retorna erro
- Anomalia de combustível é criada automaticamente quando km/l < 80% da média
- CNH vencida bloqueia alocação de motorista

---

### FASE 6 — API Core: Módulos de Suporte (60% → 70%)

**Checkpoint: 70%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

`maintenance` — Manutenção:
- Ordens de serviço com status (OPEN→IN_PROGRESS→COMPLETED)
- Vínculo com veículo (muda status do veículo para IN_MAINTENANCE)
- Alertas de preventiva vencida

`finance` — Financeiro básico:
- Contas a pagar e receber
- Centro de custo
- Receita por cliente, custo por veículo
- Permissão restrita: apenas cargo financeiro e CEO

`notifications` — Notificações:
- Sistema interno de notificações (in-app)
- Consumidor de eventos do Worker (ex.: FuelAnomalyDetected → cria notificação)
- Endpoint: `GET /v1/notifications`, `PATCH /v1/notifications/:id/read`

`audit` — Auditoria:
- Registro imutável de toda ação crítica
- `AuditService.log(actor, action, entity, before, after, ip)`
- Interceptor automático para ações anotadas com `@Auditable`
- Endpoint restrito: `GET /v1/audit` (apenas CEO, gerente)

`analytics` — Dados para dashboards:
- `GET /v1/dashboards/executive` — KPIs do cockpit executivo
- `GET /v1/dashboards/operation` — Torre operacional
- `GET /v1/dashboards/fleet` — Indicadores de frota
- `GET /v1/dashboards/fuel` — Indicadores de abastecimento
- Todas as queries com cache Redis de 60 segundos por tenant
- Queries otimizadas — nunca scan de tabela inteira sem índice

---

### FASE 7 — Worker e Outbox (70% → 78%)

**Checkpoint: 78%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

Leitura obrigatória: `docs/02-arquitetura-produto-escalavel.md` seção Outbox Pattern.

`apps/worker/src/`:

**outbox/outbox.processor.ts:**
- Poll na tabela `outbox_events` a cada 5 segundos
- Publica no BullMQ por tipo de evento
- Marca como `published_at` após confirmação
- Retry com backoff: 3 tentativas, delays 1s/5s/30s
- Dead-letter após 3 falhas (log + alerta)

**notifications/notification.processor.ts:**
- Consome eventos de domínio e cria notificações in-app
- Futuramente: e-mail, WhatsApp (placeholder já criado)

**documents/document-expiry.processor.ts:**
- Job diário: scan de documentos vencendo em 60/30/7 dias
- Cria notificações e eventos `DocumentExpiringSoon`

**reports/report.processor.ts:**
- Geração assíncrona de relatórios pesados
- Upload para S3 e notificação de download disponível

**anomaly-detection/fuel-anomaly.processor.ts:**
- Consome `FuelRecordCreated`
- Calcula média histórica de km/l do veículo
- Cria `FuelAnomalyDetected` se < 80% da média

Critério de aceite:
- Criar viagem gera evento no outbox, worker publica, notificação chega no módulo de notificações
- Job de documentos identifica vencimentos corretamente

---

### FASE 8 — OpenAPI e Contratos (78% → 84%)

**Checkpoint: 84%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

Gerar o contrato OpenAPI 3.1 completo em `openapi/v1/api.yaml`.

O NestJS gera automaticamente via `@nestjs/swagger`. Exportar o JSON/YAML e comitar em `openapi/v1/`.

Este arquivo é a **fronteira entre backend e frontend**. A Equipe Antigravity usa este arquivo para:
- Gerar tipos TypeScript via `openapi-typescript`
- Configurar MSW handlers para testes sem servidor
- Validar contratos com Schemathesis

Obrigações do arquivo OpenAPI:
- Todos os endpoints documentados com request/response schemas
- Todos os erros documentados (`400`, `401`, `403`, `404`, `422`, `429`, `500`)
- Exemplos reais em cada schema
- `security` definido corretamente (Bearer JWT)
- Versão: `1.0.0`

Após gerar, **notificar no chat** que o contrato está disponível em `openapi/v1/api.yaml` para a Equipe Antigravity consumir.

---

### FASE 9 — Infraestrutura (84% → 92%)

**Checkpoint: 92%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

**Docker:**

`infra/docker/api-core/Dockerfile`:
```
Multi-stage build → builder → runner
Node 22 Alpine
Usuário não-root (appuser)
HEALTHCHECK no /health/ready
EXPOSE 3000
```

`infra/docker/worker/Dockerfile` — idem.

`docker-compose.yml` na raiz:
- `postgres:16` com PostGIS e pgvector
- `redis:7-alpine`
- `api-core` com hot reload (desenvolvimento)
- `worker`
- Volumes nomeados para dados persistentes
- Rede interna isolada

**Terraform (estrutura, não aplicar):**

`infra/terraform/modules/database/main.tf`:
- RDS PostgreSQL 16 ou Cloud SQL
- Backup automático, retenção 7 dias
- Connection pooling (PgBouncer ou RDS Proxy)

`infra/terraform/modules/compute/main.tf`:
- ECS/Cloud Run ou equivalente
- Auto scaling por CPU

`infra/terraform/environments/staging/main.tf` e `prod/main.tf`:
- Referenciam os módulos com variáveis de ambiente

**CI/CD:**

`.github/workflows/ci.yml`:
- Trigger: push para main e pull requests
- Jobs em paralelo: lint, type-check, unit-tests, integration-tests
- Security scan: Snyk ou Trivy nas dependências
- Build Docker image (apenas em merge para main)

`.github/workflows/staging-deploy.yml`:
- Trigger: push para main após CI verde
- Build image, push para registry, deploy canary 10% → verificar SLOs → 100%

---

### FASE 10 — Testes e Qualidade (92% → 100%)

**Checkpoint: 100%** — Registrar em `PROGRESSO-CLAUDE.md` quando concluir.

**Testes de integração** em `apps/api-core/test/integration/`:
- Um arquivo por módulo crítico
- Usar Testcontainers com PostgreSQL real e Redis real
- Cobrir: criação de viagem com saga completa, abastecimento com anomalia, auditoria de ações críticas
- Testar isolamento de tenant: usuário do tenant A não acessa dados do tenant B

**Testes de contrato** em `tests/contracts/`:
- Pact provider verification
- Executar contra o contrato gerado pelo frontend (quando disponível)

**Testes de performance** em `tests/performance/`:
- `k6/trips-list.js` — GET /v1/trips com 50 usuários simultâneos, target P95 < 500ms
- `k6/dashboard-executive.js` — GET /v1/dashboards/executive com 20 usuários, target P95 < 1s
- `k6/fuel-create.js` — POST /v1/fuel-records com 20 usuários, target P95 < 1s

**Scripts:**

`scripts/db/reset.sh` — drop e recria o banco em dev
`scripts/db/stats.sql` — queries de saúde do banco (pg_stat_statements, cache hit)
`scripts/seed/run.ts` — executa o seed completo

**Critério final de 100%:**
- `pnpm turbo test` verde em todos os workspaces
- `pnpm turbo build` compila sem erro
- Docker Compose sobe todo o stack sem erro
- `prisma migrate dev` roda do zero em banco limpo
- Testes de performance passam nos SLOs definidos
- Nenhuma senha, token ou secret em nenhum arquivo do repositório

---

## Registro de progresso

A cada checkpoint, atualizar o arquivo `PROGRESSO-CLAUDE.md` na raiz com:

```markdown
## [DATA] - [PORCENTAGEM]% — [NOME DA FASE]

**Status:** Concluído ✅ | Em andamento 🔄 | Bloqueado ⛔

**O que foi feito:**
- [lista do que foi criado/implementado]

**Testes passando:**
- [lista de testes que validam o checkpoint]

**Dependências para o próximo checkpoint:**
- [o que precisa estar pronto antes de avançar]

**Sinalizações para a Equipe Antigravity:**
- [ex.: contrato OpenAPI disponível em openapi/v1/api.yaml]
```

---

## Agentes disponíveis para consulta

Para cada fase, acione o agente especialista da pasta `AGENTES/` conforme a área:

| Fase | Agente principal | Agente de apoio |
|---|---|---|
| 1–2 — Fundação e Domínio | `AGENTE BACKEND NESTJS TYPESCRIPT.md` | `AGENTE ENTERPRISE ARCHITECT.md` |
| 3–4 — Auth e Multitenancy | `AGENTE BACKEND NESTJS TYPESCRIPT.md` | `AGENTE SECURITY COMPLIANCE LGPD PCI.md` |
| 5 — Banco de dados | `AGENTE DATABASE POSTGRESQL DBA.md` | `AGENTE BACKEND NESTJS TYPESCRIPT.md` |
| 6 — Jobs e Eventos | `AGENTE BACKEND NESTJS TYPESCRIPT.md` | `AGENTE ENTERPRISE ARCHITECT.md` |
| 7 — Observabilidade | `AGENTE OBSERVABILITY SRE.md` | `AGENTE DEVOPS SRE CLOUD.md` |
| 8 — Testes | `AGENTE QA TEST AUTOMATION.md` | `AGENTE BACKEND NESTJS TYPESCRIPT.md` |
| 9–10 — Infra e CI/CD | `AGENTE DEVOPS SRE CLOUD.md` | `AGENTE OBSERVABILITY SRE.md` |

> **O agente primário para toda a construção NestJS é `AGENTE BACKEND NESTJS TYPESCRIPT.md`** — leia-o antes de qualquer fase de código backend.

---

## Sinalizar no chat se precisar de novos agentes

Caso encontre situações que demandem expertise específica não coberta, sinalizar no chat com:
- **Qual agente falta**
- **Por que é necessário**
- **Qual tarefa está bloqueada sem ele**
