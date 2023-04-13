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

import { Controller, Get, Param } from '@nestjs/common';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { ConsentLifecycleService } from '../../core/services/consent-lifecycle.service';
import {
  mapNullable,
  Nullable,
  UserConsentReadNetworkResponse,
} from '@consent-as-a-service/domain';

@Controller('consent/user/v1')
export class UserConsentController {
  constructor(private consentLifecycleService: ConsentLifecycleService) {}
  @Get(':consentId')
  @Roles(Auth0Roles.USER)
  async getConsent(@Param('consentId') consentId: string) {
    const promise = await this.consentLifecycleService.readConsentForRequest(
      consentId,
    );
    const mapNullableUrl = (url?: URL): Nullable<string> => {
      if (url) {
        return url.toString();
      }
      return null;
    };
    const mappedAction: UserConsentReadNetworkResponse = {
      id: consentId,
      expiry: promise.consentModel.expiry,
      consentRequestId: promise.consentModel.consentRequest,
      userId: promise.consentModel.user.id,
      requester: {
        displayName: promise.orgModel.displayName,
        banner: mapNullable(mapNullableUrl, promise.orgModel.banner),
        logo: mapNullable(mapNullableUrl, promise.orgModel.logo),
      },
      ui: {
        title: promise.request.title,
        description: promise.request.description,
      },
      dataSchema: promise.request.schema,
    };
    return mappedAction;
  }
}
