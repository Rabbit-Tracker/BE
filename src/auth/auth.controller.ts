import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService, TokenPair } from './auth.service.js';
import { OAuthProfileDto } from './dto/oauth-profile.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { KakaoAuthGuard } from './guards/kakao-auth.guard.js';
import { OauthRedirectStore } from './oauth-redirect.store.js';

function appendQueryParams(baseUrl: string, params: URLSearchParams): string {
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}${params.toString()}`;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly oauthRedirectStore: OauthRedirectStore,
  ) {}

  // ─── 카카오 ──────────────────────────────────────

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  kakaoLogin(): void {
    // Passport가 카카오 로그인 페이지로 리다이렉트 처리
  }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleOAuthCallback(req, res);
  }

  // ─── 구글 ──────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    // Passport가 구글 로그인 페이지로 리다이렉트 처리
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleOAuthCallback(req, res);
  }

  // ─── 토큰 갱신 ──────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<TokenPair> {
    const tokens = await this.authService.refreshTokens(
      dto.refreshToken,
      req.headers['user-agent'],
    );
    return tokens;
  }

  // ─── 로그아웃 ──────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { message: '로그아웃 되었습니다' };
  }

  // ─── 공통 OAuth 콜백 처리 ──────────────────────────────────────

  private async handleOAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user as OAuthProfileDto;
      const result = await this.authService.validateOAuthLogin(profile, req.headers['user-agent']);

      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: String(result.isNewUser),
        userId: result.user.id,
        nickname: result.user.nickname,
      });
      if (result.user.email) {
        params.set('email', result.user.email);
      }
      if (result.user.avatarUrl) {
        params.set('avatarUrl', result.user.avatarUrl);
      }

      const state = typeof req.query['state'] === 'string' ? req.query['state'] : undefined;
      const appReturnUrl =
        this.oauthRedirectStore.consume(state) ?? this.configService.get<string>('APP_DEEP_LINK')!;

      res.redirect(appendQueryParams(appReturnUrl, params));
    } catch {
      const state = typeof req.query['state'] === 'string' ? req.query['state'] : undefined;
      const appReturnUrl =
        this.oauthRedirectStore.consume(state) ?? this.configService.get<string>('APP_DEEP_LINK')!;
      const params = new URLSearchParams({ error: 'auth_failed' });
      res.redirect(appendQueryParams(appReturnUrl, params));
    }
  }
}
