export interface OAuthProfileDto {
  provider: 'kakao' | 'google';
  providerUserId: string;
  email: string | null;
  nickname: string;
  avatarUrl: string | null;
}
