# 07 — Dados, Banco, Analytics e BI

## Objetivo

Definir a estrutura de dados da plataforma para garantir consistência operacional, rastreabilidade, analytics, BI e futura IA.

## Banco principal

Escolha: PostgreSQL.

Motivos:

- dados altamente relacionais;
- necessidade de integridade;
- transações;
- histórico;
- auditoria;
- relatórios;
- extensões como PostGIS e pgvector;
- aderência a SaaS B2B.

## Extensões recomendadas

### PostGIS

Uso:

- pontos de embarque;
- rotas;
- geocercas;
- localização de veículos;
- distância;
- análise geográfica;
- expansão futura de roteirização.

### pgvector

Uso futuro:

- busca semântica em ocorrências;
- copiloto consultando histórico;
- RAG com documentos internos;
- análise de reclamações.

### TimescaleDB

Uso futuro:

- telemetria;
- localização em alta frequência;
- séries temporais;
- eventos de sensores.

## Padrões de tabela

Toda tabela operacional deve ter:

```txt
id uuid primary key
tenant_id uuid not null
created_at timestamptz not null
updated_at timestamptz not null
created_by uuid
updated_by uuid
deleted_at timestamptz
status text
```

## Entidades centrais do MVP

### tenants

Empresas clientes da plataforma.

Campos:

- id
- name
- trade_name
- document
- plan
- status
- settings

### branches

Filiais ou bases operacionais.

Campos:

- id
- tenant_id
- name
- city
- state
- address
- status

### users

Usuários do sistema.

Campos:

- id
- tenant_id
- employee_id
- name
- email
- phone
- password_hash
- status
- last_login_at

### roles

Cargos/papéis.

Campos:

- id
- tenant_id
- name
- department
- hierarchy_level
- description

### permissions

Permissões granulares.

Campos:

- id
- key
- module
- action
- description

### role_permissions

Vínculo entre cargo e permissão.

Campos:

- id
- tenant_id
- role_id
- permission_id
- scope

### employees

Colaboradores.

Campos:

- id
- tenant_id
- branch_id
- role_id
- name
- document
- phone
- email
- department
- admission_date
- status

### vehicles

Veículos.

Campos:

- id
- tenant_id
- branch_id
- plate
- prefix
- type
- capacity
- brand
- model
- year
- current_odometer
- status

### drivers

Motoristas.

Campos:

- id
- tenant_id
- employee_id
- license_number
- license_category
- license_expires_at
- availability_status

### clients

Clientes contratantes.

Campos:

- id
- tenant_id
- name
- document
- contact_name
- contact_email
- contact_phone
- status

### routes

Rotas ou linhas.

Campos:

- id
- tenant_id
- client_id
- name
- origin
- destination
- estimated_distance_km
- estimated_duration_minutes
- status

### route_points

Pontos de embarque/desembarque.

Campos:

- id
- tenant_id
- route_id
- sequence
- name
- address
- latitude
- longitude
- planned_time

### trips

Viagens.

Campos:

- id
- tenant_id
- client_id
- route_id
- vehicle_id
- driver_id
- scheduled_start_at
- scheduled_end_at
- actual_start_at
- actual_end_at
- status
- notes

### occurrences

Ocorrências.

Campos:

- id
- tenant_id
- trip_id
- vehicle_id
- driver_id
- client_id
- type
- severity
- description
- status
- responsible_user_id
- resolved_at

### fuel_records

Abastecimentos.

Campos:

- id
- tenant_id
- vehicle_id
- driver_id
- branch_id
- fuel_station_name
- fuel_type
- liters
- unit_price
- total_amount
- odometer
- receipt_file_id
- supplied_at
- anomaly_flag
- anomaly_reason

### maintenance_orders

Ordens de manutenção.

Campos:

- id
- tenant_id
- vehicle_id
- type
- description
- supplier_name
- expected_start_at
- expected_end_at
- actual_end_at
- total_cost
- status

### documents

Documentos.

Campos:

- id
- tenant_id
- entity_type
- entity_id
- document_type
- file_id
- expires_at
- status
- sensitivity_level

### audit_logs

Auditoria.

Campos:

- id
- tenant_id
- actor_user_id
- action
- entity_type
- entity_id
- before
- after
- ip_address
- user_agent
- created_at

## Analytics

A base transacional não deve ser sobrecarregada por relatórios pesados.

### MVP

- views materializadas simples;
- queries otimizadas;
- índices adequados;
- cache em Redis para dashboards;
- pré-cálculos diários.

### Fase madura

- data warehouse;
- dbt;
- pipelines;
- camada semântica;
- BI embutido;
- métricas governadas.

