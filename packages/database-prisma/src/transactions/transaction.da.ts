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

import { PrismaClient, TxnLog, TxnLog_TxnStatus } from "@prisma/client";
import {
  Optional,
  TransactionModel,
  ValidateState,
} from "@consent-as-a-service/domain";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";
import { mapTxnLogToModel } from "../mappers/txn-log.mapper";

const prismaClient = new PrismaClient();

export const CreateTransaction = async (
  options: Pick<TransactionModel, "txnStatus" | "dateTime">
): Promise<string> => {
  console.log("Creating a TXN");
  await prismaClient.$connect();
  const created: TxnLog = await prismaClient.txnLog.create({
    data: {
      TxnStatus: TxnLog_TxnStatus[options.txnStatus],
      datetime: convertLocalDateTimeToDate(options.dateTime),
    },
  });
  await prismaClient.$disconnect();
  return created.txnId;
};

export const ReadTransaction = async (
  txnId: string
): Promise<TransactionModel> => {
  console.log("Reading A Txn");
  await prismaClient.$connect();
  const readOut: Optional<TxnLog> = Optional.ofNullable(
    await prismaClient.txnLog.findFirst({
      where: {
        txnId: txnId,
      },
      orderBy: {
        id: "desc",
      },
    })
  );
  if (readOut.isPresent()) {
    return mapTxnLogToModel(readOut.get());
  } else {
    throw new Error("No Entries Returned"); // TODO make a clearer exceptions
  }
};

export const ReadWholeTransaction = async (
  txnId: string,
  order: "asc" | "desc"
): Promise<Array<TransactionModel>> => {
  await prismaClient.$connect();
  let arr = new Array<TransactionModel>();
  const result: TxnLog[] = await prismaClient.txnLog.findMany({
    where: {
      txnId: txnId,
    },
    orderBy: {
      id: order,
    },
  });
  arr = result.map(mapTxnLogToModel);
  return arr;
};

export const UpdateTransaction = async (
  update: Pick<TransactionModel, "dateTime" | "txnStatus" | "txnId">
): Promise<string> => {
  const parent = await ReadTransaction(update.txnId);
  const parentId = parent.txnId;
  console.log(JSON.stringify(update));
  ValidateState(() => parent.txnStatus !== "VOIDED", {
    errorMessage: "Transaction has been voided and therefore cannot be updated",
  });
  await prismaClient.$connect();
  const newRecord: TxnLog = await prismaClient.txnLog.create({
    data: {
      parent: parentId,
      TxnStatus: TxnLog_TxnStatus[update.txnStatus],
      datetime: convertLocalDateTimeToDate(update.dateTime),
    },
  });
  return newRecord.txnId;
};
