# EQUIPE ANTIGRAVITY — Frontend, Design System e Testes

## Identidade da equipe

Você é a equipe de frontend e qualidade do projeto **Gestão Fretamento Pro**.
Sua responsabilidade é construir tudo que o usuário vê e interage: design system, painel web (Next.js), dashboards, formulários, telas operacionais e a suite de testes de ponta a ponta.

A Equipe Claude constrói o backend em paralelo. Você consome os contratos dela via `openapi/v1/api.yaml` e os tipos compartilhados em `packages/types/`.

---

## Leitura obrigatória antes de escrever qualquer linha de código

Leia os arquivos nesta ordem. Não pule nenhum.

```
docs/00-manifesto-qualidade-produto.md      ← Princípios que guiam toda decisão
docs/01-decisao-stack-tecnologica.md        ← Stack oficial (Next.js, Tailwind, shadcn)
docs/03-dominios-modulos-negocio.md         ← Domínios: o que cada módulo resolve
docs/04-cargos-permissoes-dashboards.md     ← Cargos, dashboards por cargo, permissões
docs/05-ux-ui-design-system-dashboard.md   ← Design system, tokens, Core Web Vitals
docs/06-backend-api-integracoes-eventos.md  ← Padrão de API, erros, paginação
docs/07-dados-banco-analytics-bi.md         ← KPIs por área — o que cada dashboard deve mostrar
docs/10-qa-testes-release-qualidade.md      ← Testes E2E, acessibilidade, performance, contrato
```

---

## Regras de operação

- **Não pedir autorização** para continuar entre fases. Avançar automaticamente.
- **Não fazer commit, push ou deploy** até o sistema estar 100% concluído pela equipe.
- **Salvar progresso a cada 10%** — registrar no arquivo `PROGRESSO-ANTIGRAVITY.md` na raiz do projeto.
- **Trabalhar em paralelo com a Equipe Claude**: você não precisa do servidor rodando para desenvolver. Use MSW (Mock Service Worker) para simular as respostas da API nos testes e no desenvolvimento.
- **Quando o contrato OpenAPI estiver disponível** em `openapi/v1/api.yaml` (sinalizado pela Equipe Claude), gerar tipos automáticos com `openapi-typescript` e substituir os tipos manuais.
- **Se uma pasta já tiver conteúdo**, ler antes de criar — nunca sobrescrever trabalho existente.
- **TypeScript strict mode** obrigatório. Usar a config em `packages/tsconfig/base.json`.

---

## Estrutura de pastas sob sua responsabilidade

```
packages/
  ui/                ← Design system: tokens, componentes base, ícones — RESPONSABILIDADE CENTRAL

apps/
  web-admin/         ← Next.js App Router — painel operacional completo

tests/
  e2e/               ← Playwright: fluxos críticos do usuário
  performance/       ← Lighthouse CI e Web Vitals em campo
  contracts/         ← Pact consumer: contratos gerados pelos testes do frontend

scripts/
  seed/              ← Pode usar o seed do backend para popular dados de demonstração
```

---

## Fases de execução com checkpoints de 10%

### FASE 1 — Fundação do web-admin e packages/ui (0% → 10%)

**Checkpoint: 10%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

Leitura obrigatória: `docs/05-ux-ui-design-system-dashboard.md` seções Design System e Tokens.

**`packages/ui/`**

Estrutura de tokens em `src/tokens/`:
```
colors.css        ← primitivas (blue-500, red-500...) + semânticas (--color-primary)
typography.css    ← font-size, font-weight, line-height
spacing.css       ← --space-1 a --space-16
radius.css        ← --radius-sm, md, lg
shadows.css       ← sombras padronizadas
status.css        ← cores de status operacional (trip, vehicle, occurrence, document)
index.css         ← importa todos os tokens
```

Tokens de status obrigatórios:
```css
--status-trip-draft: #94A3B8;
--status-trip-confirmed: #3B82F6;
--status-trip-in-progress: #8B5CF6;
--status-trip-delayed: #F59E0B;
--status-trip-completed: #22C55E;
--status-trip-canceled: #6B7280;
--status-occurrence-open: #3B82F6;
--status-occurrence-critical: #EF4444;
--status-occurrence-resolved: #22C55E;
--status-vehicle-available: #22C55E;
--status-vehicle-in-maintenance: #F97316;
--status-vehicle-unavailable: #EF4444;
--status-document-valid: #22C55E;
--status-document-expiring: #F59E0B;
--status-document-expired: #EF4444;
```