## KPIs por área

### Operação

- viagens realizadas;
- viagens atrasadas;
- viagens canceladas;
- ocorrências abertas;
- SLA por cliente;
- ocupação por rota.

### Frota

- disponibilidade;
- veículos parados;
- custo por veículo;
- km rodado;
- consumo médio;
- documentos vencendo.

### Abastecimento

- custo total;
- litros;
- preço médio;
- km/l;
- custo/km;
- divergências;
- consumo fora do padrão.

### Manutenção

- OS abertas;
- custo mensal;
- preventivas vencidas;
- corretivas;
- reincidência;
- tempo parado.

### Financeiro

- receita;
- custo;
- margem;
- contas a receber;
- contas a pagar;
- margem por cliente;
- rentabilidade por rota.

## IA futura depende de dados limpos

Antes de IA, o sistema precisa garantir:

- cadastros padronizados;
- campos obrigatórios certos;
- histórico;
- status consistentes;
- auditoria;
- anexos organizados;
- eventos de domínio.

## Tipos de Dados — Regras Obrigatórias

| Caso | Tipo correto | Nunca usar |
|---|---|---|
| Valores monetários | `numeric(19,4)` | `float`, `real`, `double precision` |
| Timestamps de eventos | `timestamptz` | `timestamp` (sem fuso = bug silencioso) |
| Identificadores | `uuid` com `gen_random_uuid()` | `serial` ou `bigserial` em tabelas multiempresa |
| Status/enums | `text` com CHECK constraint | `enum` do Postgres (difícil de migrar) |
| Dados geográficos | `geometry(Point, 4326)` via PostGIS | `varchar` com lat/lng em strings |
| Documentos semiestruturados | `jsonb` | `json` (sem índice GIN) |
| Hodômetro | `numeric(10,1)` | `int` (perderia casas decimais) |

## Estratégia de Índices

Índices obrigatórios por padrão de consulta mais frequente:

```sql
-- Todas as consultas filtram por tenant — índice composto obrigatório
CREATE INDEX CONCURRENTLY idx_trips_tenant_status
  ON trips (tenant_id, status, scheduled_start_at DESC);

CREATE INDEX CONCURRENTLY idx_trips_tenant_vehicle
  ON trips (tenant_id, vehicle_id)
  WHERE status NOT IN ('COMPLETED', 'CANCELED');

CREATE INDEX CONCURRENTLY idx_fuel_tenant_vehicle_supplied
  ON fuel_records (tenant_id, vehicle_id, supplied_at DESC);

CREATE INDEX CONCURRENTLY idx_fuel_anomaly
  ON fuel_records (tenant_id, anomaly_flag)
  WHERE anomaly_flag = true;

CREATE INDEX CONCURRENTLY idx_occurrences_tenant_status
  ON occurrences (tenant_id, status, severity, created_at DESC);

CREATE INDEX CONCURRENTLY idx_audit_tenant_actor_action
  ON audit_logs (tenant_id, actor_user_id, action, created_at DESC);

-- Documentos vencendo — partial index de alta seletividade
CREATE INDEX CONCURRENTLY idx_documents_expiring
  ON documents (tenant_id, expires_at)
  WHERE status NOT IN ('EXPIRED', 'REVOKED')
    AND expires_at < now() + interval '60 days';
```

Regra: toda query com `WHERE tenant_id = $1` deve ter `tenant_id` como coluna mais à esquerda do índice.

## Row-Level Security (RLS)

Ativar RLS em fase de maturidade do MVP para garantia de isolamento no nível do banco.

```sql
-- Ativar RLS na tabela
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Política para application role
CREATE POLICY tenant_isolation ON trips
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Application role sem superuser
CREATE ROLE app_user;
GRANT SELECT, INSERT, UPDATE ON trips TO app_user;

-- Configurar tenant no início de cada request
SET LOCAL app.current_tenant_id = '...';
```

No MVP, o isolamento via `WHERE tenant_id = $1` no application layer é suficiente. Implementar RLS como camada adicional de defesa quando houver múltiplos clientes ativos.

## Particionamento

Tabelas que crescem indefinidamente devem ser particionadas desde o design:

