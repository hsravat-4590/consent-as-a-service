/*
 * Copyright (c) 2023 Hanzalah Ravat
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import { expressJwtSecret } from 'jwks-rsa';
import { expressjwt, GetVerificationKey } from 'express-jwt';

@Injectable()
export class Auth0Guard implements CanActivate {
  private readonly AUTH0_AUDIENCE;

  private readonly AUTH0_ISSUER;

  constructor(private configService: ConfigService) {
    this.AUTH0_AUDIENCE = configService.get('AUTH0_AUDIENCE');
    this.AUTH0_ISSUER = configService.get('AUTH0_ISSUER_URL');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.getArgByIndex(0);
    const res = context.getArgByIndex(1);
    const checkJwt = promisify(
      expressjwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${this.AUTH0_ISSUER}.well-known/jwks.json`,
        }) as GetVerificationKey,
        audience: this.AUTH0_AUDIENCE,
        issuer: this.AUTH0_ISSUER,
        algorithms: ['RS256'],
      }),
    );
    try {
      await checkJwt(req, res);
      return true;
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
}
