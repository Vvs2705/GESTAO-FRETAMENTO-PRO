/**
 * @gestao-fretamento-pro/auth
 * Authentication utilities — password hashing, JWT signing, and secure token generation.
 * All functions are pure and framework-agnostic.
 * Uses Argon2id for password hashing and `jose` for JWT operations.
 */

export * from './constants';

export { hashPassword, verifyPassword } from './password';

export {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  decodeToken,
  accessTokenExpiresAt,
  refreshTokenExpiresAt,
} from './jwt';
export type {
  GfpJwtPayload,
  JwtPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
} from './jwt';

export {
  generateSecureToken,
  hashToken,
  generateFamilyId,
  generateIdempotencyKey,
} from './tokens';
