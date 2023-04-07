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
import { ConsentRequestService } from './consent-request.service';
import {
  ConsentDA,
  ConsentRequestDA,
} from '@consent-as-a-service/database-prisma';
import { ConsentRequesterModel, Optional } from '@consent-as-a-service/domain';
import { UserService } from './user.service';
import { LocalDateTime } from '@js-joda/core';
import { ConfigService } from '@nestjs/config';
import { ConsentClaimService } from './consent-claim.service';
import { OrgService } from './org.service';
import CreateConsentOptions = ConsentDA.CreateConsentOptions;

/**
 * Class which manages entire lifecycle of a consent
 */
@Injectable()
export class ConsentLifecycleService {
  private readonly defaultExpiry: number;

  constructor(
    private consentRequestService: ConsentRequestService,
    private userService: UserService,
    private configService: ConfigService,
    private consentClaimService: ConsentClaimService,
    private orgService: OrgService,
  ) {
    this.defaultExpiry = this.configService.get(
      'CONSENT_DEFAULT_EXPIRY_SECONDS',
    );
  }
  async createPendingConsent(
    consentRequestId: string,
    requester: ConsentRequesterModel,
    options: {
      user?: string;
      expiry?: LocalDateTime;
    } = {
      expiry: LocalDateTime.now().plusSeconds(this.defaultExpiry),
    },
  ) {
    // Performs the validations to ensure that a valid consent request is held by the platform
    await this.consentRequestService.getConsentRequest({
      id: consentRequestId,
    });
    const newOptions = {
      user: null,
      expiry: options.expiry,
    } as CreateConsentOptions;
    if (options.user) {
      // Attach to a specific user
      newOptions.user = await Optional.unwrapAsync(
        this.userService.getUserModelForId(options.user),
      );
    }
    return await ConsentDA.CreatePendingConsent(requester, newOptions);
  }

  /**
   * Reads the consent for a request. Uses the claims service. Will throw an exception if the consent is claimed by another user
   * @param consentId
   */
  async readConsentForRequest(consentId: string) {
    const user = await this.userService.getUser();
    const owner = await this.consentClaimService.validateConsentOwner(
      consentId,
      user.id,
    );
    if (owner === 0 || owner === 1) {
      // Claim the consent
      if (owner === 1)
        await this.consentClaimService.userClaimConsent(consentId);
      const consentModel = await ConsentDA.ReadConsent(consentId);
      const orgModel = await Optional.unwrapAsync(
        this.orgService.getOrgForRequester(consentModel.requester),
      );
      const consentDataSchema = await Optional.unwrapAsync(
        ConsentRequestDA.ReadConsentRequest(consentModel.consentRequest),
      );
      return {
        consentModel: consentModel,
        orgModel: orgModel,
        request: consentDataSchema,
      };
    } else {
      throw new HttpException(
        `This consent has been claimed by another user`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
