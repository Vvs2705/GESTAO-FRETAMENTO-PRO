# AJUSTES DE DESIGN — Gestão Fretamento Pro

> Fonte: DESIGN.md (raiz deste repo) + análise compass de 01/07/2026. Objetivo: sair do visual "feito com IA" adotando a fundação shadcn + tokens da V-STACK.

## 1. Estado real do frontend (VERIFICADO neste repo)

- **Arquitetura:** monorepo **pnpm + Turborepo** (`turbo.json`, `pnpm-workspace.yaml` → `apps/*` + `packages/*`). Node >= 22, pnpm 11.4.
- **Frontend:** `apps/web-admin` — **Next.js 14.2 (App Router)**, **React 18.3**, **TypeScript 5.4**. Não é Vite/CRA. Rotas: `(auth)` + `(dashboard)` com ~18 páginas densas (executive, operations, fleet, fuel, finance, trips, maintenance, drivers, vehicles, clients, documents, occurrences, users, settings, notifications).
- **Tailwind:** **v3.4.3** (CONFIRMADO — NÃO é Tailwind 4). `tailwind.config.ts` mapeia cores para `var(--color-*)`, raios para `var(--radius-*)`, `fontFamily.sans → var(--font-sans)`, spacing → `var(--space-*)`. `darkMode: "class"`.
- **shadcn/ui:** **NÃO existe.** Não há `components.json`, nem `class-variance-authority`/`@radix-ui` no `web-admin` (só no `packages/ui`), nem estrutura `components/ui`. A fundação é um **design system PRÓPRIO** hand-rolled.
- **Design system local:** `packages/ui` (`@gestao-fretamento-pro/ui`) — **maduro e token-driven**: `src/tokens/*.css` (colors, typography, radius, shadows, spacing, status), `class-variance-authority`, `@radix-ui/react-dialog` + `react-slot`, util `cn()` (clsx + tailwind-merge), **Storybook 8** + addon-a11y. ~40 componentes: `DataTable` (TanStack Table), `KpiCard`, `LineChart`/`BarChart`/`RankingChart` (**Recharts**), `Sidebar`, `TopBar`, `CommandPalette`, `StatusBadge`, `FuelStockGauge`, `Timeline`, formulários. Consumido via `workspace:*`.
- **Fonte em uso:** **Inter** — literalmente definida em `packages/ui/src/tokens/typography.css` (`--font-sans: 'Inter', ...`). **É exatamente a fonte proibida pelo DESIGN.md como headline (o "AI slop" estatístico).** NÃO há Syne, Geist nem JetBrains Mono no repo.
- **Tokens / globals.css:** existem e são bem organizados. `apps/web-admin/src/styles/globals.css` importa `@gestao-fretamento-pro/ui/tokens` e roda `@tailwind base/components/utilities`. Ou seja, **a infraestrutura de tokens já está pronta** — só está apontando para a marca errada.
- **Ícones:** `lucide-react` (alinhado ao DESIGN.md). **Motion:** `framer-motion` **NÃO instalado** (só citado no DESIGN.md). Dados: `@tanstack/react-query` + `@tanstack/react-table` + `react-hook-form` + `zod` + `zustand`.

### O que confirmei vs. o que não consegui confirmar
- **Confirmado:** stack, versões, ausência de shadcn, presença de DS local token-driven, fonte Inter, marca azul, 64 ocorrências de "AI slop" (`text-slate-*`, `bg-[#hex]`, `shadow-lg`, `shadow-xl`, `rounded-2xl`) em 17 páginas do `web-admin` + literais de cor (`slate-*`, `red-500`, `green-500`, `amber-500`, `blue-500`, `#hex`) em **33 de ~40** componentes do `packages/ui`.
- **Não confirmado (fora de escopo desta auditoria):** se o build/lint/typecheck passam hoje (não executei); se a decisão NestJS×FastAPI já foi tomada (o core em `apps/api-core` é NestJS, divergente dos demais repos FastAPI); estado real de dark/light em runtime.

### DIVERGÊNCIA vs. a análise compass
A compass sugere "adotar shadcn + Magic UI". O repo **já tem uma fundação de DS própria, madura e organizada por tokens** — não é boilerplate de IA. Portanto o trabalho **não é criar do zero**, é **RE-BRANDING**: apontar os tokens existentes para a marca V-STACK e parar de vazar literais Tailwind nos componentes. Migrar tudo para shadcn seria reescrever um DS que já funciona; o caminho de menor risco é **remapear tokens + consumir o registry compartilhado para primitivos novos**, mantendo os componentes densos (DataTable/KpiCard/charts) que já existem.

## 2. Gap vs. DESIGN.md

