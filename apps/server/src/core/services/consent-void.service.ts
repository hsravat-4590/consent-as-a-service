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
  ConsentDA,
  ConsentRequestDA,
  TransactionDA,
} from '@consent-as-a-service/database-prisma';
import { Optional, TransactionModel } from '@consent-as-a-service/domain';

@Injectable()
export class ConsentVoidService {
  /**
   * Checks if a consent has any need to be voided
   * @param consentId
   */
  async checkConsentVoided(consentId: NonNullable<string>) {
    const checkTxnVoidState = (transaction: TransactionModel) =>
      transaction.txnStatus === 'VOIDED';
    const consent = await ConsentDA.ReadConsent(consentId);
    let transaction = await TransactionDA.ReadTransactionById(
      consent.transaction,
    );
    if (checkTxnVoidState(transaction)) {
      return true;
    }
    const request = await Optional.unwrapAsync(
      ConsentRequestDA.ReadConsentRequest(consent.consentRequest),
    );
    transaction = await TransactionDA.ReadTransactionById(request.txn);
    return checkTxnVoidState(transaction);
  }

  async voidConsent(consentId: NonNullable<string>) {
    const consent = await ConsentDA.ReadConsent(consentId);
    const txn = await TransactionDA.ReadTransactionById(consent.transaction);
    if (txn.txnStatus === 'VOIDED') {
      return;
    } else {
      await TransactionDA.UpdateTransactionWithId(
        {
          txnStatus: 'VOIDED',
        },
        consent.transaction,
      );
    }
  }

  async voidConsentRequest(requestId: NonNullable<string>) {
    const request = await ConsentRequestDA.ReadConsentRequest(requestId);
    const unwrappedReq = request.orElseRunSync(() => {
      throw new HttpException(
        `Consent Request not found`,
        HttpStatus.NOT_FOUND,
      );
    });
    const txn = await TransactionDA.ReadTransactionById(unwrappedReq.txn);
    if (txn.txnStatus === 'VOIDED') {
      return;
    } else {
      await TransactionDA.UpdateTransactionWithId(
        {
          txnStatus: 'VOIDED',
        },
        unwrappedReq.txn,
      );
    }
  }
}
