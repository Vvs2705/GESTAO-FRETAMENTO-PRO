import { z } from 'zod';

/**
 * Zod schema for all application environment variables.
 *
 * Rules:
 * - DATABASE_URL and REDIS_URL are required in every environment.
 * - DIRECT_URL is optional — used by Prisma Migrate to bypass PgBouncer.
 * - JWT secrets must be at least 32 characters to be cryptographically safe.
 * - Monetary and numeric env vars use z.coerce.number() so string env values are cast.
 * - Optional URLs that are present must be valid URLs (z.string().url().optional()).
 */
export const EnvSchema = z.object({
  // ──────────────────────────────────────────────
  // Database
  // ──────────────────────────────────────────────
  DATABASE_URL: z.string().url({
    message: 'DATABASE_URL must be a valid PostgreSQL connection URL',
  }),
  /** Used by Prisma migrations to bypass PgBouncer connection pooling. */
  DIRECT_URL: z
    .string()
    .url({ message: 'DIRECT_URL must be a valid PostgreSQL connection URL' })
    .optional(),

  // ──────────────────────────────────────────────
  // Cache / Queues
  // ──────────────────────────────────────────────
  REDIS_URL: z.string().url({
    message: 'REDIS_URL must be a valid Redis connection URL',
  }),

  // ──────────────────────────────────────────────
  // Authentication
  // ──────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters long' }),

  // ──────────────────────────────────────────────
  // Server
  // ──────────────────────────────────────────────
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  APP_URL: z.string().url({ message: 'APP_URL must be a valid URL' }),
  CORS_ORIGINS: z
    .string()
    .describe('Comma-separated list of allowed CORS origins'),
  FRONTEND_URL: z
    .string()
    .url({ message: 'FRONTEND_URL must be a valid URL' })
    .optional(),

  // ──────────────────────────────────────────────
  // Logging
  // ──────────────────────────────────────────────
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  // ──────────────────────────────────────────────
  // Rate Limiting
  // ──────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60000)
    .describe('Rate limit window in milliseconds (default: 60 seconds)'),

  // ──────────────────────────────────────────────
  // OpenTelemetry
  // ──────────────────────────────────────────────
  OTEL_SERVICE_NAME: z.string().default('api-core'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z
    .string()
    .url({ message: 'OTEL_EXPORTER_OTLP_ENDPOINT must be a valid URL' })
    .optional(),

  // ──────────────────────────────────────────────
  // Object Storage (S3 / MinIO)
  // ──────────────────────────────────────────────
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  /** MinIO or any S3-compatible endpoint. Leave empty for AWS S3. */
  S3_ENDPOINT: z
    .string()
    .url({ message: 'S3_ENDPOINT must be a valid URL' })
    .optional(),

  // ──────────────────────────────────────────────
  // Admin bootstrap (usado APENAS pelo seed — nunca pelo runtime da API)
  // Define o administrador geral criado ao popular o banco.
  // Mantidos opcionais para não exigir presença no boot da API.
  // ──────────────────────────────────────────────
  ADMIN_EMAIL: z
    .string()
    .email({ message: 'ADMIN_EMAIL must be a valid e-mail address' })
    .optional(),
  ADMIN_PASSWORD: z
    .string()
    .min(8, { message: 'ADMIN_PASSWORD must be at least 8 characters long' })
    .optional(),
  ADMIN_NAME: z.string().optional(),
});

/** Inferred TypeScript type from EnvSchema. Use this everywhere instead of process.env directly. */
export type Env = z.infer<typeof EnvSchema>;