Componentes base em `src/components/`:
- `StatusBadge.tsx` — badge com cor por status
- `KpiCard.tsx` — card de indicador com label, valor, tendência, status
- `AlertCard.tsx` — card de alerta com severidade
- `DataTable.tsx` — tabela avançada com TanStack Table, filtros, paginação cursor-based
- `FilterBar.tsx` — barra de filtros por período, tenant, filial
- `LoadingSkeleton.tsx` — skeleton genérico configurável
- `EmptyState.tsx` — estado vazio com mensagem contextual e ação sugerida
- `ErrorState.tsx` — estado de erro com retry e ID de correlação
- `ConfirmModal.tsx` — modal de confirmação para ações destrutivas
- `DrawerPanel.tsx` — painel lateral de detalhes
- `Timeline.tsx` — linha do tempo de eventos/histórico
- `CommandPalette.tsx` — busca global com Ctrl+K

**`apps/web-admin/`**

Bootstrap do projeto Next.js:
- `package.json` com dependências: Next.js 14+, React, TypeScript, Tailwind, shadcn/ui, TanStack Query, TanStack Table, Zustand, React Hook Form, Zod, Recharts, MSW
- `next.config.ts` — configuração de segurança, imagens, bundle analyzer
- `tailwind.config.ts` — importa tokens do `packages/ui`, define tema
- `src/styles/globals.css` — importa tokens e estilos globais
- `src/lib/query-client.ts` — TanStack Query client com retry e cache
- `src/lib/api.ts` — fetch client autenticado com interceptor de token e refresh
- `src/lib/msw.ts` — setup do MSW para desenvolvimento e testes
- `src/middleware.ts` — protege rotas autenticadas, redireciona para login

Critério de aceite:
- `pnpm dev` no web-admin abre sem erro no browser
- Design tokens carregam corretamente (inspecionar variáveis CSS no browser)
- MSW inicializa em desenvolvimento com handlers mock

---

### FASE 2 — Design System Completo e Storybook (10% → 20%)

**Checkpoint: 20%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**Completar `packages/ui/src/components/`:**

Componentes de formulário:
- `FormField.tsx` — campo com label, erro, hint, acessível
- `TextInput.tsx`, `NumberInput.tsx`, `TextareaField.tsx`
- `SelectField.tsx` — select acessível com busca
- `DatePickerField.tsx` — seletor de data e intervalo
- `FileUploadField.tsx` — upload com preview e validação de tipo/tamanho
- `SearchInput.tsx` — input de busca com debounce

Componentes de navegação:
- `Sidebar.tsx` — menu lateral colapsável com módulos por cargo
- `TopBar.tsx` — barra superior com tenant/filial selector, notificações, perfil
- `Breadcrumb.tsx`
- `TabNav.tsx` — abas de navegação

Componentes de feedback:
- `ToastProvider.tsx` + `toast.ts` — notificações toast acessíveis
- `ProgressBar.tsx`
- `Spinner.tsx`

Gráficos (via Recharts):
- `LineChart.tsx` — evolução temporal
- `BarChart.tsx` — comparativos
- `RankingChart.tsx` — ranking horizontal
- `KpiTrend.tsx` — sparkline de tendência

**Configurar Storybook 8:**
- `.storybook/main.ts` e `preview.ts`
- Stories para cada componente com variantes: Default, Loading, Empty, Error, Critical
- `@storybook/addon-a11y` ativo
- Stories docs com exemplos de uso

Critério de aceite:
- `pnpm storybook` abre com todos os componentes visíveis
- Nenhuma violação crítica de acessibilidade no addon axe do Storybook
- Componentes respondem a dark mode se aplicável

---

### FASE 3 — Autenticação e Layout Base (20% → 30%)

**Checkpoint: 30%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**Auth pages** em `apps/web-admin/src/app/(auth)/`:

`login/page.tsx`:
- Formulário: e-mail + senha com validação Zod
- Loading state durante submit
- Erro amigável para credenciais inválidas (sem enumerar se é e-mail ou senha)
- Redirect para `/` após login
- Acessível: labels, foco, navegação por teclado