```sql
-- audit_logs: particionamento mensal por range
CREATE TABLE audit_logs (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  actor_user_id uuid,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Criar partições a cada mês (automatizar com pg_partman)
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

Tabelas candidatas ao particionamento:
- `audit_logs` → range por `created_at` (mensal)
- `trips` → range por `scheduled_start_at` (quando > 5M registros)
- `fuel_records` → range por `supplied_at` (quando > 2M registros)
- Telemetria futura → timescaledb hypertable

## Migrações — Expand and Contract

Nunca modificar coluna ou tabela em produção de forma destrutiva. Seguir protocolo:

**Fase 1 — Expand:** adicionar nova coluna/tabela (não remover a antiga).
```sql
ALTER TABLE vehicles ADD COLUMN fuel_type text;
-- Aplicar em produção sem downtime
```

**Fase 2 — Backfill:** preencher dados existentes em batches.
```sql
UPDATE vehicles SET fuel_type = 'DIESEL' WHERE fuel_type IS NULL LIMIT 1000;
-- Repetir até completar, sem travar a tabela
```

**Fase 3 — Switch:** novo código usa nova coluna; código antigo mantido.

**Fase 4 — Contract:** remover coluna antiga após confirmar zero uso.
```sql
ALTER TABLE vehicles DROP COLUMN old_fuel_column;
```

Sempre usar `CREATE INDEX CONCURRENTLY` para índices em produção.
Definir `lock_timeout = '5s'` e `statement_timeout = '30s'` em sessões de migração.

## Connection Pooling

Nunca conectar diretamente ao PostgreSQL de centenas de instâncias da aplicação.

Usar PgBouncer em modo transaction pooling:

```ini
[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
server_idle_timeout = 600
```

Benefícios:
- Limita conexões reais no Postgres (target: max_connections ≤ 200 para instâncias gerenciadas).
- Reutiliza conexões entre requests.
- Permite escalar a aplicação horizontalmente sem explodir o pool.

## RPO e RTO — Objetivos Explícitos

| Objetivo | Target MVP | Target Produção Madura |
|---|---|---|
| RPO (Recovery Point Objective) | ≤ 1 hora | ≤ 5 minutos |
| RTO (Recovery Time Objective) | ≤ 4 horas | ≤ 30 minutos |

Como atingir:
- RPO ≤ 5min: WAL archiving contínuo para S3 + streaming replication.
- RTO ≤ 30min: réplica de standby quente (Patroni) com failover automático.
- Restore drills: executar mensalmente e registrar o tempo real.

Ferramenta recomendada: pgBackRest para backup + PITR; WAL-G como alternativa.

## Monitoramento do Banco

Queries e métricas obrigatórias no dashboard de saúde do banco:

```sql
-- Top queries por tempo total
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 20;

-- Transações longas (> 30s)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query_start < now() - interval '30 seconds';

-- Cache hit ratio (target > 99%)
SELECT sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio
FROM pg_statio_user_tables;

-- Índices não usados
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE 'pk_%';
```

Alertas obrigatórios:
- Cache hit ratio < 99%.
- Transação ativa > 60 segundos.
- Conexões > 80% do max_connections.
- Replication lag > 30 segundos.
- Autovacuum não rodando em tabelas de alta escrita há > 10 minutos.

## Analytics — Camada de Transformação com dbt

Para relatórios e dashboards, nunca consultar diretamente as tabelas operacionais com queries pesadas. Usar camada de transformação.

Estrutura recomendada com dbt:

```txt
models/
  staging/        → 1:1 com tabela fonte, tipagem, limpeza simples
    stg_trips.sql
    stg_fuel_records.sql
    stg_occurrences.sql

  intermediate/   → joins, cálculos, agregações intermediárias
    int_trips_with_cost.sql
    int_fuel_anomalies.sql

  marts/          → tabelas prontas para consumo por dashboards e relatórios
    mart_operations_daily.sql
    mart_fleet_performance.sql
    mart_fuel_by_vehicle.sql
    mart_executive_kpis.sql
```

Views materializadas para o MVP (antes de dbt completo):

```sql
CREATE MATERIALIZED VIEW mv_daily_operations AS
SELECT
  tenant_id,
  date_trunc('day', scheduled_start_at) AS day,
  count(*) AS total_trips,
  count(*) FILTER (WHERE status = 'COMPLETED') AS completed,
  count(*) FILTER (WHERE status = 'DELAYED') AS delayed,
  count(*) FILTER (WHERE status = 'CANCELED') AS canceled
FROM trips
GROUP BY tenant_id, date_trunc('day', scheduled_start_at);

-- Refresh a cada hora
SELECT cron.schedule('refresh_mv_daily_operations', '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_operations');
```

## Conclusão

O banco é o centro da verdade operacional. Se ele nascer bem modelado — com tipos corretos, índices compostos por tenant, RLS, particionamento planejado, migrações expand-and-contract e RPO/RTO explícitos — o produto poderá crescer para BI, IA, auditoria, integrações e produto comercial sem perder confiabilidade ou precisar de reescrita.
