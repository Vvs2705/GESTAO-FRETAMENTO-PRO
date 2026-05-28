/**
 * tokens.ts
 * Cryptographically secure token generation and hashing utilities.
 * Uses Node.js crypto (CSPRNG) — never Math.random().
 */

import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 48; // 384 bits — sufficient entropy for refresh tokens

/**
 * Generate a cryptographically secure random token (hex string).
 * @param bytes Number of random bytes (default 32 = 256-bit entropy).
 * Used for refresh tokens before hashing for storage.
 */
export function generateSecureToken(bytes = TOKEN_BYTES): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Hash a raw token using SHA-256 for safe storage in the database.
 * We store the hash, not the plain token, to prevent database theft from
 * granting token reuse.
 */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generate a new family ID (UUID v4 format via crypto).
 * Family IDs link all refresh tokens in a rotation chain.
 * If any old token in the family is reused, the entire family is revoked.
 */
export function generateFamilyId(): string {
  const bytes = randomBytes(16);
  // Set version bits (v4) and variant bits (RFC 4122)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Generate a hex idempotency key (16 bytes = 128 bits).
 * Suitable for use as the value of the `Idempotency-Key` header.
 */
export function generateIdempotencyKey(): string {
  return randomBytes(16).toString('hex');
}
