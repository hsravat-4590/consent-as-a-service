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
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { ConsentStateService } from '../../core/services/consent-state.service';
import { ConsentClaimService } from '../../core/services/consent-claim.service';
import { UserService } from '../../core/services/user.service';
import { ConsentDA } from '@consent-as-a-service/database-prisma';
import { ConsentVoidService } from '../../core/services/consent-void.service';
import { ConsentRequesterService } from '../../core/services/consent-requester.service';

/**
 * Controller which manages the state of a given consent
 */
@Controller('/consent/state/v1')
export class ConsentStateController {
  constructor(
    private consentStateService: ConsentStateService,
    private consentClaimService: ConsentClaimService,
    private consentVoidService: ConsentVoidService,
    private consentRequesterService: ConsentRequesterService,
    private userService: UserService,
  ) {}
  @Roles(Auth0Roles.REQUEST_CONSENTS, Auth0Roles.USER, Auth0Roles.ORG_USER)
  @Get(':consentId')
  async getStateOfConsent(@Param('consentId') consentId: string) {
    const mUser = await this.userService.hydrateUserWithPrivilege();
    // Check if user owns the consent
    const consentOwner = await this.consentClaimService.validateConsentOwner(
      consentId,
      mUser.id,
    );
    const consent = await ConsentDA.ReadConsent(consentId);

    const checkAndReturnState = async () => {
      await this.consentStateService.readConsentState(consentId);
      return await this.consentStateService.readConsentAndRequestState(
        consentId,
      );
    };

    if (consentOwner === 'USER_OWNED') {
      return await checkAndReturnState();
    } else {
      // Check if requester is on the consent
      const requester = consent.requester;
      if (mUser.consentRequester) {
        // Check consent requester
        if (mUser.consentRequester.id === requester) {
          // Check state
          return await checkAndReturnState();
        }
      } else {
        throw new HttpException(
          `Not authorised to read this consent`,
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  @Roles(Auth0Roles.REQUEST_CONSENTS)
  @Get('void/request/:requestId')
  async voidConsentRequest(@Param('requestId') requestId: string) {
    // Check the user has authority over the consent
    const authority =
      await this.consentRequesterService.checkConsentOwnerMatches(requestId);
    if (authority === 'OWNER') {
      await this.consentVoidService.voidConsentRequest(requestId);
    } else {
      this.throwForbiddenException();
    }
  }

  @Roles(Auth0Roles.USER, Auth0Roles.ORG_USER)
  @Get('void/consent/:consentId')
  async voidConsent(@Param('consentId') consentId: string) {
    const user = await this.userService.getUser();
    const owner = await this.consentClaimService.validateConsentOwner(
      consentId,
      user.id,
    );
    if (owner === 'USER_OWNED') {
      await this.consentVoidService.voidConsent(consentId);
    } else {
      this.throwForbiddenException();
    }
  }

  @Roles(Auth0Roles.REQUEST_CONSENTS)
  @Post('void/consent/:orgId/:consentId')
  async voidConsentAsOrg(
    @Param('orgId') orgId: string,
    @Param('consentId') consentId: string,
  ) {
    const owner = await this.consentClaimService.validateConsentOrg(
      consentId,
      orgId,
    );
    if (owner) {
      await this.consentVoidService.voidConsent(consentId);
    } else {
      this.throwForbiddenException();
    }
  }

  private throwForbiddenException() {
    throw new HttpException(
      `You are unable to access this resource`,
      HttpStatus.FORBIDDEN,
    );
  }
}
