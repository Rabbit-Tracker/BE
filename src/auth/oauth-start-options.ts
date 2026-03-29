import type { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import type { OauthRedirectStore } from './oauth-redirect.store.js';

export function getOAuthStartAuthenticateOptions(
  req: Request,
  configService: ConfigService,
  store: OauthRedirectStore,
): { state: string } | Record<string, never> {
  const raw = req.query['app_redirect'];
  let targetUrl: string;
  if (typeof raw === 'string' && raw.length > 0) {
    targetUrl = decodeURIComponent(raw);
  } else {
    targetUrl = configService.get<string>('APP_DEEP_LINK') ?? '';
  }

  if (!targetUrl) {
    return {};
  }

  try {
    const state = store.remember(targetUrl);
    return { state };
  } catch {
    const fallback = configService.get<string>('APP_DEEP_LINK') ?? '';
    if (!fallback) {
      return {};
    }
    const state = store.remember(fallback);
    return { state };
  }
}
