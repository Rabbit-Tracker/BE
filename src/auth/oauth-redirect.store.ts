import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

const TTL_MS = 10 * 60 * 1000;

/** Expo Go / dev build 등에서 허용하는 앱 복귀 URL 패턴 */
function isAllowedAppRedirectUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol === 'exp:') return true;
    if (u.protocol === 'rabbit-tracker:') return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1'))
      return true;
    return false;
  } catch {
    return false;
  }
}

@Injectable()
export class OauthRedirectStore {
  private readonly map = new Map<string, { url: string; exp: number }>();

  remember(url: string): string {
    if (!isAllowedAppRedirectUrl(url)) {
      throw new Error('Invalid app_redirect URL');
    }
    const id = randomUUID();
    this.map.set(id, { url, exp: Date.now() + TTL_MS });
    return id;
  }

  consume(state: string | undefined): string | null {
    if (!state) return null;
    const entry = this.map.get(state);
    if (!entry) return null;
    this.map.delete(state);
    if (entry.exp < Date.now()) return null;
    return entry.url;
  }
}
