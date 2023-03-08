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
import { PrismaClientService } from "../services/prisma-client.service";
import { ConsentRequests } from "@prisma/client";
import { AsyncOptional, Optional } from "@consent-as-a-service/domain";
import { PrismaDa } from "./prisma.da";
import { ConsentRequestDA } from "../../transactions";
import CreateConsentRequestOptions = ConsentRequestDA.CreateConsentRequestOptions;

@singleton()
export class ConsentRequestDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createConsentRequestType(
    txnId: NonNullable<string>,
    options: CreateConsentRequestOptions,
    requesterId: string,
    schemaId: string
  ): Promise<ConsentRequests> {
    return await this.prismaClient.consentRequests.create({
      data: {
        txn: {
          connect: {
            txnId: txnId,
          },
        },
        title: options.title,
        description: options.description,
        dataType: {
          connect: {
            typeId: schemaId,
          },
        },
        callbackUrl: options.callbackUrl.toString(),
        requester: {
          connect: {
            id: requesterId,
          },
        },
      },
    });
  }

  async readConsentRequest(
    requestId: NonNullable<string>
  ): AsyncOptional<ConsentRequests> {
    return Optional.ofNullable(
      await this.prismaClient.consentRequests.findFirst({
        where: {
          consentRequestId: requestId,
        },
      })
    );
  }
}