| Dimensão | DESIGN.md (V-STACK) | Estado real | Gap |
|---|---|---|---|
| **Cor primária** | Laranja `#e05e18` (dark `#f07028`) | **Azul `#1D4ED8`** (`--color-primary`) | Marca inteira errada — é o item nº 1 |
| **Fonte display** | **Syne** (títulos) | Nenhuma (usa Inter em tudo) | Falta o trio inteiro |
| **Fonte corpo** | **Geist** | **Inter** (proibida) | Trocar `--font-sans` |
| **Fonte mono** | **JetBrains Mono** | Nenhuma (usa `font-mono` default) | Adicionar |
| **Tokens de superfície** | `--bg / --bg-deep / --bg-card` | `--color-background/card` (azul-petróleo `#102A43`) | Renomear/realinhar valores |
| **Hierarquia de texto** | `--text-1/2/3` | `--color-text-primary/secondary/muted` | Realinhar nomes + valores |
| **Raio** | 8 / 12 / **18 (card)** / **28 (panel)** | 2/4/8/12/16/24 (genérico, sem card/panel) | Adicionar `--radius-card`/`--radius-panel` |
| **Sombra** | `--shadow-sm/base/**glow** (laranja)` | `rgba(0,0,0,…)` genérico + falta glow | Substituir por sombras da marca |
| **Fundação** | shadcn/ui (`base-nova`, `cssVariables`, lucide) | DS próprio (CVA + radix + lucide) | Não migrar tudo; **consumir registry** para primitivos novos |
| **Registry compartilhado** | `npx shadcn add @vstack/*` (mesmo laranja em todo lugar) | Ausente | Conectar ao registry do vstack-site (ou espelhar em `packages/ui`) |
| **Literais de cor** | Zero (regra de ouro) | `slate-*`, `red-500`, `#hex`, `shadow-lg` em 33 componentes + 17 páginas | Refatorar para tokens semânticos |
| **Motion** | framer-motion + `MotionConfig reducedMotion="user"` | Não instalado | Opcional (produto sóbrio — pouco movimento) |

## 3. Ajustes priorizados

| Prio | Ação | Arquivos / áreas | Por quê |
|---|---|---|---|
| **P0** | **Re-brand dos tokens de cor**: trocar `--color-primary` azul `#1D4ED8` → laranja `--accent #e05e18` (dark `#f07028`), `--color-ring` para o accent, e alinhar superfícies/texto aos valores do DESIGN.md. | `packages/ui/src/tokens/colors.css` | Sem isso, o produto renderiza uma marca diferente da V-STACK — quebra o objetivo "mesmo laranja em todo lugar". |
| **P0** | **Trocar a fonte**: `--font-sans: 'Inter'` → **Geist** (corpo); adicionar **Syne** (display, via `.font-display`/`var(--font-syne)`) e **JetBrains Mono** (`.font-mono`). Carregar via `next/font` no `apps/web-admin/src/app/layout.tsx`. | `packages/ui/src/tokens/typography.css`, `apps/web-admin/src/app/layout.tsx` | Inter é o marcador nº 1 de "AI slop" e é explicitamente proibida como headline. |
| **P0** | **Matar literais no layout raiz**: `bg-[#0B1220]`, `text-slate-400/500` no fallback do `layout.tsx` → `bg-bg-deep`/`text-3`. | `apps/web-admin/src/app/layout.tsx` (linhas 24-30) | Cor literal viola a regra de ouro logo na primeira tela. |
| **P1** | **Refatorar literais nos componentes do DS**: substituir `slate-*`, `red-500`, `green-500`, `amber-500`, `blue-500`, `bg-[#hex]` por tokens semânticos (`text-2`, `border`, `card`, `success`, `danger`, `warning`). Começar por `KpiCard`, `Sidebar`, `TopBar`, `DataTable`, `StatusBadge`. | `packages/ui/src/components/*` (**33 arquivos**) | Componentes vazam cor literal apesar de os tokens existirem — o valor do DS se perde. |
| **P1** | **Refatorar literais nas páginas**: `text-slate-*`, `bg-[#0B1220]`, `rounded-2xl`, `shadow-lg/xl` nas 17 páginas do dashboard. Prioridade: `executive` (23 ocorrências), `fuel` (14), `login` (9). | `apps/web-admin/src/app/(dashboard)/**`, `(auth)/login` | Consistência visual + tirar o "cara de template". |
| **P1** | **Adicionar raios/sombras da marca**: `--radius-card: 18px`, `--radius-panel: 28px`; sombras `--shadow-sm/base/glow` (glow laranja em CTA primário). | `packages/ui/src/tokens/radius.css`, `shadows.css` | Faltam os raios/sombras que dão a "cara V-STACK" em cards e painéis. |
| **P2** | **Conectar ao registry compartilhado**: adicionar `components.json` no `web-admin` apontando para o registry `@vstack/*` (vstack-site) para instalar **primitivos novos** via `npx shadcn add @vstack/...`; ou espelhar o registry em `packages/ui`. **Não reescrever** o DS existente. | `apps/web-admin/components.json` (novo), `packages/ui` | Garante que o laranja/primitivos sejam idênticos aos outros repos, sem duplicar trabalho. |
| **P2** | **Tema dos charts por CSS var**: garantir que `LineChart`/`BarChart`/`RankingChart` (Recharts) leiam `--accent`/`--text-2`/`--border`, sem hex hardcoded. | `packages/ui/src/components/*Chart.tsx`, `RankingChart.tsx` | Dashboard denso → gráficos precisam seguir o token, não hex fixo. |
| **P2** | **(Opcional) Motion mínimo**: se houver microinterações, instalar `framer-motion` e envolver com `<MotionConfig reducedMotion="user">`. Produto sóbrio → dose baixa. | `apps/web-admin/src/app/layout.tsx` | Alinha ao DESIGN.md, mas é secundário para ERP operacional. |

