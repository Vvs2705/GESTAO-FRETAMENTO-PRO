# 06 — Backend, API, Integrações e Eventos

## Objetivo

Definir como o backend deve ser organizado para sustentar um produto SaaS multiempresa, modular, seguro e preparado para integrações futuras.

## Estilo de API

### MVP

- REST para APIs principais;
- WebSocket para eventos operacionais em tempo real;
- OpenAPI/Swagger para documentação;
- webhooks em fase posterior.

### Futuro

- GraphQL apenas se houver necessidade real de consultas altamente flexíveis;
- gRPC apenas para comunicação interna de serviços de alta performance;
- APIs públicas versionadas para clientes enterprise.

## Convenção de rotas

Exemplos:

```txt
POST   /v1/auth/login
POST   /v1/auth/refresh
GET    /v1/me
GET    /v1/tenants/current

GET    /v1/vehicles
POST   /v1/vehicles
GET    /v1/vehicles/:id
PATCH  /v1/vehicles/:id

GET    /v1/trips
POST   /v1/trips
PATCH  /v1/trips/:id/status

GET    /v1/fuel-records
POST   /v1/fuel-records
GET    /v1/fuel-records/anomalies

GET    /v1/dashboards/executive
GET    /v1/dashboards/operation
GET    /v1/dashboards/fleet
```

## Versionamento

Toda API pública deve nascer com `/v1`.

Regras:

- não quebrar contrato sem nova versão;
- documentar mudanças;
- manter changelog;
- usar feature flags para liberar recursos.

## Autenticação

Requisitos:

- login por e-mail/senha ou provedor corporativo futuro;
- access token curto;
- refresh token rotativo;
- revogação de sessão;
- MFA em fase madura;
- política de senha;
- bloqueio por tentativa;
- auditoria de login.

## Autorização

Cada endpoint deve validar:

- tenant;
- usuário;
- cargo;
- permissão;
- escopo;
- ação;
- sensibilidade do recurso.

Exemplo de ações:

- `vehicle.read`
- `vehicle.create`
- `vehicle.update`
- `vehicle.delete`
- `fuel.create`
- `fuel.approve`
- `finance.read`
- `audit.read`
- `permission.manage`

## Camada de políticas

Não espalhar lógica de permissão dentro dos controllers.

Criar uma camada dedicada:

```txt
PermissionGuard
PolicyService
AccessScopeResolver
SensitiveDataGuard
```

## Auditoria

Registrar ações como:

- login;
- falha de login;
- exportação;
- alteração de permissão;
- alteração de cargo;
- criação de viagem;
- alteração de status;
- lançamento de abastecimento;
- edição de abastecimento;
- exclusão lógica;
- visualização de financeiro;
- visualização de dados sensíveis.

## Padrão de eventos

Todo evento de domínio deve ter estrutura consistente:

```json
{
  "event_id": "uuid",
  "tenant_id": "uuid",
  "type": "FuelRecordCreated",
  "actor_user_id": "uuid",
  "entity_type": "fuel_record",
  "entity_id": "uuid",
  "occurred_at": "2026-05-27T10:00:00Z",
  "correlation_id": "uuid",
  "payload": {}
}
```

## Eventos prioritários

### Operação

- TripCreated
- TripUpdated
- TripStarted
- TripDelayed
- TripCompleted
- TripCanceled

### Ocorrências

- OccurrenceCreated
- OccurrenceEscalated
- OccurrenceResolved
- OccurrenceReopened

### Frota

- VehicleCreated
- VehicleStatusChanged
- VehicleDocumentExpiring
- VehicleUnavailable

### Abastecimento

- FuelRecordCreated
- FuelRecordEdited
- FuelReceiptMissing
- FuelAnomalyDetected

### Manutenção

- MaintenanceOrderCreated
- MaintenanceOrderCompleted
- PreventiveMaintenanceDue

### Segurança

- PermissionChanged
- SensitiveDataViewed
- ReportExported
- LoginFailed

## Integrações futuras

### Mapas

Possibilidades:

- Google Maps;
- Mapbox;
- MapLibre + provedor de tiles;
- Here Maps.

Uso:

- rotas;
- pontos;
- localização;
- geocoding;
- ETA.

### WhatsApp Business

Uso futuro:

- notificação para passageiro;
- alerta para motorista;
- comunicação com cliente;
- resumo de ocorrência.

Requisito:

- nunca depender do WhatsApp como banco de dados;
- toda conversa relevante precisa gerar registro estruturado.

### Telemetria

Possibilidades:

- app do motorista;
- hardware GPS;
- integração com rastreadores;
- importação manual inicial;
- simulador para MVP.

### Financeiro

Possibilidades:

- emissão de boleto;
- PIX;
- NFS-e;
- ERP externo;
- conciliação.

### Documentos

Possibilidades:

- OCR;
- armazenamento seguro;
- assinatura eletrônica;
- vencimentos automáticos.

## Padrão de erro

Toda resposta de erro deve ser clara:

```json
{
  "error": {
    "code": "FUEL_ODOMETER_INVALID",
    "message": "A quilometragem informada é menor que a última registrada para este veículo.",
    "details": {
      "last_odometer": 120450,
      "submitted_odometer": 119000
    }
  }
}
```

