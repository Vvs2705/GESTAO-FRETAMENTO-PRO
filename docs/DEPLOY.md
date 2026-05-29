# Deploy — Gestão Fretamento Pro

Stack de produção:
- **Banco:** Neon (PostgreSQL 16 serverless)
- **Backend (api-core + worker):** Fly.io (região `gru` — São Paulo)
- **Frontend (web-admin):** Vercel
- **Cache/Filas:** Upstash Redis (via Fly) ou Redis gerenciado

A ordem importa: **Neon → Fly (backend) → Vercel (frontend)**.

---

## 1. Banco de dados — Neon

1. Crie um projeto em https://neon.tech (região South America / `aws-sa-east-1`).
2. Copie as duas connection strings do dashboard:
   - **Pooled** (com `-pooler` no host) → vira `DATABASE_URL`
   - **Direct** (sem `-pooler`) → vira `DIRECT_URL` (usada pelas migrations)
3. Garanta `?sslmode=require` no final de ambas.

Exemplo:
```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/gfp?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/gfp?sslmode=require"
```

> A extensão `pgcrypto` (usada por `gen_random_uuid()`) já vem habilitada no Neon.

---

## 2. Backend — Fly.io

### 2.1 Criar os apps (uma vez)
```bash
flyctl apps create gfp-api-core
flyctl apps create gfp-worker
```

### 2.2 Redis (Upstash via Fly)
```bash
flyctl redis create   # anote a REDIS_URL gerada
```

### 2.3 Definir secrets (api-core e worker compartilham o banco/redis)
```bash
# Gere segredos fortes:  openssl rand -hex 32
flyctl secrets set -a gfp-api-core \
  DATABASE_URL="<neon-pooled>" \
  DIRECT_URL="<neon-direct>" \
  REDIS_URL="<upstash-redis-url>" \
  JWT_SECRET="<rand-32>" \
  JWT_REFRESH_SECRET="<rand-32>" \
  APP_URL="https://gfp-api-core.fly.dev" \
  CORS_ORIGINS="https://<seu-front>.vercel.app" \
  ADMIN_EMAIL="vsouz009@gmail.com" \
  ADMIN_PASSWORD="<senha-admin-forte>" \
  ADMIN_NAME="Administrador Geral"

flyctl secrets set -a gfp-worker \
  DATABASE_URL="<neon-pooled>" \
  DIRECT_URL="<neon-direct>" \
  REDIS_URL="<upstash-redis-url>" \
  JWT_SECRET="<rand-32>" \
  JWT_REFRESH_SECRET="<rand-32>" \
  APP_URL="https://gfp-api-core.fly.dev" \
  CORS_ORIGINS="https://<seu-front>.vercel.app"
```

### 2.4 Migrations + seed (rodar uma vez, contra o Neon)
```bash
# Localmente, com o .env apontando para o Neon:
pnpm --filter @gestao-fretamento-pro/database db:migrate:deploy
pnpm --filter @gestao-fretamento-pro/database db:seed   # cria o admin geral
```

### 2.5 Deploy
```bash
flyctl deploy -c fly.api.toml
flyctl deploy -c fly.worker.toml
```

A API ficará em `https://gfp-api-core.fly.dev` (health: `/v1/health`).

---

## 3. Frontend — Vercel

> **Estado atual:** projeto `gestao-fretamento-web` criado no time `v-stack-solution`,
> com a env var `NEXT_PUBLIC_API_URL=https://gfp-api-core.fly.dev/v1` já configurada
> (production + preview).
>
> **Importante (monorepo pnpm):** o deploy por CLI (`vercel deploy`) NÃO funciona bem
> aqui — ele sobe só o subdiretório e quebra em `workspace:*`. O caminho correto e
> confiável é a **integração Git com Root Directory**, que usa o pipeline remoto do
> Vercel (lida nativamente com pnpm workspace + Next.js App Router).

### Passo único restante (painel Vercel)
1. Vercel → projeto **gestao-fretamento-web** → **Settings → Build & Deployment**.
2. **Root Directory** = `apps/web-admin` → salvar.
   (O Vercel detecta o `pnpm-workspace.yaml` na raiz e instala lá automaticamente.)
3. **Settings → Git** → conectar o repositório `Vvs2705/GESTAO-FRETAMENTO-PRO`
   (se ainda não estiver conectado).
4. **Deployments → Redeploy** (ou faça um push em `main` — passa a fazer deploy automático).

A env var já está setada. Após o primeiro deploy, copie a URL final da Vercel
(ex.: `https://gestao-fretamento-web.vercel.app`) e atualize o CORS do backend:
```bash
flyctl secrets set -a gfp-api-core CORS_ORIGINS="https://gestao-fretamento-web.vercel.app"
```

### Alternativa: importar do zero
Vercel → Add New → Project → importar `Vvs2705/GESTAO-FRETAMENTO-PRO` →
Root Directory = `apps/web-admin` → add env var `NEXT_PUBLIC_API_URL` →
Deploy. O Vercel detecta Next.js + pnpm workspace e builda corretamente.

---

## Checklist pós-deploy
- [ ] `GET https://gfp-api-core.fly.dev/v1/health` → 200
- [ ] Login no front com `vsouz009@gmail.com` funciona (token real)
- [ ] `flyctl logs -a gfp-worker` mostra o poll do Outbox a cada 5s
- [ ] Dashboards carregam dados reais do Neon
