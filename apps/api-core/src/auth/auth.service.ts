import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '@gestao-fretamento-pro/config';
import {
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  hashToken,
  generateSecureToken,
  generateFamilyId,
  accessTokenExpiresAt,
  refreshTokenExpiresAt,
} from '@gestao-fretamento-pro/auth';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../common/services/audit.service';
import type { TokenPairDto } from './dto/token-pair.dto';

const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 5;
const RATE_LIMIT_WINDOW = 60; // seconds

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService<Env>,
    private readonly audit: AuditService,
  ) {}

  async login(
    dto: { email: string; password: string },
    ip: string,
    userAgent: string,
  ): Promise<TokenPairDto> {
    // 1. Rate limit by IP
    const rlKey = `rl:login:${ip}`;
    const attempts = await this.redis.incr(rlKey);
    if (attempts === 1) await this.redis.expire(rlKey, RATE_LIMIT_WINDOW);
    if (attempts > MAX_LOGIN_ATTEMPTS) {
      const ttl = await this.redis.ttl(rlKey);
      throw new UnauthorizedException({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Muitas tentativas de login. Tente novamente em ${ttl} segundos.`,
      });
    }

    // 2. Find user by email across all active tenants
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null, status: 'ACTIVE' },
      include: {
        employee: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    // 3. Check account lockout
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException({
        error: 'ACCOUNT_LOCKED',
        message: 'Conta temporariamente bloqueada. Tente novamente em alguns minutos.',
      });
    }

    // 4. Verify password (constant-time to prevent timing attacks)
    const valid = user
      ? await verifyPassword(dto.password, user.passwordHash)
      : false;

    if (!user || !valid) {
      // Increment failed attempts
      if (user) {
        const failedCount = (user.failedLoginCount ?? 0) + 1;
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failedCount,
            lockedUntil:
              failedCount >= MAX_LOGIN_ATTEMPTS
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                : null,
          },
        });

        await this.audit.log({
          tenantId: user.tenantId,
          actorUserId: user.id,
          action: 'user.login_failed',
          ipAddress: ip,
          userAgent,
          after: { failedCount },
        });
      }

      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha incorretos.',
      });
    }

    // 5. Reset failed counter on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // 6. Issue token pair
    const tokenPair = await this.issueTokenPair(user.id, user.tenantId, ip);
    const permissions =
      user.employee?.role?.rolePermissions.map((rp) => rp.permission.key) ?? [];

    await this.audit.log({
      tenantId: user.tenantId,
      actorUserId: user.id,
      action: 'user.login',
      ipAddress: ip,
      userAgent,
    });

    return {
      ...tokenPair,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        permissions,
      },
    };
  }

  async refresh(rawToken: string, ip: string): Promise<TokenPairDto> {
    const tokenHash = hashToken(rawToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: {
        user: {
          include: {
            employee: {
              include: {
                role: {
                  include: {
                    rolePermissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!stored) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Token de atualização inválido.',
      });
    }

    if (stored.used) {
      // Token reuse detected — revoke entire family
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId },
        data: { revokedAt: new Date() },
      });
      this.logger.warn(
        `Refresh token reuse detected — family revoked. userId=${stored.userId} familyId=${stored.familyId}`,
      );
      throw new UnauthorizedException({
        error: 'TOKEN_REUSE_DETECTED',
        message: 'Sessão inválida. Faça login novamente.',
      });
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException({
        error: 'REFRESH_TOKEN_EXPIRED',
        message: 'Sessão expirada. Faça login novamente.',
      });
    }

    // Mark current token as used
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { used: true },
    });

    // Issue new token pair with SAME familyId
    const tokenPair = await this.issueTokenPair(
      stored.userId,
      stored.tenantId,
      ip,
      stored.familyId,
    );
    const permissions =
      stored.user.employee?.role?.rolePermissions.map(
        (rp) => rp.permission.key,
      ) ?? [];

    return {
      ...tokenPair,
      user: {
        id: stored.user.id,
        tenantId: stored.user.tenantId,
        name: stored.user.name,
        email: stored.user.email,
        permissions,
      },
    };
  }

  async logout(
    userId: string,
    tenantId: string,
    rawToken?: string,
  ): Promise<void> {
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId, tenantId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all sessions
      await this.prisma.refreshToken.updateMany({
        where: { userId, tenantId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.audit.log({ tenantId, actorUserId: userId, action: 'user.logout' });
  }

  private async issueTokenPair(
    userId: string,
    tenantId: string,
    ip: string,
    familyId?: string,
  ): Promise<Omit<TokenPairDto, 'user'>> {
    const jwtSecret = this.config.get('JWT_SECRET', { infer: true }) as string;
    const resolvedFamilyId = familyId ?? generateFamilyId();

    const [accessToken, _refreshJwt] = await Promise.all([
      signAccessToken(
        { sub: userId, tenantId, email: '', type: 'access' as never },
        jwtSecret,
      ),
      // We sign a JWT for the refresh payload structure but we use
      // a raw opaque token (stored hashed) as the actual refresh token
      signRefreshToken(
        {
          sub: userId,
          tenantId,
          email: '',
          type: 'refresh' as never,
          familyId: resolvedFamilyId,
        },
        this.config.get('JWT_REFRESH_SECRET', { infer: true }) as string,
      ),
    ]);

    const rawRefreshToken = generateSecureToken(48);
    const tokenHash = hashToken(rawRefreshToken);
    const rtExpiresAt = refreshTokenExpiresAt();

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tenantId,
        tokenHash,
        familyId: resolvedFamilyId,
        expiresAt: rtExpiresAt,
        ipAddress: ip,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt(),
      refreshTokenExpiresAt: rtExpiresAt,
    };
  }
}
