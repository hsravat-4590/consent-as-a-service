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
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ConsentRequestService } from '../../core/services/consent-request.service';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { UserService } from '../../core/services/user.service';
import { Validate } from '@consent-as-a-service/domain';
import { ConsentLifecycleService } from '../../core/services/consent-lifecycle.service';
import { ConsentRequestUriService } from '../../core/services/ui/consent-request-uri.service';

@Controller('consent/new/v1')
export class NewConsentController {
  constructor(
    private consentRequestService: ConsentRequestService,
    private userService: UserService,
    private consentLifecycleService: ConsentLifecycleService,
    private consentRequestUriService: ConsentRequestUriService,
  ) {}

  @Post(':consentId')
  @Roles(Auth0Roles.REQUEST_CONSENTS)
  async requestNewConsentOpen(@Param('consentId') consentRequestId: string) {
    // Validate the consentID. This automatically handles validation too
    // Get the requester
    const userWithPrivilege = await this.userService.hydrateUserWithPrivilege();
    const consent = await this.consentLifecycleService.createPendingConsent(
      consentRequestId,
      userWithPrivilege.consentRequester,
    );
    // Create the URL
    return {
      request_url: this.consentRequestUriService.buildRequestURL(consent),
      consentId: consent.id,
    };
  }

  @Post(':consentId/:userId')
  @Roles(Auth0Roles.REQUEST_CONSENTS)
  async requestConsentForUser(
    @Param('consentId') consentRequestId: string,
    @Param('userId') userId: string,
  ) {
    // Validate the userId
    const userExists = await this.userService.validateUserExistsById(userId);
    Validate.ValidateState(
      () => {
        return userExists;
      },
      {
        errorException: new HttpException(
          `No user found with Id: ${userId}`,
          HttpStatus.NOT_FOUND,
        ),
      },
    );
    const request = await this.consentRequestService.getConsentRequest({
      id: consentRequestId,
    });
  }
}
