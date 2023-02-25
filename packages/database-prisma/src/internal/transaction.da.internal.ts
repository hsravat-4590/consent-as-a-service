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

import { singleton } from "tsyringe";
import { PrismaClientService } from "./prisma-client.service";
import { Optional, TransactionModel } from "@consent-as-a-service/domain";
import { PrismaClient, TxnLog, TxnLog_TxnStatus } from "@prisma/client";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";

@singleton()
export class TransactionDaInternal {
  private readonly prismaClient: PrismaClient;

  constructor(private prismaClientService: PrismaClientService) {
    this.prismaClient = prismaClientService.prismaClient;
  }

  async createTxn(options: CreateTransactionOptions): Promise<TxnLog> {
    return await this.prismaClient.txnLog.create({
      data: {
        TxnStatus: TxnLog_TxnStatus[options.txnStatus],
        datetime: convertLocalDateTimeToDate(options.dateTime),
      },
    });
  }

  async readTxn(txnId: NonNullable<string>): Promise<Optional<TxnLog>> {
    return Optional.ofNullable(
      await this.prismaClient.txnLog.findFirst({
        where: {
          txnId: txnId,
        },
        orderBy: {
          id: "desc",
        },
      })
    );
  }

  async readWholeTxn(
    txnId: NonNullable<string>,
    order: TxnOrderStrategy
  ): Promise<TxnLog[]> {
    return await this.prismaClient.txnLog.findMany({
      where: {
        txnId: txnId,
      },
      orderBy: {
        id: order,
      },
    });
  }

  async updateTxn(
    txnId: NonNullable<string>,
    options: UpdateTransactionOptions
  ): Promise<TxnLog> {
    return await this.prismaClient.txnLog.create({
      data: {
        parent: txnId,
        TxnStatus: TxnLog_TxnStatus[options.txnStatus],
        datetime: convertLocalDateTimeToDate(options.dateTime),
      },
    });
  }
}

export type CreateTransactionOptions = Pick<
  TransactionModel,
  "txnStatus" | "dateTime"
>;

export type UpdateTransactionOptions = Pick<
  TransactionModel,
  "dateTime" | "txnStatus"
>;

export type TxnOrderStrategy = "asc" | "desc";
