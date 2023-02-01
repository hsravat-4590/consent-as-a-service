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

import { Injectable } from '@nestjs/common';
import { LocalDateTime } from '@js-joda/core';
import {
  CreateTransaction,
  ReadTransaction,
  ReadWholeTransaction,
  UpdateTransaction,
} from '@consent-as-a-service/database-prisma';
import { SessionManagementService } from './session/session-management.service';
import {
  Optional,
  TransactionModel,
  TxnStatus,
  ValidateState,
} from '@consent-as-a-service/domain';

/**
 * Helper class to manage Transactions and Manage TxnLinks
 */
@Injectable()
export class TransactionService {
  constructor(private sessionManagementService: SessionManagementService) {}

  /**
   * Creates a new Transaction and assigns the txnId to the session for future use & linking
   */
  async createTransaction(enableSessionLinking = true): Promise<string> {
    const now = LocalDateTime.now();
    const transaction = await CreateTransaction({
      dateTime: now,
      txnStatus: 'CREATED',
    });
    if (!enableSessionLinking) {
      this.sessionManagementService.serviceSessionModel.transaction =
        Optional.of(transaction);
    }
    return transaction;
  }

  /**
   * Reads the latest entry for a given transactionId and returns a TransactionModel
   * @param transactionId Will try to use Session if not provided
   */
  async readTransaction(transactionId: string): Promise<TransactionModel> {
    return await ReadTransaction(transactionId);
  }

  async readAllTransactions(
    transactionId: string = this.getTransactionFromSession(),
    order: 'asc' | 'desc',
  ): Promise<Array<TransactionModel>> {
    return ReadWholeTransaction(transactionId, order);
  }

  async updateTransaction(
    txnId: string,
    newStatus: Omit<TxnStatus, 'CREATED'>,
    enableSessionLinking = true,
  ): Promise<string> {
    const newId = await UpdateTransaction({
      txnId: txnId,
      dateTime: LocalDateTime.now(),
      txnStatus: newStatus as TxnStatus, //Ignore Omit here
    });
    if (!enableSessionLinking) {
      this.sessionManagementService.serviceSessionModel.transaction =
        Optional.of(newId);
    }
    return newId;
  }

  async voidTransaction(
    txnId: string = this.getTransactionFromSession(),
    enableSessionLinking = true,
  ): Promise<string> {
    return await this.updateTransaction(txnId, 'VOIDED', enableSessionLinking);
  }

  private getTransactionFromSession(): string {
    const transactionOptional =
      this.sessionManagementService.serviceSessionModel.transaction;
    ValidateState(transactionOptional.isPresent, {
      errorMessage: 'Expected a Transaction on the Session',
    });
    return transactionOptional.get();
  }
}