`forgot-password/page.tsx`:
- Formulário de recuperação por e-mail
- Feedback de sucesso sem confirmar se e-mail existe

**MSW handlers** em `src/lib/msw/handlers/auth.ts`:
- `POST /v1/auth/login` — retorna tokens mockados
- `POST /v1/auth/refresh` — simula refresh
- `POST /v1/auth/logout` — simula logout

**Layout base** em `apps/web-admin/src/app/(dashboard)/layout.tsx`:
- Sidebar com módulos filtrados por cargo do usuário
- TopBar com seletor de filial, notificações (badge com contagem), perfil
- Área de conteúdo com padding e scroll correto
- Breadcrumb dinâmico por rota
- Gerenciamento de foco: ao navegar por teclado, foco vai para o h1 da nova página

**Contexto de autenticação** em `src/lib/auth-context.tsx`:
- Provider com usuário autenticado, permissões e tenant ativo
- Hook `useAuth()` retorna usuário, `can(action)`, `hasPerm(permission)`
- Guard de rota: redirect para login se não autenticado

Critério de aceite:
- Login funciona com MSW, redireciona para dashboard
- Sidebar mostra apenas módulos do cargo do usuário mock
- Logout limpa sessão e redireciona para login
- Navegação por teclado completa nas páginas de auth

---

### FASE 4 — Dashboards (30% → 45%)

**Checkpoint: 40%** — Registrar ao concluir executive + operations.
**Checkpoint: 45%** — Registrar ao concluir fleet + fuel + maintenance.

Leitura obrigatória: `docs/04-cargos-permissoes-dashboards.md` seções de cada cargo, `docs/05-ux-ui-design-system-dashboard.md` seção Dashboards Prioritários.

Para cada dashboard, criar:
- `page.tsx` — Server Component que busca dados
- `components/` — componentes locais do dashboard
- `hooks/use-[dashboard]-data.ts` — TanStack Query com refetch automático
- `msw/handlers/[dashboard].ts` — handlers MSW com dados realistas

**1. Cockpit Executivo** `(dashboard)/executive/page.tsx`

Blocos obrigatórios:
- **Hoje**: viagens em andamento, atrasos críticos, ocorrências graves, veículos parados, alertas urgentes
- **Mês**: receita estimada, custo operacional, combustível, manutenção, margem estimada
- **Clientes**: melhores clientes por receita, clientes com mais ocorrências, contratos em risco
- **Frota**: disponibilidade %, custo por veículo, consumo fora do padrão, manutenção crítica
- **Pessoas**: motoristas escalados, motoristas com ocorrências recorrentes, documentos vencendo
- **Risco**: documentos vencidos, ocorrências não tratadas, abastecimentos suspeitos

Comportamento:
- Refresh automático a cada 2 minutos
- Seletor de período (hoje, semana, mês, personalizado)
- Seletor de filial (se usuário tem acesso a múltiplas)
- Drill-down: clicar em um KPI vai para o módulo correspondente

**2. Torre Operacional** `(dashboard)/operations/page.tsx`

Blocos:
- Viagens do dia em lista/card com status colorido
- Mapa de viagens em andamento (placeholder inicial, MapLibre na fase 2)
- Atrasos e substituições pendentes
- Motoristas disponíveis vs escalados
- Ocorrências abertas hoje

**3. Frota** `(dashboard)/fleet/page.tsx`

Blocos:
- Cards de disponibilidade (disponível / em operação / manutenção / indisponível)
- Tabela de veículos com status, km rodado, próxima revisão
- Documentos vencendo (lista ordenada por urgência)
- Ranking de custo por veículo (últimos 30 dias)
- Gráfico de consumo médio por veículo

**4. Abastecimento** `(dashboard)/fuel/page.tsx`

Blocos:
- KPIs: litros totais, valor total, preço médio, km/l da frota
- Abastecimentos suspeitos (anomalias) em destaque vermelho
- Ranking de maior gasto por veículo e por motorista
- Gráfico de custo ao longo do tempo
- Abastecimentos sem comprovante

**5. Manutenção** `(dashboard)/maintenance/page.tsx`

Blocos:
- OS abertas com veículo, tipo, previsão de conclusão
- Preventivas vencidas
- Custo acumulado do mês
- Reincidências por veículo
- Veículos parados por manutenção

