# 01 — Decisão de Stack Tecnológica

## Objetivo deste documento

Definir o caminho tecnológico para desenvolver uma plataforma SaaS B2B de alto padrão, com base sólida para MVP e crescimento futuro.

## Critérios usados

A stack foi escolhida considerando:

- disponibilidade de profissionais no mercado;
- maturidade do ecossistema;
- qualidade para dashboards e produtos SaaS;
- tipagem forte;
- velocidade de desenvolvimento;
- segurança;
- escalabilidade;
- facilidade de manutenção;
- capacidade de evoluir para mobile, IA, BI e tempo real;
- compatibilidade com arquitetura modular.

## Sinais do mercado atual

Referências públicas recentes apontam forte uso de JavaScript, SQL, Python e TypeScript em desenvolvimento moderno. O GitHub Octoverse 2025 destaca TypeScript chegando ao topo do uso na plataforma, impulsionado por IA, agentes e linguagens tipadas. A pesquisa Stack Overflow Developer Survey 2025 mostra JavaScript, SQL, Python e TypeScript entre as linguagens mais usadas, e PostgreSQL como banco extremamente relevante no ecossistema. O State of JavaScript 2025 reforça a centralidade do desenvolvimento frontend, backend e dashboards dentro do ecossistema JavaScript/TypeScript.

## Stack recomendada

### Frontend Web

**Escolha principal: Next.js + React + TypeScript**

Uso:

- painel administrativo;
- dashboards;
- portal do cliente;
- telas operacionais;
- visão executiva;
- módulos internos.

Motivos:

- React é dominante em produtos web modernos;
- Next.js permite arquitetura robusta para SaaS;
- TypeScript reduz erros e melhora manutenção;
- ótimo ecossistema para dashboards, tabelas, mapas e design systems;
- boa integração com autenticação, APIs, cache e renderização híbrida.

Bibliotecas recomendadas:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui ou Radix UI
- TanStack Query
- TanStack Table
- Zustand ou Jotai para estado local
- Zod para validação
- Recharts, ECharts ou Tremor para gráficos
- MapLibre GL ou Google Maps/Mapbox para mapas
- React Hook Form para formulários

### Backend Core

**Escolha principal: NestJS + TypeScript**

Uso:

- autenticação;
- multiempresa;
- regras de negócio;
- APIs;
- permissões;
- eventos;
- auditoria;
- integrações;
- núcleo operacional.

Motivos:

- arquitetura modular;
- uso nativo de TypeScript;
- bom padrão para times grandes;
- excelente para domínios de negócio;
- suporta REST, WebSocket, filas, eventos e microsserviços;
- combina bem com monorepo e DDD.

Bibliotecas e camadas:

- NestJS
- Prisma ou Drizzle ORM
- Zod ou class-validator
- OpenAPI/Swagger
- Passport/Auth.js quando aplicável
- BullMQ para filas com Redis
- WebSocket Gateway
- OpenTelemetry
- Pino para logs estruturados

### Serviços de IA e Analytics

**Escolha principal: Python + FastAPI**

Uso:

- modelos preditivos;
- copilotos;
- processamento de dados;
- análise de consumo;
- previsão de atraso;
- resumo de ocorrências;
- RAG operacional;
- integração com LLMs.

Motivos:

- Python domina IA, dados e automação analítica;
- FastAPI é moderno, performático e tipado;
- separa o núcleo transacional da camada de inteligência;
- permite evoluir IA sem travar o backend principal.

Bibliotecas futuras:

- FastAPI
- Pydantic
- Pandas/Polars
- scikit-learn
- LangChain ou LlamaIndex, se necessário
- pgvector
- MLflow, em fase madura
- Celery ou RQ, se houver processamento pesado

### Mobile

**Escolha futura: React Native + Expo**

Uso:

- app motorista;
- app passageiro;
- checklists;
- localização;
- notificações;
- upload de fotos;
- confirmação de embarque.

Motivos:

- reaproveitamento de conhecimento React/TypeScript;
- bom custo-benefício;
- entrega Android e iOS;
- ideal para app operacional em fases 2 e 3.

### Banco de Dados

**Escolha principal: PostgreSQL**

Uso:

- dados transacionais;
- clientes;
- usuários;
- permissões;
- viagens;
- veículos;
- motoristas;
- abastecimentos;
- ocorrências;
- contratos;
- financeiro.

Motivos:

- confiabilidade;
- integridade relacional;
- transações;
- extensões;
- JSONB quando necessário;
- bom suporte a analytics;
- compatível com PostGIS, pgvector e TimescaleDB.

Extensões recomendadas:

- PostGIS para geodados;
- pgvector para IA/RAG;
- TimescaleDB em fase futura para telemetria e séries temporais;
- pgcrypto para funções criptográficas específicas.

### Cache, sessões e filas rápidas

**Escolha: Redis**

Uso:

- cache;
- rate limit;
- sessões;
- filas leves;
- presença online;
- estados temporários;
- eventos rápidos.

### Mensageria

**MVP: Redis/BullMQ + Outbox Pattern**

**Escala futura: Kafka ou RabbitMQ**

Uso:

- notificação de viagem criada;
- ocorrência registrada;
- abastecimento suspeito;
- documento vencendo;
- manutenção disparada;
- evento de telemetria;
- alerta executivo.

Diretriz:

- não começar com Kafka se ainda não houver volume;
- já modelar eventos de domínio desde o início;
- usar Outbox Pattern para evitar perda entre banco e fila.

### Infraestrutura

**MVP profissional: Docker + CI/CD + banco gerenciado**

**Escala: Kubernetes + Terraform + observabilidade completa**

Uso:

- ambientes consistentes;
- deploy previsível;
- rollbacks;
- escalabilidade;
- monitoramento;
- segurança operacional.

