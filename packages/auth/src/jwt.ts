/**
 * jwt.ts
 * JWT token signing and verification utilities using the `jose` library.
 * Access token TTL: 15 minutes.
 * Refresh token TTL: 7 days.
 * Algorithm: HS256 (symmetric) with a long key from env.
 * Never uses alg: none.
 */

import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from 'jose';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './constants';

export interface GfpJwtPayload extends JWTPayload {
  /** Subject — user ID */
  sub: string;
  tenantId: string;
  email: string;
  type: 'access' | 'refresh';
  /** Token family ID — used for reuse detection on refresh tokens */
  familyId?: string;
}

// Keep the old name as alias for backward compat
export type JwtPayload = GfpJwtPayload;

export interface AccessTokenPayload extends GfpJwtPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends GfpJwtPayload {
  type: 'refresh';
  familyId: string;
}

function secretToKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Sign an access token (15 min TTL).
 */
export async function signAccessToken(
  payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'nbf' | 'jti'>,
  secret: string,
): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secretToKey(secret));
}

/**
 * Sign a refresh token (7 days TTL).
 * familyId links all tokens in a rotation chain for reuse detection.
 */
export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'nbf' | 'jti'>,
  secret: string,
): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SECONDS}s`)
    .sign(secretToKey(secret));
}

/**
 * Verify and decode a JWT. Returns the decoded payload or null if invalid/expired.
 */
export async function verifyToken(
  token: string,
  secret: string,
): Promise<GfpJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretToKey(secret), {
      algorithms: ['HS256'],
    });
    return payload as GfpJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Decode a JWT without verifying the signature.
 * Use only for reading claims from expired tokens during logout flows.
 */
export function decodeToken(token: string): GfpJwtPayload | null {
  try {
    const decoded = decodeJwt(token);
    return decoded as GfpJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Calculate the Date when the refresh token expires.
 */
export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}

/**
 * Calculate the Date when the access token expires.
 */
export function accessTokenExpiresAt(): Date {
  return new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
}