Critério de aceite:
- Todos os dashboards carregam com dados mock realistas
- Filtro de período funciona e atualiza todos os KPIs
- Drill-down do Cockpit Executivo navega para o módulo correto
- Skeleton loading aparece durante fetch
- Estado vazio com mensagem contextual quando não há dados
- Dashboard do CEO não é acessível para cargo Motorista (testar no MSW)

---

### FASE 5 — Módulos Operacionais (45% → 62%)

**Checkpoint: 55%** — Registrar ao concluir viagens + veículos + motoristas.
**Checkpoint: 62%** — Registrar ao concluir clientes + ocorrências + abastecimento + documentos.

Para cada módulo, criar estrutura padrão:
```
apps/web-admin/src/app/[módulo]/
  page.tsx            ← lista com tabela avançada + filtros
  [id]/page.tsx       ← detalhes com histórico, ações, auditoria
  [id]/edit/page.tsx  ← formulário de edição
  new/page.tsx        ← formulário de criação
  components/         ← componentes locais do módulo
  hooks/              ← queries e mutations TanStack Query
```

**`trips/` — Viagens:**
- Lista: tabela com status colorido, motorista, veículo, cliente, rota, horários, ações rápidas
- Filtros: data, status, cliente, motorista, veículo, filial
- Detalhe: timeline de status, motorista/veículo alocados, passageiros, ocorrências vinculadas, histórico
- Criação: wizard em 8 etapas (cliente → rota → data/hora → veículo → motorista → passageiros → observações → confirmação)
- Ação rápida: alterar status diretamente da lista (com confirmação)

**`vehicles/` — Veículos:**
- Lista com disponibilidade em tempo real, status, km atual
- Detalhe: histórico de viagens, documentos, manutenções, abastecimentos, custos
- Cadastro: wizard em 5 etapas (dados → documentos → capacidade → vínculos → status)
- Badge visual de alerta: documento vencido, manutenção pendente

**`drivers/` — Motoristas:**
- Lista com disponibilidade, ocorrências abertas, CNH status
- Detalhe: histórico de viagens, ocorrências, documentos, desempenho
- Cadastro: dados pessoais → cargo → documentos → disponibilidade

**`clients/` — Clientes:**
- Lista com contratos ativos, SLA status, receita
- Detalhe: contratos, rotas, histórico de viagens, ocorrências, indicadores
- Cadastro: dados → contato → contratos → SLA

**`occurrences/` — Ocorrências:**
- Lista com gravidade colorida, tipo, responsável, status
- Filtros: tipo, gravidade, status, período, viagem, veículo, motorista
- Detalhe: timeline de tratativa, anexos, ações tomadas, auditoria
- Criação: tipo → gravidade → vínculo → descrição → responsável → anexos
- Ação de escalação para crítico (com confirmação e step-up auth)

**`fuel/` — Abastecimento:**
- Lista com flag visual de anomalia e comprovante ausente
- Filtros: veículo, motorista, período, posto, anomalia
- Detalhe: todos os campos + foto do comprovante + histórico do veículo
- Criação: veículo → motorista → posto → combustível → litros → hodômetro → valor → comprovante
- Alert em destaque quando hodômetro é suspeito (menor que o anterior)

**`documents/` — Documentos:**
- Lista agrupada por entidade (veículo, motorista, empresa)
- Filtro por vencimento: vencidos, vencendo em 7/30/60 dias, válidos
- Detalhe: preview do arquivo (image/PDF), datas, responsável
- Upload: tipo → entidade → arquivo → vencimento → responsável

Critério de aceite:
- Wizard de criação de viagem completa o fluxo com dados mock
- Anomalia de abastecimento aparece em destaque visual
- Tabelas têm paginação cursor-based funcional
- Filtros persistem ao recarregar a página (URL state com nuqs)
- Formulários validam com Zod antes de submeter

---

### FASE 6 — Módulos de Suporte (62% → 72%)

**Checkpoint: 72%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**`maintenance/` — Manutenção:**
- Lista de OS com status, veículo, tipo (preventiva/corretiva), fornecedor, custo
- Detalhe: itens da OS, peças, pneus, custo total, histórico
- Criação: veículo → tipo → descrição → fornecedor → previsão

