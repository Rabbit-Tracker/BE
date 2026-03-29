import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

import { OAuthProfileDto } from '../dto/oauth-profile.dto.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const oauthProfile: OAuthProfileDto = {
      provider: 'google',
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      nickname: profile.displayName || '사용자',
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    done(null, oauthProfile);
  }
}
