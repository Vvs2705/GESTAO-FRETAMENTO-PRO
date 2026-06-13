# PROGRESSO — Remediação de Auditoria UX / Acessibilidade

> Origem: auditoria de 09/06/2026 (`analise-sites/projetos/gestao-fretamento/`):
> `CORRECOES.md` (C1–C4), `DESIGN.md` (responsivo + tipografia), `MELHORIAS.md` (competitivo).
> Branch: `claude/zen-newton-ae4c86`. Atualizado a cada 10% de conclusão.

## Mapa de incrementos (10% cada)

| % | Incremento | Origem | Status |
|---|---|---|---|
| 10% | Root layout → Server Component + `Providers`; Metadata API (title template, description, robots noindex, viewport) | C1, C3 | ✅ |
| 20% | Títulos por rota: 18 `layout.tsx` de segmento com `metadata.title` (dashboard + auth) | C1 | ✅ |
| 30% | Componente `PageHeader` (h1 + subtítulo) no design system | C1 (h1) | ✅ |
| 40% | `<h1>` dinâmico por rota no layout do dashboard (cobre os 16 módulos via `page-meta.ts`) | C1 (h1) | ✅ |
| 50% | `Sidebar` → `<a href>` via `LinkComponent` injetável (semântica + Ctrl+clique), preserva estado ativo e drawer mobile | C4 | ✅ |
| 60% | Wire no `web-admin`: Next `<Link>` + `usePathname()`, remove `window.location.href` (full reload), Breadcrumb dinâmico por rota | C4, C2 | ✅ |
| 70% | `max-w-[1440px] mx-auto` no container (telas grandes/TV) | DESIGN | ✅ |
| 80% | Números tabulares/mono: token `--font-mono`, família `font-mono` no Tailwind, `tabular-nums` em `KpiCard` | DESIGN | ✅ |
| 90% | Validação: typecheck 13/13, lint 8/8, unit 10/10, build OK, E2E 4/4; roadmap competitivo (`docs/10-roadmap-competitivo.md`) | QA | ✅ |
| 100% | Commit + push + PR, CI verde, deploy | Entrega | ⏳ |

---

## 13/06/2026 — 20% — FASE A — Fundação de Metadados (C1, C3)

**Status:** Concluído ✅

**O que foi feito:**
- `apps/web-admin/src/lib/providers.tsx` (novo) — extrai `QueryClientProvider`, `AuthProvider`, `ToastProvider` e bootstrap do MSW para um Client Component dedicado, preservando o gate de inicialização do MSW em desenvolvimento.
- `apps/web-admin/src/app/layout.tsx` — convertido de Client para **Server Component**; agora exporta `metadata` (Next Metadata API): `title.template` = `"%s · Gestão Fretamento Pro"`, `default`, `description`, `applicationName`, `robots: noindex/nofollow`; e `viewport` com `themeColor`. Favicon servido por `app/icon.svg` (convenção de arquivo já existente) — resolve o 404 de recurso (C3).
- 18 `layout.tsx` de segmento (Server Components) com `metadata.title` por rota — toda aba do navegador passa a ter nome:
  - Dashboards: Cockpit Executivo, Torre Operacional, Frota, Abastecimento, Manutenção.
  - Operacional: Viagens (+ Nova Viagem), Veículos, Motoristas, Clientes, Ocorrências, Documentos.
  - Suporte: Financeiro, Usuários, Configurações, Notificações.
  - Auth: Acessar (login), Recuperar Senha.

**Decisão de arquitetura:** as páginas continuam Client Components (estado/interatividade pesados — wizards, tabelas). O título por rota é provido por um `layout.tsx` Server por segmento (padrão idiomático do App Router), sem necessidade de converter páginas.

**O que falta:** `<h1>` por página (C1), navegação semântica (C4), responsividade de telas grandes + tipografia tabular (DESIGN), validação e deploy.

---

## 13/06/2026 — 90% — FASES B/C/D — Acessibilidade, Navegação Semântica e Responsividade

**Status:** Concluído ✅ (resta apenas commit/deploy)

**O que foi feito:**
- **C1 (h1):** novo `PageHeader` (`packages/ui`) renderiza o **único `<h1>` da página**; `apps/web-admin/src/lib/page-meta.ts` é a fonte única de título/descrição/breadcrumb por rota; o `(dashboard)/layout.tsx` resolve a rota atual via `usePathname()` e renderiza `PageHeader` — todas as 16 telas passam a ter `<h1>` com o nome da seção (antes: **0 de 15**).
- **C4 (navegação semântica):** `Sidebar` e `Breadcrumb` agora renderizam **âncoras `<a href>`** via prop `LinkComponent` (padrão `"a"`); o `web-admin` injeta o `Link` do Next → Ctrl+clique / abrir em nova aba / histórico funcionam **mantendo o roteamento SPA**. Removido o `window.location.href` (que causava **reload de página inteira**) e o `window.location.pathname` não-reativo.
- **C2 (breadcrumb):** trilha dinâmica e correta por rota (antes: "Dashboard / Visão Geral" fixo em todas as telas).
- **DESIGN (telas grandes):** container `mx-auto w-full max-w-[1440px]` — cards deixam de esticar em 1920/TV. Drawer mobile (< lg) já presente e preservado.
- **DESIGN (tipografia):** token `--font-mono` (Geist Mono + fallback do sistema), família `font-mono` no Tailwind, `font-mono tabular-nums` nos números de KPI (`KpiCard`). Sparklines já existiam (`KpiTrend`).
- **MELHORIAS:** itens competitivos (GPS ao vivo, CT-e OS, escala, telemetria, app do motorista) registrados como backlog em `docs/10-roadmap-competitivo.md` — produto de maior porte, fora do escopo desta remediação de UX.

**Validação (equivalente ao CI):**
- `pnpm turbo typecheck` → **13/13** ✅
- `pnpm turbo lint` → **8/8** (web-admin limpo; api-core apenas warnings pré-existentes) ✅
- `pnpm turbo test` (unit) → **10/10** ✅
- `pnpm --filter web-admin build` → **23 páginas** geradas, `/icon.svg` servido (favicon, resolve C3) ✅
- `pnpm exec playwright test` (E2E) → **4/4** (login/logout, credenciais inválidas, guard de rota, wizard 8 etapas) ✅

**O que falta:** commit + push + PR → CI verde → deploy (frontend Vercel / api via pipeline).

---

> Arquivo atualizado automaticamente a cada checkpoint (10%).