## Stack final recomendada para o MVP

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Estado/dados | TanStack Query, Zustand |
| Formulários | React Hook Form, Zod |
| Backend | NestJS, TypeScript |
| ORM | Prisma ou Drizzle |
| Banco principal | PostgreSQL |
| Geodados | PostGIS |
| Cache/filas | Redis + BullMQ |
| IA futura | Python + FastAPI |
| Mobile futuro | React Native + Expo |
| Infra | Docker, CI/CD, cloud gerenciada |
| Observabilidade | OpenTelemetry, logs estruturados, Grafana futuro |

## Decisão arquitetural

A plataforma deve começar como **monorepo modular**, não microsserviços puros.

Motivo:

- acelera MVP;
- reduz custo de DevOps;
- mantém consistência;
- facilita refatoração;
- permite escalar extraindo serviços depois.

O código deve nascer dividido por domínios para evitar bagunça:

- operação;
- frota;
- motoristas;
- passageiros;
- viagens;
- abastecimento;
- manutenção;
- documentos;
- financeiro;
- CRM;
- permissões;
- auditoria;
- notificações;
- analytics.

## O que evitar

- PHP/Laravel como core, não por incapacidade, mas por menor alinhamento com a visão TypeScript full-stack e dashboards modernos.
- Firebase puro como banco principal, por risco de limitar modelagem relacional complexa.
- Supabase como única arquitetura, embora possa ser usado em protótipos.
- Microsserviços desde o primeiro commit, pois adicionam complexidade antes de haver escala.
- No-code como base do produto comercial.
- Banco não relacional como banco principal, porque o domínio exige integridade, relações e auditoria forte.

## Decisões Técnicas Específicas — ADRs Resumidos

### ADR-001: ORM — Prisma vs Drizzle

**Decisão:** Prisma para MVP; reavaliação para Drizzle em fase de escala.

**Justificativa:** Prisma tem melhor DX, geração de tipos automática e migrations gerenciadas — acelerando MVP. Drizzle tem melhor performance e controle SQL, mas exige mais maturidade da equipe.

**Critério de revisão:** Revisar se Prisma se tornar gargalo de performance (> 10ms de overhead em queries simples) ou se o time precisar de controle fino de SQL.

### ADR-002: Estado Global — Zustand vs Redux

**Decisão:** Zustand para estado global de cliente.

**Justificativa:** Redux é excessivo para este tipo de aplicação. Zustand é simples, tipado e sem boilerplate. Em Next.js App Router, o estado global de cliente deve ser minimizado — preferir URL state e Server Components.

### ADR-003: Autenticação — Auth.js vs Implementação própria

**Decisão:** Implementação própria com Passport.js (NestJS) para MVP; Auth.js como alternativa se o time mudar para arquitetura serverless.

**Justificativa:** O sistema tem permissões customizadas (RBAC+ABAC), multitenancy e auditoria — Auth.js não gerencia esses aspectos nativamente. A implementação própria dá controle sobre refresh tokens, revogação, MFA e auditoria desde o início.

### ADR-004: Mensageria — BullMQ vs Kafka

**Decisão:** BullMQ (Redis) para MVP; Kafka para escala > 10k eventos/min.

**Justificativa:** BullMQ é suficiente para notificações, relatórios e outbox worker. Kafka traz complexidade operacional desnecessária no MVP — sem equipe de plataforma para sustentá-lo.

**Critério de revisão:** Revisar quando: (1) volume de eventos exigir replay de longo prazo, (2) múltiplos consumidores independentes do mesmo evento, (3) integração com parceiros via streaming.

## TypeScript — Configuração Obrigatória

Não usar TypeScript permissivo. Configurar `tsconfig.json` com:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Usar branded types para IDs de domínio:

```typescript
type TenantId = string & { __brand: 'TenantId' };
type TripId = string & { __brand: 'TripId' };
type VehicleId = string & { __brand: 'VehicleId' };
// Impede passar um TripId onde um VehicleId é esperado
```

## OpenTelemetry — Instrumentação desde o Início

Não adicionar observabilidade depois. Instrumentar desde o dia 1.

Dependências para NestJS:
```
@opentelemetry/sdk-node
@opentelemetry/auto-instrumentations-node
@opentelemetry/exporter-trace-otlp-http
@opentelemetry/exporter-metrics-otlp-proto
```

Configurar antes do bootstrap do NestJS:
- Auto-instrumentação de HTTP, Prisma/TypeORM, Redis, BullMQ.
- Atributos customizados em spans: `tenant.id`, `user.id`, `module`.
- Propagação W3C Trace Context entre serviços.
- Exportar para Jaeger/Tempo (desenvolvimento), Datadog/Grafana Cloud (produção).

## Bundle Size Budget

Controlar tamanho do bundle desde o início evita problemas difíceis de reverter.

Limites de referência:
- Bundle inicial (sem lazy-loaded): < 200KB gzipped.
- CSS inicial: < 50KB gzipped.
- Nenhuma biblioteca de componentes incluída inteira — usar tree-shaking e import named.
- Charts e mapas: sempre lazy-loaded — nunca no bundle inicial.

Configurar `next.config.js` com bundle analyzer:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

Executar análise de bundle em cada PR que adiciona nova dependência significativa.

## Conclusão

A stack mais equilibrada para este produto é:

> TypeScript full-stack com strict mode para produto, PostgreSQL para verdade operacional, OpenTelemetry para observabilidade desde o início, BullMQ para mensageria no MVP e Python para IA analítica na fase 2.

Essa combinação permite velocidade agora e maturidade depois. As ADRs documentadas aqui evitam que decisões técnicas sejam tomadas novamente sem contexto a cada novo membro da equipe.
