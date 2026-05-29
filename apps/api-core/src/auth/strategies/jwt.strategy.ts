import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '@gestao-fretamento-pro/config';
import type { GfpJwtPayload } from '@gestao-fretamento-pro/auth';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService<Env>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }) as string,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: GfpJwtPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException({
        error: 'INVALID_TOKEN_TYPE',
        message: 'Token inválido para este endpoint.',
      });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        employee: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado ou inativo.',
      });
    }

    const permissions =
      user.employee?.role?.rolePermissions.map((rp) => rp.permission.key) ?? [];

    const result: AuthenticatedUser = {
      id: user.id as AuthenticatedUser['id'],
      tenantId: user.tenantId as AuthenticatedUser['tenantId'],
      email: user.email,
      name: user.name,
      permissions,
    };

    if (user.employee?.role?.id) {
      result.roleId = user.employee.role.id;
    }

    return result;
  }
}
