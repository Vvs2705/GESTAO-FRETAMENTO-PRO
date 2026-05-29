# ============================================================
# Gestão Fretamento Pro — api-core Dockerfile
# Node 22 Alpine, multi-stage, non-root user
# ============================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm@11.4.0
WORKDIR /app

# ============================================================
FROM base AS deps
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/auth/package.json ./packages/auth/
COPY apps/api-core/package.json ./apps/api-core/
RUN pnpm install --frozen-lockfile

# ============================================================
FROM deps AS builder
COPY packages/ ./packages/
COPY apps/api-core/ ./apps/api-core/
# Generate Prisma client
RUN pnpm --filter @gestao-fretamento-pro/database db:generate
# Build all packages + api-core
RUN pnpm turbo build --filter=@gestao-fretamento-pro/api-core...

# ============================================================
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init curl
WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Copy only production artifacts
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/apps/api-core/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/packages ./packages

USER appuser
EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
