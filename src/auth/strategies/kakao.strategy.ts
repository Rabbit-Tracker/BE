import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

import { OAuthProfileDto } from '../dto/oauth-profile.dto.js';

function kakaoEmailFromJson(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null;
  const acc = (json as Record<string, unknown>)['kakao_account'];
  if (!acc || typeof acc !== 'object') return null;
  const email = (acc as Record<string, unknown>)['email'];
  return typeof email === 'string' ? email : null;
}

function kakaoProfileImageFromJson(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null;
  const props = (json as Record<string, unknown>)['properties'];
  if (!props || typeof props !== 'object') return null;
  const img = (props as Record<string, unknown>)['profile_image'];
  return typeof img === 'string' ? img : null;
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID')!,
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL')!,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: OAuthProfileDto) => void,
  ): void {
    const json = profile._json as unknown;

    const oauthProfile: OAuthProfileDto = {
      provider: 'kakao',
      providerUserId: String(profile.id),
      email: kakaoEmailFromJson(json),
      nickname: profile.displayName || '사용자',
      avatarUrl: kakaoProfileImageFromJson(json),
    };

    done(null, oauthProfile);
  }
}
