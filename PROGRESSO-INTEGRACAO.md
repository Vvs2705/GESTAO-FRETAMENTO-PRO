# PROGRESSO — Integração Front ↔ API (execução do backlog da auditoria)

> Base: `docs/auditoria/02-BACKLOG-CORRECOES.md`. Padrão: `docs/auditoria/03-PLAYBOOK-INTEGRACAO.md`.
> Branch: `claude/zen-newton-ae4c86`. Cada incremento passa por typecheck + lint + build antes do commit.

## Estado por GAP

| GAP | Item | Status |
|---|---|---|
| GAP-010 | Hooks de dados (`lib/hooks/crud.ts`: useList/useEntity/useSave/useRemove/useApiAction) | ✅ |
| GAP-020 | Veículos — CRUD real + status + RBAC | ✅ |
| GAP-021 | Motoristas — CRUD real (CNH/categoria/validade/disponibilidade) | ✅ |
| GAP-022 | Clientes — CRUD real (documento/contato/endereço) | ✅ |
| GAP-023 | Usuários — criar/editar + status + cargo via `/roles` | ✅ |
| GAP-011 | Estados loading/empty/error padronizados | ✅ (via DataTable + ErrorState no padrão) |
| GAP-012 | Botões respeitam RBAC (`can()`) | ✅ (aplicado nas telas feitas) |
| GAP-001/002/003 | Infra: `NEXT_PUBLIC_API_URL` (Vercel), api-core pública + CORS, MSW dev-only | ⏳ pendente (config/infra) |
| GAP-030 | Wizard de viagem cria de verdade (`POST /v1/trips`) | ⏳ |
| GAP-031 | Viagens — lista real + ações de status | ⏳ |
| GAP-032 | Torre Operacional real (`trips/today|delayed`) | ⏳ |
| GAP-033 | Ocorrências — CRUD + resolver/escalar | ⏳ |
| GAP-034 | Rotas — criar a tela (CRUD + pontos) | ⏳ |
| GAP-040 | Cockpit Executivo real (analytics) | ⏳ |
| GAP-041 | Frota real | ⏳ |
| GAP-042 | Abastecimento real + lançamento | ⏳ |
| GAP-043 | Financeiro real + centros de custo | ⏳ |
| GAP-050 | Notificações reais + sino do TopBar | ⏳ |
| GAP-051 | Manutenção real | ⏳ |
| GAP-052 | Configurações reais (tenant/filiais/cargos) | ⏳ |
| GAP-053 | Documents — decidir (sem backend) | ⏳ |
| GAP-054 | Auditoria (UI opcional) | ⏳ |

## Checkpoints

### 14/06/2026 — Fundação + Cadastros core (EPIC 1 + EPIC 2)
**Status:** Concluído ✅ — commits `0c872fe` (hooks + Veículos), `f33a4bf` (Motoristas/Clientes/Usuários).

**O que foi feito:**
- `lib/hooks/crud.ts` — camada de dados sobre `request()` + React Query (contrato real `CursorPage<T>`; invalidation; toast com a `message` do backend).
- **4 telas que eram stubs viraram CRUD real** ligado à API: Veículos, Motoristas, Clientes, Usuários — com listar/criar/editar/excluir (ou status), `DrawerPanel` de formulário, `ConfirmModal` para exclusão, estados de loading/empty/error e botões protegidos por permissão (`can()`).
- Resolve as queixas diretas do cliente: **criar usuário** e **cadastrar veículos** agora funcionam de ponta a ponta.

**Validação:** typecheck (web-admin) ✅ · lint ✅ · build ✅ (vehicles 4.6kB, drivers 4.0kB, clients 3.9kB, users 4.0kB — antes 5 linhas cada).

**O que falta:** EPIC 0 (infra/config de produção) e EPICs 3–5 (operação, dashboards, suporte) — ver tabela acima. As telas restantes seguem o **mesmo padrão** já provado (replicação).

> ⚠️ Importante: para as telas funcionarem em produção, **GAP-001/002** (EPIC 0) são pré-requisito — sem `NEXT_PUBLIC_API_URL` e api-core pública com CORS, o front não alcança a API.
