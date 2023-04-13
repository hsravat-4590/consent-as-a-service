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
import {
  Consent,
  ConsentCreator,
  ConsentRequest,
  TxnLog,
  TxnLog_TxnStatus,
} from "@prisma/client";
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
    options: CreateConsentRequestOptions,
    requesterId: string,
    schemaId: string
  ): Promise<ConsentRequest & { txn: TxnLog }> {
    const reqType = await this.prismaClient.consentRequest.create({
      data: {
        txn: {
          create: {
            TxnStatus: TxnLog_TxnStatus.CREATED,
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
        creator: {
          connect: {
            id: requesterId,
          },
        },
      },
      include: {
        txn: true,
      },
    });
    return reqType;
  }

  async readConsentRequest(
    requestId: NonNullable<string>
  ): AsyncOptional<ConsentRequest> {
    return Optional.ofNullable(
      await this.prismaClient.consentRequest.findFirst({
        where: {
          consentRequestId: requestId,
        },
      })
    );
  }

  async readWholeConsentRequest(
    requestId: NonNullable<string>,
    withConsents: boolean = false
  ): AsyncOptional<WholeConsentRequest> {
    const exec: WholeConsentRequest =
      await this.prismaClient.consentRequest.findFirst({
        where: {
          consentRequestId: requestId,
        },
        include: {
          txn: true,
          creator: true,
          dataType: {
            select: {
              typeId: true,
              schema: true,
              uiSchema: true,
              data: true,
            },
          },
          consents: withConsents,
        },
      });
    return Optional.ofNullable(exec);
  }
}

export type WholeConsentRequest = ConsentRequest & {
  consents: Consent[];
  txn: TxnLog;
  creator: ConsentCreator;
  dataType: { typeId: string; schema: any; uiSchema: any; data: any };
};
