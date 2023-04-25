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
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { ConsentLifecycleService } from '../../core/services/consent-lifecycle.service';
import {
  ConsentCompleteNetworkModel,
  DataSubmission,
  mapNullable,
  mapNullableUrl,
  UserConsentReadNetworkResponse,
} from '@consent-as-a-service/domain';

@Controller('consent/user/v1')
export class UserConsentController {
  constructor(private consentLifecycleService: ConsentLifecycleService) {}
  @Get('request/:consentId')
  @Roles(Auth0Roles.USER)
  async getConsentRequest(@Param('consentId') consentId: string) {
    const promise = await this.consentLifecycleService.readConsentForRequest(
      consentId,
    );

    const mappedAction: UserConsentReadNetworkResponse = {
      id: consentId,
      expiry: promise.consentModel.expiry.toString(),
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

  @Post('/submit/:consentId')
  @Roles(Auth0Roles.USER)
  async submitConsent(
    @Param('consentId') consentId,
    @Body() requestBody: DataSubmission,
  ): Promise<ConsentCompleteNetworkModel> {
    const { request } =
      await this.consentLifecycleService.readConsentForRequest(consentId);
    if (!requestBody.submitData) {
      throw new HttpException(
        'Cannot proceed without a valid request body',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.consentLifecycleService.submitConsentDataAndFulfil(
      consentId,
      requestBody,
    );
    return {
      callbackUrl: request.callbackUrl.toString(),
    };
  }

  @Post('/reject/:consentId')
  @Roles(Auth0Roles.USER)
  async rejectConsent(
    @Param('consentId') consentId,
  ): Promise<ConsentCompleteNetworkModel> {
    const { request } =
      await this.consentLifecycleService.readConsentForRequest(consentId);
    await this.consentLifecycleService.rejectConsent(consentId);
    return {
      callbackUrl: request.callbackUrl.toString(),
    };
  }

  @Get(':consentId')
  @Roles(Auth0Roles.USER)
  async readWholeConsent(@Param('consentId') consentId) {
    const { consent, org, request } =
      await this.consentLifecycleService.readFulfilledConsent(consentId);

    return {
      title: request.title,
      description: request.description,
      org: {
        logo: org.logo,
        displayName: org.displayName,
        banner: org.banner,
      },
      created: consent.consentData.dateCreated.toString(),
      expiry: consent.expiry.toString(),
      consentData: consent.consentData.data,
    };
  }

  @Get()
  @Roles(Auth0Roles.USER)
  async getAllConsents() {}
}
