/**
 * constants.ts
 * Authentication constants for the Gestão Fretamento Pro platform.
 * These values are shared between auth utilities and API configuration.
 */

/** Access token lifetime in seconds (15 minutes). */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

/** Refresh token lifetime in seconds (7 days). */
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Kept for reference — we use Argon2id, not bcrypt.
 * This constant documents what bcrypt rounds WOULD be equivalent to.
 */
export const BCRYPT_ROUNDS = 12;

/** Argon2id time cost (number of iterations). */
export const ARGON2_TIME_COST = 3;

/** Argon2id memory cost in KiB (64 MB). */
export const ARGON2_MEMORY_COST = 65536;

/** Argon2id degree of parallelism. */
export const ARGON2_PARALLELISM = 4;
