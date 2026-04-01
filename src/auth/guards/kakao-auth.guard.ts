import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { getOAuthStartAuthenticateOptions } from '../oauth-start-options.js';
import { OauthRedirectStore } from '../oauth-redirect.store.js';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly oauthRedirectStore: OauthRedirectStore,
  ) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    return getOAuthStartAuthenticateOptions(req, this.configService, this.oauthRedirectStore);
  }
}
