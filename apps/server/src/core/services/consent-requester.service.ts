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
import { OrgDa } from '@consent-as-a-service/database-prisma/dist/transactions/org.da';
import { ConsentRequestModel, Optional } from '@consent-as-a-service/domain';

@Injectable()
export class ConsentRequesterService {
  constructor(private userService: UserService) {}

  async checkConsentOwnerMatches(
    requestId: NonNullable<string>,
  ): Promise<ConsentRequesterOwnerType> {
    const userModel = await this.userService.hydrateUserWithPrivilege();
    if (userModel.consentRequester) {
      const requestOpt = await ConsentRequestDA.ReadConsentRequest(requestId);
      const request = requestOpt.orElseRunSync(() => {
        throw new HttpException(
          `No Consent Requests found with this id`,
          HttpStatus.NOT_FOUND,
        );
      });
      if (request.ownerId === userModel.consentRequester.id) {
        return 'OWNER';
      }
      // Check if the org owns it
      const [orgOfRequest, orgOfUser] = await Promise.all([
        Optional.unwrapAsync(OrgDa.GetOrgByRequester(request.ownerId)),
        Optional.unwrapAsync(
          OrgDa.GetOrgByRequester(userModel.consentRequester.id),
        ),
      ]);
      if (orgOfRequest.orgId === orgOfUser.orgId) {
        return 'ORG_OWNED';
      } else {
        return 'OTHER_OWNER';
      }
    }
  }

  async validateOrgOwner(orgId: string, request: string | ConsentRequestModel) {
    // Check if the org owns it
    let requestActual: ConsentRequestModel;
    if (typeof request === 'string') {
      const optional = await ConsentRequestDA.ReadConsentRequest(request);
      requestActual = optional.orElseGetSync(() => {
        throw new HttpException(
          `Consent Request Not Found`,
          HttpStatus.NOT_FOUND,
        );
      });
    } else {
      requestActual = request;
    }
    const [orgOfRequest] = await Promise.all([
      Optional.unwrapAsync(OrgDa.GetOrg(requestActual.ownerId)),
    ]);
    if (orgOfRequest.orgId === orgId) {
      return 'ORG_OWNED';
    } else {
      return 'OTHER_OWNER';
    }
  }
}

export type ConsentRequesterOwnerType = 'OWNER' | 'OTHER_OWNER' | 'ORG_OWNED';
