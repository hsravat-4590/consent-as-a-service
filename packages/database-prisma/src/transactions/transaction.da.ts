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

import { TxnLog, TxnLog_TxnStatus } from "@prisma/client";
import {
  Optional,
  TransactionModel,
  Validate,
} from "@consent-as-a-service/domain";
import { mapTxnLogToModel } from "../internal/mappers/txn-log.mapper";
import {
  CreateTransactionOptions,
  TxnOrderStrategy,
  UpdateTransactionOptions,
} from "../internal/prisma-da/transaction.da.internal";
import "reflect-metadata";
import getServices from "../internal/services/get-services";
import ValidateState = Validate.ValidateState;

export namespace TransactionDA {
  import ValidateOptional = Validate.ValidateOptional;

  export const CreateTransaction = async (
    options: CreateTransactionOptions
  ): Promise<string> => {
    const { txnDa } = getServices();
    const newTxn = await txnDa.createTxn(options);
    return newTxn.chainId;
  };

  export const ReadTransaction = async (
    chainId: string
  ): Promise<TransactionModel> => {
    const { txnDa } = getServices();
    const readOut: Optional<TxnLog> = await txnDa.readTxn(chainId);
    ValidateOptional(readOut, {
      errorMessage: "No Entries Returned",
    });
    return mapTxnLogToModel(readOut.get());
  };

  export const ReadTransactionById = async (txnId: string) => {
    const { txnDa } = getServices();
    const mTxn = await txnDa.readTxnsWithId(txnId);
    ValidateOptional(mTxn, {
      errorMessage: "No Entries Returned",
    });
    return ReadTransaction(mTxn.get().chainId);
  };

  export const ReadWholeTransaction = async (
    txnId: string,
    order: TxnOrderStrategy
  ): Promise<Array<TransactionModel>> => {
    const { txnDa } = getServices();
    let arr: TransactionModel[];
    const result: TxnLog[] = await txnDa.readWholeTxn(txnId, order);
    arr = result.map(mapTxnLogToModel);
    return arr;
  };

  export const UpdateTransaction = async (
    update: UpdateTransactionOptions,
    txnId: NonNullable<string>
  ): Promise<string> => {
    const { txnDa } = getServices();
    const parent = await txnDa.readTxn(txnId);
    if (parent.isPresent()) {
      ValidateState(() => parent.get().TxnStatus !== TxnLog_TxnStatus.VOIDED, {
        errorMessage:
          "Transaction has been voided and therefore cannot be updated",
      });
    } else {
      new Error("Transaction cannot be updated as there are no parents");
    }
    console.log(JSON.stringify(update));
    const newRecord: TxnLog = await txnDa.updateTxn(txnId, update);
    return newRecord.txnId;
  };

  export const UpdateTransactionWithId = async (
    update: UpdateTransactionOptions,
    txnId
  ) => {
    const { txnDa } = getServices();
    const mTxn = await txnDa.readTxnsWithId(txnId);
    return UpdateTransaction(update, mTxn.get().chainId);
  };
}
