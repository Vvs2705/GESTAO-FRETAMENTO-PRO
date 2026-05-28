/**
 * password.ts
 * Argon2id password hashing and verification.
 * Parameters comply with docs/08-seguranca-lgpd-governanca.md:
 *   - memoryCost: 65536 (64 MB)
 *   - timeCost: 3
 *   - parallelism: 4
 *   - saltLength: 16
 */

import * as argon2 from 'argon2';
import {
  ARGON2_MEMORY_COST,
  ARGON2_TIME_COST,
  ARGON2_PARALLELISM,
} from './constants';

/**
 * Hash a plain-text password using Argon2id.
 * This is intentionally slow (~100-300ms) to resist brute force.
 */
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: ARGON2_MEMORY_COST,
    timeCost: ARGON2_TIME_COST,
    parallelism: ARGON2_PARALLELISM,
  });
}

/**
 * Verify a plain-text password against a stored Argon2id hash.
 * Returns true if the password matches, false otherwise.
 * Never throws — malformed hash is treated as non-match.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // argon2.verify can throw on malformed hashes — treat as invalid
    return false;
  }
}
