import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginSchema, RefreshSchema, LogoutSchema } from '@gestao-fretamento-pro/validators';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenPairDto } from './dto/token-pair.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@gestao-fretamento-pro/types';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter tokens de acesso' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: TokenPairDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas — tente mais tarde' })
  async login(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<TokenPairDto> {
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    return this.authService.login(parsed.data, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens usando refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso', type: TokenPairDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  async refresh(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<TokenPairDto> {
    const parsed = RefreshSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? 'unknown';

    return this.authService.refresh(parsed.data.refreshToken, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão do usuário' })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = LogoutSchema.safeParse(body);
    const rawToken = parsed.success ? parsed.data.refreshToken : undefined;

    await this.authService.logout(user.id, user.tenantId, rawToken);
  }
}
