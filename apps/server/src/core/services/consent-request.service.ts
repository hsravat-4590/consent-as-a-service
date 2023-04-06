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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { ConsentRequestDA } from '@consent-as-a-service/database-prisma';
import {
  CreateConsentRequestNetworkRequest,
  GetConsentRequestNetworkRequest,
  GetConsentRequestNetworkResponse,
} from '../models/consent-request.network.model';
import { Validate } from '@consent-as-a-service/domain';
import CreateConsentRequestOptions = ConsentRequestDA.CreateConsentRequestOptions;

/**
 * Service which takes a consent request from controller, handles validation & verification to create the consent
 */
@Injectable()
export class ConsentRequestService {
  constructor(private readonly userService: UserService) {}

  async createConsentRequest(
    creationOptions: CreateConsentRequestNetworkRequest,
  ): Promise<string> {
    const mUser = await this.userService.hydrateUserWithPrivilege();

    //Pick<ConsentRequestModel, "title" | "description" | "schema" | "callbackUrl"
    const requestOptions = {
      title: creationOptions.title,
      description: creationOptions.description,
      callbackUrl: creationOptions.callbackUrl,
    } as CreateConsentRequestOptions;
    const mId = await ConsentRequestDA.CreateConsentRequestType(
      requestOptions,
      creationOptions.entries,
      mUser.consentCreator,
    );
    return mId.consentRequestId;
  }

  async getConsentRequest(
    getConsentRequestNetworkRequest: GetConsentRequestNetworkRequest,
  ): Promise<GetConsentRequestNetworkResponse> {
    // TODO Handle Claiming
    const consentRequestModelOptional =
      await ConsentRequestDA.ReadConsentRequest(
        getConsentRequestNetworkRequest.id,
      );
    Validate.ValidateOptional(consentRequestModelOptional, {
      errorException: new HttpException(
        'Consent Request Not Found',
        HttpStatus.NOT_FOUND,
      ),
    });
    const request = consentRequestModelOptional.get();
    return {
      consents: undefined,
      ownerId: '',
      description: request.description,
      schema: request.schema,
      title: request.title,
    };
  }
}
