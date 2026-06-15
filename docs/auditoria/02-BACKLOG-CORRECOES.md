# Backlog de Correções (priorizado)

Tarefas numeradas `GAP-XXX`. Cada uma tem **Problema**, **Endpoint(s)**, **Aceite** (critério testável).
Prioridade: 🔴 bloqueador · 🟠 alto · 🟡 médio. Sugestão de ordem = ordem das épicas.

---

## EPIC 0 — Infra & Configuração (🔴 fazer primeiro, sem isso nada funciona em produção)

**GAP-001 🔴 — Definir `NEXT_PUBLIC_API_URL` na Vercel**
- Problema: fallback `http://localhost:3000/v1` → produção quebra.
- Aceite: variável setada nos 3 ambientes (prod/preview/dev) apontando para a api-core publicada; `lib/api.ts` e `auth-context.tsx` passam a usar a URL real; login funciona em `https://gestao-fretamento-web.vercel.app`.

**GAP-002 🔴 — Publicar api-core acessível + CORS**
- Problema: o front precisa de uma API pública; CORS precisa liberar o domínio Vercel.
- Endpoint: `GET /v1/health` deve responder do domínio público.
- Aceite: `curl https://<api>/v1/health` = 200; chamada do browser na Vercel não é bloqueada por CORS (`CORS_ORIGINS` inclui o domínio da Vercel).

**GAP-003 🟠 — Estratégia de mocks em desenvolvimento**
- Problema: MSW só mocka auth e roda só em dev; ao ligar as telas, dev precisa da API real ou de mocks ampliados.
- Aceite: documentado no README como rodar dev com a api-core local (`docker compose up` + `node apps/api-core/dist/main.js`) **ou** mocks MSW ampliados para os endpoints de dados. Garantir que MSW **nunca** suba em produção (já gated, manter).

---

## EPIC 1 — Camada de dados base (🔴 habilita todas as telas)

**GAP-010 🔴 — Hooks React Query sobre `lib/api.ts`**
- Problema: `request()` existe mas ninguém usa; falta um padrão de hooks.
- Aceite: criar `src/lib/hooks/` com helpers genéricos (`useList`, `useEntity`, `useCreate`, `useUpdate`, `useRemove`) que encapsulam `request()` + `queryKey` + invalidation + toast de erro (ver [03-PLAYBOOK-INTEGRACAO.md](03-PLAYBOOK-INTEGRACAO.md)). 1 módulo de referência (veículos) implementado com eles.

**GAP-011 🟠 — Tratamento global de estados**
- Aceite: todo consumo de lista usa `LoadingSkeleton`, `EmptyState` e `ErrorState`; erros 401 já redirecionam (via `api.ts`); erros de negócio mostram `toast` com a `message` do backend.

**GAP-012 🟠 — Botões/ações respeitam RBAC**
- Problema: hoje o menu filtra por cargo, mas não há ações para proteger.
- Aceite: botões "Criar/Editar/Excluir" só aparecem se `can('<perm>')` (ex.: `vehicle.create`). Usar o `can()` do `auth-context`.

---

## EPIC 2 — Cadastros core (🔴 reclamações diretas do cliente: "criar usuário, cadastrar veículo")

**GAP-020 🔴 — Veículos: tela completa**
- Endpoint: `GET/POST /v1/vehicles`, `GET/PATCH /v1/vehicles/:id`, `PATCH /v1/vehicles/:id/status`.
- Aceite: lista real paginada/filtrável; botão **"Cadastrar veículo"** abre `DrawerPanel` com formulário (placa validada, modelo, ano, etc.) → `POST` → tabela atualiza; editar via `PATCH`; mudar status; estado vazio/erro tratados.

**GAP-021 🔴 — Motoristas: tela completa**
- Endpoint: `GET/POST /v1/drivers`, `GET/PATCH/DELETE /v1/drivers/:id`, `GET /v1/drivers/:id/availability`, `GET /v1/drivers/:id/history`.
- Aceite: lista + **"Novo motorista"** (CNH, categoria, validade) → `POST`; editar; ver disponibilidade e histórico de viagens; bloquear cadastro com CNH vencida (validação do backend deve ser exibida).

**GAP-022 🔴 — Clientes: tela completa + contratos**
- Endpoint: `GET/POST /v1/clients`, `GET/PATCH/DELETE /v1/clients/:id`, `POST /v1/clients/:id/contracts`, `PATCH /v1/clients/:id/contracts/:cId`, `GET /v1/clients/:id/stats`.
- Aceite: lista + cadastrar cliente; aba de contratos (criar/editar); painel de estatísticas (viagens, receita).

**GAP-023 🔴 — Usuários: tela completa (criar usuário)**
- Endpoint: `GET/POST /v1/users`, `GET/PATCH /v1/users/:id`, `PATCH /v1/users/:id/status`, `GET /v1/roles`.
- Aceite: lista de usuários; botão **"Criar usuário"** (nome, e-mail, cargo via `GET /v1/roles`, senha inicial) → `POST /v1/users`; editar; ativar/desativar (`PATCH :id/status`). Restrito a quem tem `user.manage`/`role.manage`.