**`finance/` — Financeiro:**
- Visível apenas para cargos com permissão `finance.read`
- Contas a pagar e receber com status
- Margem por cliente e por rota
- Centro de custo com drill-down
- Exportação CSV/Excel controlada por permissão

**`users/` — Usuários:**
- Lista de usuários do tenant com cargo, filial, último acesso, status
- Detalhe: permissões efetivas, histórico de acessos, atividade recente
- Criação: dados → cargo → filial → revisão (permissões geradas automaticamente pelo cargo)
- Ação: ativar/desativar com auditoria

**`settings/` — Configurações:**
- Dados da empresa (tenant)
- Filiais cadastradas
- Cargos e permissões personalizadas
- Integrações (placeholder para fase 2)
- Notificações: configurar alertas por tipo de evento

**Notificações:**
- Sino na TopBar com badge de não-lidas
- Dropdown com lista das últimas 10 notificações
- Página `/notifications` com todas as notificações e filtros
- Marcar como lida ao clicar

Critério de aceite:
- Módulo financeiro não carrega para usuário com cargo Motorista (403 no MSW)
- Notificações aparecem e são marcadas como lidas
- Configurações salvam com feedback visual de sucesso

---

### FASE 7 — Polish, Acessibilidade e Responsividade (72% → 80%)

**Checkpoint: 80%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**Command Palette:**
- `Ctrl+K` / `Cmd+K` abre paleta de busca global
- Busca por: viagem (número), veículo (placa), motorista (nome), cliente (nome)
- Atalhos exibidos na paleta
- Acessível com teclado (Arrow Up/Down, Enter, Escape)

**Atalhos de teclado:**
- `Ctrl+N` cria novo registro no módulo atual
- `Escape` fecha qualquer modal/drawer aberto
- `?` exibe lista de atalhos

**Mobile Web:**
- Layout responsivo: sidebar vira bottom nav em mobile
- Telas simplificadas para motorista e abastecimento
- Touch targets mínimos de 44px

**Revisão de acessibilidade:**
- Executar axe-core em cada página manualmente
- Corrigir todos os erros WCAG 2.2 AA
- Verificar contraste de todas as combinações de cor nos tokens
- Validar navegação por teclado em todos os fluxos críticos

**Revisão de performance:**
- Executar Lighthouse CI em cada rota principal
- Verificar LCP < 2.5s, INP < 200ms, CLS < 0.1
- Lazy load de charts e mapas (não devem estar no bundle inicial)
- Verificar bundle size do JavaScript inicial < 200KB gzipped

**Error Boundaries:**
- `ErrorBoundary` em cada módulo com fallback de erro amigável
- `Suspense` em cada área assíncrona com skeleton correto
- Estado offline: aviso quando API não responde após 10s

Critério de aceite:
- Lighthouse Score > 90 em todas as rotas no Lighthouse CI
- Zero erros críticos axe-core em todas as páginas
- App funciona em resolução 320px (mobile pequeno) sem scroll horizontal

---

### FASE 8 — Testes E2E com Playwright (80% → 88%)

**Checkpoint: 88%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

Criar em `tests/e2e/` com Playwright:

**Fluxos críticos obrigatórios:**

`auth.spec.ts`:
- Login com credenciais válidas → redireciona para dashboard
- Login com credenciais inválidas → mensagem de erro, sem enumerar campo
- Sessão expira → redirect automático para login
- Logout → limpa sessão, redirect para login

`trip-lifecycle.spec.ts`:
- Criação de viagem completa (wizard 8 etapas) → aparece na lista
- Alteração de status: CONFIRMED → IN_PROGRESS → COMPLETED
- Tentativa de criar viagem com veículo em manutenção → erro claro

`fuel-record.spec.ts`:
- Lançamento de abastecimento com comprovante
- Anomalia detectada → aparece com destaque no dashboard de abastecimento
- Tentativa de hodômetro menor → erro de validação

`occurrence-lifecycle.spec.ts`:
- Criação de ocorrência
- Escalação para crítico → confirmação exigida
- Resolução com ação tomada

`permission-enforcement.spec.ts`:
- Motorista tenta acessar `/finance` → redirect ou 403 visível
- Operador tenta alterar permissão → ação bloqueada
- Usuário do tenant A não vê dados do tenant B

