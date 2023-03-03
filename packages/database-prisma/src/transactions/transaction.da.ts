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
  TransactionDaInternal,
  TxnOrderStrategy,
  UpdateTransactionOptions,
} from "../internal/prisma-da/transaction.da.internal";
import "reflect-metadata";
import { container } from "tsyringe";
import { PrismaClientService } from "../internal/services/prisma-client.service";
import ValidateState = Validate.ValidateState;

export namespace TransactionDA {
  import ValidateOptional = Validate.ValidateOptional;

  async function getServices(connect: boolean = true) {
    const prismaClientService = container.resolve(PrismaClientService);
    const internalDa = container.resolve(TransactionDaInternal);
    return { prismaClientService, internalDa };
  }
  export const CreateTransaction = async (
    options: CreateTransactionOptions
  ): Promise<string> => {
    console.log("Creating a TXN");
    const { internalDa } = await getServices();
    const newTxn = await internalDa.createTxn(options);
    return newTxn.txnId;
  };

  export const ReadTransaction = async (
    txnId: string
  ): Promise<TransactionModel> => {
    console.log("Reading A Txn");
    const { internalDa } = await getServices();
    const readOut: Optional<TxnLog> = await internalDa.readTxn(txnId);
    ValidateOptional(readOut, {
      errorMessage: "No Entries Returned",
    });
    return mapTxnLogToModel(readOut.get());
  };

  export const ReadWholeTransaction = async (
    txnId: string,
    order: TxnOrderStrategy
  ): Promise<Array<TransactionModel>> => {
    const { internalDa } = await getServices();
    let arr: TransactionModel[];
    const result: TxnLog[] = await internalDa.readWholeTxn(txnId, order);
    arr = result.map(mapTxnLogToModel);
    return arr;
  };

  export const UpdateTransaction = async (
    update: UpdateTransactionOptions,
    txnId: NonNullable<string>
  ): Promise<string> => {
    const { internalDa } = await getServices();
    const parent = await internalDa.readTxn(txnId);
    if (parent.isPresent()) {
      ValidateState(() => parent.get().TxnStatus !== TxnLog_TxnStatus.VOIDED, {
        errorMessage:
          "Transaction has been voided and therefore cannot be updated",
      });
    } else {
      new Error("Transaction cannot be updated as there are no parents");
    }
    console.log(JSON.stringify(update));
    const newRecord: TxnLog = await internalDa.updateTxn(txnId, update);
    return newRecord.txnId;
  };
}
