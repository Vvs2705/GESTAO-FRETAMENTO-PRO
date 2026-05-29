#!/usr/bin/env bash
# ============================================================
# Gestão Fretamento Pro — Database Reset Script
# Uso: ./scripts/db/reset.sh
# Apenas para ambiente de desenvolvimento!
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=================================================="
echo "  GFP — Database Reset"
echo "=================================================="

# Segurança: recusar em produção
if [ "${NODE_ENV:-development}" = "production" ]; then
  echo "❌  Cannot reset database in production environment!" >&2
  exit 1
fi

if [ "${NODE_ENV:-development}" = "staging" ] && [ "${FORCE_STAGING_RESET:-}" != "true" ]; then
  echo "❌  Cannot reset database in staging without FORCE_STAGING_RESET=true" >&2
  exit 1
fi

echo "⚠️   Resetting database: ${DATABASE_URL:-postgresql://gfp:gfp_dev_password@localhost:5432/gestao_fretamento_pro}"
echo "     Press CTRL+C within 5 seconds to abort..."
sleep 5

cd "${PROJECT_ROOT}"

echo ""
echo "► Dropping and recreating schema via Prisma..."
pnpm --filter @gestao-fretamento-pro/database exec prisma migrate reset --force --skip-seed

echo ""
echo "► Applying all migrations..."
pnpm --filter @gestao-fretamento-pro/database exec prisma migrate deploy

echo ""
echo "► Running database seed..."
pnpm --filter @gestao-fretamento-pro/database exec ts-node seed/index.ts

echo ""
echo "✅  Database reset complete!"
echo "    Tenant, 2 branches, 20 vehicles, 30 drivers, 5 clients, 15 routes, 100 trips"
