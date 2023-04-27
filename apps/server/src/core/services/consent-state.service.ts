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
import {
  ConsentModel,
  TxnStatus,
  Validate,
} from '@consent-as-a-service/domain';
import {
  ConsentDA,
  ConsentRequestDA,
  TransactionDA,
} from '@consent-as-a-service/database-prisma';
import ValidateOptional = Validate.ValidateOptional;

@Injectable()
export class ConsentStateService {
  async readConsentAndRequestState(consentId: string) {
    const consent = await this.getOrThrowConsent(consentId);
    const states = await Promise.all([
      this.readConsentState(consentId, consent),
      this.readConsentRequestState(consent.consentRequest),
    ]);
    return {
      consent: states[0],
      consentRequest: states[1],
    };
  }
  async readConsentState(
    consentId: string,
    consent?: ConsentModel,
  ): Promise<TxnStatus> {
    if (!consent) {
      consent = await this.getOrThrowConsent(consentId);
    }
    const txn = await TransactionDA.ReadTransactionById(consent.transaction);
    return txn.txnStatus;
  }

  async readConsentRequestState(requestId: string) {
    const consentRequest = await ConsentRequestDA.ReadConsentRequest(requestId);
    const unwrapped = consentRequest.orElseRunSync(() => {
      throw new HttpException(
        `Expected a ConsentRequest`,
        HttpStatus.NOT_FOUND,
      );
    });
    const txn = await TransactionDA.ReadTransactionById(unwrapped.txn);
    return txn.txnStatus;
  }
  async validateConsentInState({
    consentId,
    trackRequest = true,
    blockedStates = [],
  }: {
    consentId: string;
    trackRequest: boolean;
    blockedStates: TxnStatus[];
  }) {
    const consent = await this.getOrThrowConsent(consentId);
    const txn = await TransactionDA.ReadTransactionById(consent.transaction);
    const status = txn.txnStatus;
    if (blockedStates.includes(status)) {
      return false;
    }
    return this.validateConsentRequestInState({
      consentRequestId: consent.consentRequest,
      blockedStates,
    });
  }

  /**
   * Validates if  a consent request is within correct state
   * @param consentRequestId
   * @param blockedStates
   * @return false if state is contained in blocklist
   */
  async validateConsentRequestInState({
    consentRequestId,
    blockedStates = [],
  }: {
    consentRequestId: string;
    blockedStates: TxnStatus[];
  }) {
    const consentRequest = await ConsentRequestDA.ReadConsentRequest(
      consentRequestId,
    );
    ValidateOptional(consentRequest, {
      errorMessage: 'Expected ConsentRequest',
    });
    const unwrapped = consentRequest.get();
    const txn = await TransactionDA.ReadTransactionById(unwrapped.txn);
    const status = txn.txnStatus;
    return !blockedStates.includes(status);
  }

  private async getOrThrowConsent(consentId: string) {
    const consent = await ConsentDA.ReadConsent(consentId);
    if (!consent) {
      throw new HttpException(`Expected a Consent`, HttpStatus.NOT_FOUND);
    }
    return consent;
  }
}
