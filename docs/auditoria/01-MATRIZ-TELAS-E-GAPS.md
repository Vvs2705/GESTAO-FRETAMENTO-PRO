# Matriz de Telas × Gaps (objetiva)

Legenda do **estado atual**: 🔴 stub (placeholder) · 🟠 mock (UI pronta, dados fixos no código) · 🟢 real (chama API).
Nenhuma tela está 🟢 hoje. "Endpoints disponíveis" = já existem na api-core, prontos para consumo.

| Rota | Linhas | Estado | Endpoints backend disponíveis | O que falta no front |
|---|---|---|---|---|
| `/executive` | 318 | 🟠 mock | `GET /v1/analytics/dashboards/executive`, `GET /v1/analytics/executive`, `GET /v1/finance/summary` | Trocar arrays fixos por dados reais (KPIs, gráficos, ranking, alertas) via React Query |
| `/operations` | 27 | 🟠 mock | `GET /v1/trips/today`, `GET /v1/trips/delayed`, `GET /v1/analytics/dashboards/operation` | KPIs e tabela do dia reais; auto-refresh |
| `/fleet` | 26 | 🟠 mock | `GET /v1/vehicles`, `GET /v1/analytics/dashboards/fleet` | Lista real + filtros + status |
| `/fuel` | 227 | 🟠 mock | `GET /v1/fuel-records`, `GET /v1/fuel-records/anomalies`, `GET /v1/fuel-records/stats`, `GET /v1/analytics/dashboards/fuel`, `POST /v1/fuel-records` | Dados reais + **formulário de lançamento de abastecimento** + lista de anomalias |
| `/trips` | 34 | 🟠 mock | `GET /v1/trips` (+ `today`/`delayed`), `PATCH /v1/trips/:id/status`, `DELETE /v1/trips/:id` | Lista real paginada, filtros, ações de status/cancelar |
| `/trips/new` | 83 | 🟠 **wizard falso** | `POST /v1/trips`, `GET /v1/clients`, `GET /v1/routes`, `GET /v1/vehicles`, `GET /v1/drivers`, `POST /v1/trips/:id/passengers` | **Criar viagem de verdade**; selects populados por API; alocação real de veículo/motorista; validação |
| `/vehicles` | 5 | 🔴 stub | `GET /v1/vehicles`, `POST /v1/vehicles`, `GET /v1/vehicles/:id`, `PATCH /v1/vehicles/:id`, `PATCH /v1/vehicles/:id/status` | **Tela inteira**: lista + **cadastrar veículo** + editar + mudar status + detalhe |
| `/drivers` | 5 | 🔴 stub | `GET/POST /v1/drivers`, `GET/PATCH/DELETE /v1/drivers/:id`, `GET /v1/drivers/:id/availability`, `GET /v1/drivers/:id/history` | **Tela inteira**: lista + cadastrar motorista (CNH, validade) + editar + histórico |
| `/clients` | 5 | 🔴 stub | `GET/POST /v1/clients`, `GET/PATCH/DELETE /v1/clients/:id`, `POST /v1/clients/:id/contracts`, `PATCH /v1/clients/:id/contracts/:cId`, `GET /v1/clients/:id/stats` | **Tela inteira**: lista + cadastrar cliente + contratos + estatísticas |
| `/occurrences` | 5 | 🔴 stub | `GET/POST /v1/occurrences`, `GET/PATCH /v1/occurrences/:id`, `PATCH /v1/occurrences/:id/status`, `.../resolve`, `.../escalate` | **Tela inteira**: lista + abrir ocorrência + resolver/escalar (com `actionTaken`) |
| `/finance` | 5 | 🔴 stub | `GET /v1/finance/summary`, `GET /v1/finance/revenue-by-client`, `GET /v1/finance/cost-by-vehicle`, `GET/POST/PATCH/DELETE /v1/finance/cost-centers` | **Tela inteira**: resumo + receita/custo + CRUD de centros de custo (restrito a `finance.read`) |
| `/users` | 5 | 🔴 stub | `GET/POST /v1/users`, `GET/PATCH /v1/users/:id`, `PATCH /v1/users/:id/status`, `GET /v1/roles`, `GET /v1/permissions` | **Tela inteira**: lista + **criar usuário** + editar + ativar/desativar + atribuir cargo |
| `/settings` | 5 | 🔴 stub | `GET/PATCH /v1/tenants/current`, `GET/POST /v1/tenants/branches`, `PATCH /v1/tenants/branches/:id`, `GET/POST/PATCH/DELETE /v1/roles`, `POST /v1/roles/:id/permissions` | **Tela inteira**: dados do tenant + filiais + cargos & permissões |
| `/documents` | 5 | 🔴 stub | **(nenhum — sem controller)** | Decidir: **construir backend de documentos** (upload, vencimentos) ou remover a página |
| `/notifications` | 5 | 🔴 stub | `GET /v1/notifications`, `GET /v1/notifications/unread-count`, `PATCH /v1/notifications/read-all`, `PATCH /v1/notifications/:id/read` | **Tela inteira**: lista + marcar lida/todas; ligar o sino do `TopBar` (hoje fixo) |
| `/maintenance` | 13 | 🟠 mock | `GET/POST /v1/maintenance`, `GET /v1/maintenance/preventive-due`, `GET/PATCH/DELETE /v1/maintenance/:id`, `PATCH /v1/maintenance/:id/complete`, `POST /v1/maintenance/:id/items` | Lista real + abrir OS + itens + concluir + preventivas vencidas |
| **(faltando)** `/routes` | — | ⛔ inexistente | `GET/POST /v1/routes`, `GET/PATCH/DELETE /v1/routes/:id`, `PATCH /v1/routes/:id/points` | **Criar a tela**: CRUD de rotas/itinerários com pontos (necessária para o wizard de viagem) |

## Domínios do backend SEM uso no front (capacidade ociosa)
- **Rotas** (`/v1/routes`) — CRUD completo, sem tela.
- **Auditoria** (`/v1/audit`) — trilha pronta, sem tela (sugestão: aba em Configurações).
- **Combustível avançado** — `fuel/stations`, `fuel/pumps`, `fuel/tanks`, `fuel/products`, `fuel/suppliers`, `fuel/deliveries`, `fuel/internal`, `fuel/external`, `fuel/incidents`, `fuel/reconciliation`, `fuel/attendants`: **toda a infraestrutura de abastecimento interno** existe na API e não tem nenhuma tela. Avaliar quais expor.

## Componentes prontos para montar tudo isso (reuso, não recriar)
`DataTable` (tabela + paginação), `FilterBar`/`SearchInput` (filtros), `DrawerPanel` (painel lateral de criação/edição), `ConfirmModal` (exclusão/ações destrutivas), `FormField` + `TextInput`/`NumberInput`/`SelectField`/`DatePickerField`/`FileUploadField`, `StatusBadge`, `KpiCard`, `LineChart`/`BarChart`/`RankingChart`, `Timeline`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `toast`.