## Logs

Logs devem conter:

- timestamp;
- tenant_id;
- user_id;
- request_id;
- correlation_id;
- rota;
- status;
- duração;
- erro, se houver.

Não logar:

- senha;
- token;
- documento completo;
- dados pessoais sensíveis desnecessários;
- anexos.

## Idempotência em Operações Críticas

Qualquer operação que modifica estado e pode ser retentada precisa de chave de idempotência.

Operações que exigem idempotência:
- lançamento de abastecimento;
- criação de viagem;
- alteração de status de viagem;
- registro de ocorrência;
- lançamento financeiro.

Padrão:
```http
POST /v1/fuel-records
Idempotency-Key: <uuid-gerado-pelo-cliente>
```

Backend:
```sql
-- Tabela de deduplicação
CREATE TABLE idempotency_keys (
  key         text NOT NULL,
  tenant_id   uuid NOT NULL,
  endpoint    text NOT NULL,
  response    jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  PRIMARY KEY (key, tenant_id)
);
```

Retornar resposta em cache se a chave já existir. Expirar após 24h.

## Health Checks e Probes

Expor endpoints de saúde para orquestração e monitoramento:

```txt
GET /health        → liveness: processo está vivo
GET /health/ready  → readiness: pode receber tráfego (DB, Redis, deps ok)
GET /health/live   → liveness probe
```

Formato de resposta:
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "outbox_worker": "healthy"
  },
  "version": "1.2.3",
  "uptime_seconds": 3600
}
```

## Rate Limiting por Tenant

Rate limiting deve ser por tenant, não apenas por IP, para garantir isolamento de recursos.

Regras de referência:
- Endpoints de listagem: 200 req/min por tenant.
- Endpoints de escrita: 60 req/min por tenant.
- Endpoints de upload: 30 req/min por tenant.
- Auth/login: 10 tentativas/min por IP com backoff exponencial.

Implementar via Redis com sliding window counter. Retornar headers padrão:

```http
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1748386800
Retry-After: 30  (quando limite excedido)
```

## Paginação

Toda listagem deve usar cursor-based pagination para consistência em dados que mudam frequentemente.

```txt
GET /v1/trips?cursor=eyJpZCI6MTIzfQ&limit=50
```

Resposta:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTczfQ",
    "has_more": true,
    "limit": 50
  }
}
```

Evitar offset pagination em tabelas grandes — causa N+1 no banco e resultados inconsistentes durante inserções paralelas.

## API Versioning e Sunset Policy

- Toda API nasce com `/v1`.
- Antes de deprecar um endpoint, publicar `Deprecation` e `Sunset` headers com 90 dias de antecedência mínima.
- Manter changelog de breaking changes.
- Nunca remover campo de resposta sem bump de versão.
- Adicionar campo `api_version` nos logs para rastrear clientes usando versões antigas.

## Graceful Shutdown

O servidor deve suportar desligamento gracioso para deploy sem downtime.

Sequência:
1. SIGTERM recebido → parar de aceitar novas conexões.
2. Aguardar requests em andamento finalizarem (timeout de 30s).
3. Fechar conexões com banco e Redis de forma ordenada.
4. Encerrar processo com exit code 0.

## Retry e Circuit Breaker para Dependências Externas

Para chamadas a APIs externas (mapas, WhatsApp, storage):

- Retry com backoff exponencial: 1s, 2s, 4s, 8s (máximo 3 tentativas).
- Circuit breaker: abrir após 5 falhas consecutivas, testar a cada 30s.
- Timeout explícito em toda chamada externa: nunca depender do timeout padrão.
- Fallback definido: se mapas falharem, aceitar endereço sem geocoding.

## Contrato de Evento — AsyncAPI Resumido

Todo evento publicado deve seguir schema versionado:

```yaml
# AsyncAPI 3.0 (trecho)
asyncapi: 3.0.0
info:
  title: Gestão Fretamento Pro — Event Catalog
  version: 1.0.0

channels:
  trip.created:
    publish:
      message:
        payload:
          type: object
          required: [event_id, tenant_id, type, actor_user_id, entity_id, occurred_at, payload]
          properties:
            event_id:    { type: string, format: uuid }
            tenant_id:   { type: string, format: uuid }
            type:        { type: string, enum: [TripCreated] }
            actor_user_id: { type: string, format: uuid }
            entity_id:   { type: string, format: uuid }
            occurred_at: { type: string, format: date-time }
            correlation_id: { type: string, format: uuid }
            payload:     { type: object }
```

Manter catálogo de eventos versionado no repositório. Quebrar contrato exige nova versão do tipo de evento (ex.: `TripCreatedV2`).

## Headers de Segurança Obrigatórios

Todo response deve incluir:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

## Conclusão

O backend deve ser tratado como a espinha dorsal do produto. Ele precisa proteger o negócio, organizar o domínio e permitir que frontend, mobile, BI e IA cresçam sem duplicar lógica. Idempotência, health checks, rate limiting por tenant e contratos de eventos versionados são requisitos mínimos de qualidade, não features opcionais.
