import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';

import type { User } from '../entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { OAuthProfileDto } from './dto/oauth-profile.dto.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserSnapshot {
  id: string;
  nickname: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface AuthResult extends TokenPair {
  isNewUser: boolean;
  user: AuthUserSnapshot;
}

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: StringValue;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    this.refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    )! as StringValue;
  }

  async validateOAuthLogin(profile: OAuthProfileDto, userAgent?: string): Promise<AuthResult> {
    const existing = await this.usersService.findByProvider(
      profile.provider,
      profile.providerUserId,
    );

    let user: User;
    let isNewUser: boolean;

    if (existing) {
      user = existing.user;
      isNewUser = false;
    } else {
      const result = await this.usersService.createWithProvider(profile);
      user = result.user;
      isNewUser = result.isNewUser;
    }

    const tokens = await this.issueTokens(user.id, userAgent);
    const userSnapshot: AuthUserSnapshot = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
    return { ...tokens, isNewUser, user: userSnapshot };
  }

  async issueTokens(userId: string, userAgent?: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign({ sub: userId, type: 'access' });

    const sessionId = crypto.randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, sessionId, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.usersService.createSession(userId, refreshTokenHash, expiresAt, userAgent);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string, userAgent?: string): Promise<TokenPair> {
    let payload: { sub: string; sessionId: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('리프레시 토큰이 만료되었거나 유효하지 않습니다');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('잘못된 토큰 유형입니다');
    }

    const session = await this.usersService.findSessionById(payload.sessionId);
    if (!session) {
      throw new UnauthorizedException('세션을 찾을 수 없습니다');
    }

    if (session.expiresAt < new Date()) {
      await this.usersService.deleteSession(session.id);
      throw new UnauthorizedException('세션이 만료되었습니다');
    }

    const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isValid) {
      await this.usersService.deleteAllUserSessions(session.userId);
      throw new UnauthorizedException(
        '토큰이 재사용되었습니다. 보안을 위해 모든 세션이 종료됩니다',
      );
    }

    const user = await this.usersService.findById(session.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('유효하지 않은 사용자입니다');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, type: 'access' });

    const newRefreshToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
    );

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.usersService.updateSession(session.id, newRefreshTokenHash, expiresAt, userAgent);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<{
        sessionId: string;
        type: string;
      }>(refreshToken, { secret: this.refreshSecret });

      if (payload.type === 'refresh' && payload.sessionId) {
        await this.usersService.deleteSession(payload.sessionId);
      }
    } catch {
      // 이미 만료된 토큰이라도 로그아웃 요청은 성공 처리
    }
  }
}
