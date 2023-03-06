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
import { ConsentRequestService } from '../../core/services/consent-request.service';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import {
  CreateConsentRequestNetworkRequest,
  CreateConsentRequestNetworkResponse,
  GetConsentRequestNetworkResponse,
} from '../../core/models/consent-request.network.model';
import { Optional, Validate } from '@consent-as-a-service/domain';

@Controller('consent/request/v1')
export class ConsentRequestController {
  constructor(private consentRequestService: ConsentRequestService) {}

  @Post()
  @Roles(Auth0Roles.CREATE_CONSENTS)
  async createConsentRequest(
    @Body()
    requestBody: CreateConsentRequestNetworkRequest,
  ): Promise<CreateConsentRequestNetworkResponse> {
    const request =
      Optional.ofNullable<CreateConsentRequestNetworkRequest>(requestBody);
    Validate.ValidateOptional(
      request,
      {
        errorException: new HttpException(
          'Request Body must not be null',
          HttpStatus.BAD_REQUEST,
        ),
      },
      true,
    );
    const id = await this.consentRequestService.createConsentRequest(
      request.get(),
    );
    return {
      id: id,
    };
  }

  @Get(':id')
  @Roles(Auth0Roles.USER, Auth0Roles.ORG_USER)
  async getRequestDataSchema(
    @Param('id') consentRequestId: string,
  ): Promise<GetConsentRequestNetworkResponse> {
    return await this.consentRequestService.getConsentRequest({
      id: consentRequestId,
    });
  }
}