## 4. Ferramentas e dosagem

Espectro deste produto: **Sóbrio / operacional (dashboard denso)** → credibilidade > eye-candy. Regra do DESIGN.md: **nunca Reactbits em ERP/operacional**.

- **shadcn/ui (sempre):** fundação/tokens. Aqui o papel é **fornecer primitivos novos via registry compartilhado `@vstack/*`** e servir de referência de mapeamento de tokens — **não** substituir o `packages/ui` já existente. Consumir só o que faltar (ex.: `dialog`, `dropdown`, `command`, `tabs` padronizados).
- **Magic UI (dose baixa/pontual):** faz sentido para **números animados** (KpiCard com count-up) e talvez **bento** na tela `executive`. Nada de marquee/beam decorativo. Máximo 1 acento por tela.
- **21st.dev:** **não** — são blocos de marketing/e-commerce (hero, pricing). Este é um app interno logado; sem uso.
- **Reactbits:** **PROIBIDO** aqui (produto operacional/ERP). Não usar Aurora/Ballpit/statement pieces.
- **Recharts (já presente):** manter — é o motor de gráficos correto para dashboard denso. Tematizar 100% por CSS var (`--accent`, `--text-2`, `--border`), zero hex.
- **framer-motion:** opcional e mínimo; sempre com `MotionConfig reducedMotion="user"`.

## 5. Fase do rollout + gatilho de avanço

**Fase 3 — decidir a stack ANTES de investir pesado em UI.**

- **Bloqueio de arquitetura:** o core está em **NestJS** (`apps/api-core`), divergente do FastAPI dos demais repos V-STACK. **Gatilho para avançar em UI:** o AGENTE ENTERPRISE ARCHITECT decidir formalmente **NestJS × FastAPI** e o modelo de **`packages/ui` local × registry compartilhado**. Enquanto isso não fecha, limitar o trabalho de design a **P0 (re-brand de tokens + fonte)**, que é seguro e reversível.
- **Ordem segura:** P0 (tokens+fonte, isolados em `packages/ui`) → validar visual em 2-3 telas → P1 (limpar literais em componentes e páginas) → P2 (registry + charts + motion).
- **Avançar de fase quando:** (1) decisão de stack registrada; (2) tokens já em laranja/Syne/Geist com build verde; (3) `packages/ui` OU registry escolhido como fonte única de primitivos.

## 6. Gates e gotchas do repo (não quebrar)

**Comandos de verificação (rodar da raiz):**
- `pnpm build` → `turbo run build`
- `pnpm lint` → `turbo run lint`
- `pnpm typecheck` → `turbo run typecheck` (no `web-admin`: `tsc --noEmit`)
- `pnpm test` / `pnpm test:e2e` (Playwright)
- Storybook do DS: `pnpm --filter @gestao-fretamento-pro/ui storybook` (validar componentes isolados + a11y)

**Regras inegociáveis:**
- **Não migrar o `packages/ui` para shadcn do zero.** É um DS maduro e funcional; o trabalho é RE-BRAND, não reescrita. Reescrever explodiria o escopo e quebraria 18 páginas.
- **Tokens vivem em `packages/ui/src/tokens/*.css`** — mudar cor/fonte/raio ali propaga para todo o `web-admin` via `@import "@gestao-fretamento-pro/ui/tokens"`. É o ponto de alavancagem; não duplicar tokens no `web-admin`.
- **Tailwind é v3** (não v4): sintaxe de config é `theme.extend` em `tailwind.config.ts`, NÃO `@theme inline`. Não introduzir sintaxe de Tailwind 4.
- **`darkMode: "class"`** e o app já roda `className="dark"` no `<html>`. Manter os dois temas (light+dark) funcionando ao remapear tokens.
- **Não tocar** em `apps/api-core` (NestJS), `apps/worker`, `packages/{auth,database,validators,types,config}`, `infra/`, `openapi/`, migrations — fora do escopo de design.
- **Reduzir ruído de docs** (a compass apontou): `PROGRESSO-*.md`, `EQUIPE-*.md`, `CONTINUAÇÃO/` — não são fonte de verdade de design (é o DESIGN.md). Não propagar decisões desses arquivos.
- **A11y:** manter addon-a11y do Storybook verde ao refatorar (contraste do laranja sobre superfícies escuras).
- **Registro:** commits e mudança externa (publicar registry, deploy) exigem confirmação — ver portões no prompt orquestrador.
