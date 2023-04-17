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
import { ConsentDA } from '@consent-as-a-service/database-prisma';

/**
 * This class manages claims for Consents and assures that uOrgs are honored for consent requests
 */
@Injectable()
export class ConsentClaimService {
  constructor(private userService: UserService) {}
  /**
   * Claims a consent on behalf of a user. Adds the user to the consent record. Once completed, no other users can take the consent
   * @param consentId
   */
  async userClaimConsent(consentId: string) {
    const user = await this.userService.getUser();
    await ConsentDA.AddUserToConsent(consentId, user);
  }

  async checkConsentClaims(consentId: string) {
    const consent = await ConsentDA.ReadConsent(consentId);
    return !!consent.user;
  }

  /**
   * Checks the owner of a consent
   * @param consentId
   * @param userId
   * @returns 0 if the given user owns the consent, 1 if unowned & 2 if owned by someone else
   */
  async validateConsentOwner(
    consentId: string,
    userId: string,
  ): Promise<'USER_OWNED' | 'UNOWNED' | 'OWNED'> {
    const consent = await ConsentDA.ReadConsent(consentId);
    if (consent) {
      if (consent.user) {
        if (consent.user.id === userId) {
          return 'USER_OWNED';
        } else {
          return 'OWNED';
        }
      } else {
        return 'UNOWNED';
      }
    } else {
      throw new HttpException(
        `Cannot find consent with Id ${consentId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
