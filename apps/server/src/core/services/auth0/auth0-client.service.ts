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

import { Injectable } from '@nestjs/common';
import { AuthenticationClient, ManagementClient } from 'auth0';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Auth0ClientService {
  private readonly _managementClient: ManagementClient;
  private readonly _authenticationClient: AuthenticationClient;
  constructor(configService: ConfigService) {
    this._managementClient = new ManagementClient({
      domain: configService.get('AUTH0_ISSUER_URL'),
      clientId: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
    });
    this._authenticationClient = new AuthenticationClient({
      domain: configService.get('AUTH0_ISSUER_URL'),
      clientId: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
    });
  }
  public get managementClient(): ManagementClient {
    return this._managementClient;
  }

  public get authenticationClient(): AuthenticationClient {
    return this._authenticationClient;
  }
}