`dashboard-executive.spec.ts`:
- Cockpit carrega com todos os blocos visíveis
- Filtro de período atualiza os KPIs
- Drill-down de "Ocorrências críticas" navega para o módulo correto

`accessibility.spec.ts`:
- Verificar axe-core em cada página crítica:
  `login, executive, operations, trips, vehicles, occurrences, fuel`

Critério de aceite:
- Todos os testes E2E passam com MSW simulando o backend
- Nenhuma violação crítica de acessibilidade detectada
- Fluxo de criação de viagem completa sem erro

---

### FASE 9 — Testes de Contrato e Performance (88% → 95%)

**Checkpoint: 95%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**Testes de Contrato** em `tests/contracts/`:

Ao usar MSW, cada handler que simula a API é um contrato implícito. Gerar os arquivos Pact a partir dos testes:

`consumer/auth.pact.ts` — contratos de auth
`consumer/trips.pact.ts` — contratos de viagens
`consumer/fuel.pact.ts` — contratos de abastecimento
`consumer/dashboards.pact.ts` — contratos de dashboards

Publicar arquivos `.json` dos contratos Pact em `tests/contracts/pacts/`. Notificar a Equipe Claude para rodar a verificação provider-side.

**Performance com Lighthouse CI:**

`.lighthouserc.json` na raiz com thresholds:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

Integrar Lighthouse CI no `.github/workflows/ci.yml` (coordenar com Equipe Claude):
- Rodar em staging após cada deploy
- Falhar o pipeline se score < 90

Critério de aceite:
- Arquivos Pact gerados e disponíveis em `tests/contracts/pacts/`
- Lighthouse CI passa em todas as rotas críticas
- Core Web Vitals dentro dos targets

---

### FASE 10 — Integração com API Real e Polish Final (95% → 100%)

**Checkpoint: 100%** — Registrar em `PROGRESSO-ANTIGRAVITY.md` quando concluir.

**Quando a Equipe Claude sinalizar que o contrato `openapi/v1/api.yaml` está pronto:**

1. Rodar `npx openapi-typescript openapi/v1/api.yaml -o packages/types/src/api.generated.ts`
2. Substituir os tipos manuais pelos gerados automaticamente
3. Atualizar os MSW handlers para bater 100% com o schema gerado
4. Validar os handlers com `msw-auto-mock` ou similar

**Substituir MSW pela API real (ambiente staging):**
- Desativar MSW no env de staging
- Verificar que todos os fluxos funcionam com o backend real
- Ajustar qualquer discrepância entre mock e API real

**Checklist final de qualidade:**

- [ ] `pnpm turbo build` compila sem erro
- [ ] `pnpm turbo test` passa em todos os testes (unit + E2E)
- [ ] Lighthouse CI passa em todas as rotas (score > 90)
- [ ] Zero erros axe-core WCAG 2.2 AA em todas as páginas
- [ ] Nenhum `any` não justificado no código TypeScript
- [ ] Nenhum `console.log` em código de produção
- [ ] Todas as imagens têm `alt` text
- [ ] Todos os links têm texto descritivo (não "clique aqui")
- [ ] Loading, empty e error states em todos os módulos
- [ ] Command Palette funciona com teclado
- [ ] App funciona em mobile web (320px, 375px, 768px)
- [ ] Dark mode consistente se implementado
- [ ] Storybook atualizado com todos os componentes finais

---

## Registro de progresso

A cada checkpoint, atualizar o arquivo `PROGRESSO-ANTIGRAVITY.md` na raiz com:

```markdown
## [DATA] - [PORCENTAGEM]% — [NOME DA FASE]

**Status:** Concluído ✅ | Em andamento 🔄 | Bloqueado ⛔

**O que foi feito:**
- [lista do que foi criado/implementado]

**Testes passando:**
- [lista de testes que validam o checkpoint]

**Dependências da Equipe Claude:**
- [ex.: aguardando openapi/v1/api.yaml para gerar tipos]

**Sinalizações para a Equipe Claude:**
- [ex.: contratos Pact disponíveis em tests/contracts/pacts/]
```

---

## Sinalizar no chat se precisar de novos agentes

Caso encontre situações que demandem expertise específica não coberta, sinalizar no chat com:
- **Qual agente falta**
- **Por que é necessário**
- **Qual tarefa está bloqueada sem ele**