---

## EPIC 3 — Operação (🔴/🟠)

**GAP-030 🔴 — Wizard de viagem: criar de verdade**
- Problema: wizard atual é simulação; passos 3–8 são texto; não chama `POST /v1/trips`.
- Endpoint: `POST /v1/trips`; selects via `GET /v1/clients`, `GET /v1/routes`, `GET /v1/vehicles`, `GET /v1/drivers`; `POST /v1/trips/:id/passengers`.
- Aceite: cada passo coleta dados reais; selects populados por API; ao concluir, cria a viagem (`POST`) e trata 409 (concorrência) e 400 (veículo/motorista indisponível) com mensagem do backend; redireciona para a viagem criada.

**GAP-031 🟠 — Viagens: lista real + ações**
- Endpoint: `GET /v1/trips` (+`today`/`delayed`), `PATCH /v1/trips/:id/status`, `DELETE /v1/trips/:id`.
- Aceite: tabela real com paginação/filtros; ações de mudar status (confirmar/iniciar/concluir/atrasar/cancelar) e cancelar; sem dados fixos.

**GAP-032 🟠 — Torre Operacional real**
- Endpoint: `GET /v1/trips/today`, `GET /v1/trips/delayed`, `GET /v1/analytics/dashboards/operation`.
- Aceite: KPIs e tabela do dia vindos da API; atualização periódica (refetch).

**GAP-033 🟠 — Ocorrências: tela completa**
- Endpoint: `GET/POST /v1/occurrences`, `GET/PATCH /v1/occurrences/:id`, `PATCH .../status|resolve|escalate`.
- Aceite: lista + abrir ocorrência (severidade) + resolver (exige `actionTaken`) + escalar; CRITICAL destacado.

**GAP-034 🟠 — Rotas: criar a tela (não existe)**
- Endpoint: `GET/POST /v1/routes`, `GET/PATCH/DELETE /v1/routes/:id`, `PATCH /v1/routes/:id/points`.
- Aceite: nova rota no menu + página CRUD de rotas com edição de pontos do itinerário; consumida pelo wizard (GAP-030).

---

## EPIC 4 — Dashboards reais (🟠)

**GAP-040 🟠 — Cockpit Executivo real** — `GET /v1/analytics/dashboards/executive`, `GET /v1/finance/summary`. Aceite: KPIs/gráficos/ranking/alertas vindos da API; remover arrays fixos.

**GAP-041 🟠 — Frota real** — `GET /v1/vehicles`, `GET /v1/analytics/dashboards/fleet`. Aceite: indicadores e lista reais.

**GAP-042 🟠 — Abastecimento real + lançamento** — `GET /v1/fuel-records|anomalies|stats`, `GET /v1/analytics/dashboards/fuel`, `POST /v1/fuel-records`. Aceite: dados reais + formulário de lançamento (valida hodômetro não-decremental — erro do backend exibido) + lista de anomalias.

**GAP-043 🟡 — Financeiro real** — `GET /v1/finance/summary|revenue-by-client|cost-by-vehicle`, CRUD `/v1/finance/cost-centers`. Aceite: visão financeira real + CRUD de centros de custo; restrito a `finance.read`.

---

## EPIC 5 — Suporte (🟡)

**GAP-050 🟠 — Notificações reais + sino do TopBar** — `GET /v1/notifications`, `unread-count`, `read-all`, `:id/read`. Aceite: lista real; o sino do `TopBar` (hoje array fixo) consome `unread-count` e marca como lida.

**GAP-051 🟡 — Manutenção real** — `GET/POST /v1/maintenance`, `preventive-due`, `:id/complete`, `:id/items`. Aceite: lista de OS + abrir/concluir + itens + preventivas vencidas.

**GAP-052 🟡 — Configurações reais** — `GET/PATCH /v1/tenants/current`, branches CRUD, roles + `POST /v1/roles/:id/permissions`. Aceite: dados do tenant, filiais e gestão de cargos/permissões.

**GAP-053 🟡 — Documents: decidir rumo** — sem backend. Aceite: decisão registrada — (a) construir módulo de documentos (entidade `Document` já existe no schema Prisma; falta controller/serviço + upload/vencimentos) **ou** (b) remover a rota/menu até existir backend.

**GAP-054 🟡 — Auditoria (opcional)** — `GET /v1/audit`. Aceite: aba em Configurações exibindo a trilha (somente leitura).

---

## Resumo por prioridade
- 🔴 **Bloqueadores (9):** GAP-001, 002, 010, 020, 021, 022, 023, 030.
- 🟠 **Alto (10):** GAP-003, 011, 012, 031, 032, 033, 034, 040, 041, 042, 050.
- 🟡 **Médio (6):** GAP-043, 051, 052, 053, 054.

> Sugestão de sequência: EPIC 0 → EPIC 1 → EPIC 2 (cadastros, resolve as queixas diretas) → EPIC 3 → EPIC 4 → EPIC 5. Cada GAP de tela deve seguir o padrão único do **Playbook** para consistência.
