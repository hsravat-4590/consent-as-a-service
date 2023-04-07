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
import {
  Consent,
  ConsentData,
  ConsentRequest,
  ConsentRequester,
  Prisma,
  TxnLog,
  TxnLog_TxnStatus,
  User,
} from "@prisma/client";
import { PrismaClientService } from "../services/prisma-client.service";
import { AsyncOptional, Optional } from "@consent-as-a-service/domain";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";
import { PrismaDa } from "./prisma.da";
import { ConsentDA } from "../../transactions";
import CreateConsentOptions = ConsentDA.CreateConsentOptions;
import ReadConsentOptions = ConsentDA.ReadConsentOptions;
import ReadAllConsentOptions = ConsentDA.ReadAllConsentOptions;
import UpdateConsentOptions = ConsentDA.UpdateConsentOptions;

@singleton()
export class ConsentDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createConsent(options: CreateConsentOptions): Promise<Consent> {
    console.log(`Running with Options: ${JSON.stringify(options)}`);
    let userArgs: Prisma.UserCreateNestedOneWithoutConsentsInput;
    if (options.user) {
      userArgs = {
        connect: {
          id: options.user.id,
        },
      };
    }
    return await this.prismaClient.consent.create({
      data: {
        txn: {
          create: {
            TxnStatus: TxnLog_TxnStatus.CREATED,
          },
        },
        requester: {
          connect: {
            id: options.requester,
          },
        },
        user: userArgs,
        consentRequest: {
          connect: {
            consentRequestId: options.consentRequest,
          },
        },
        expiry: convertLocalDateTimeToDate(options.expiry),
      },
    });
  }

  async readConsent(options: ReadConsentOptions): AsyncOptional<Consent> {
    return Optional.ofNullable(
      await this.prismaClient.consent.findFirst({
        where: {
          consentId: options.id,
        },
      })
    );
  }

  /**
   * Reads a consent and includes txn, user, consentRequest, requester & consentData
   */
  async readConsentWithOptions(
    consentId: string,
    includeData: boolean = false
  ): AsyncOptional<CompleteConsent> {
    const consent = await this.prismaClient.consent.findFirst({
      where: {
        consentId: consentId,
      },
      include: {
        txn: true,
        user: true,
        consentRequest: {
          include: {
            creator: true,
            dataType: true,
            consents: false,
            txn: false,
          },
        },
        requester: true,
        consentData: includeData,
      },
    });
    return Optional.ofNullable(consent);
  }

  async readConsentsMatching(
    options: ReadAllConsentOptions
  ): Promise<Array<Consent>> {
    const readQuery: Prisma.ConsentWhereInput = {
      consentRequest: {
        consentRequestId: options.consentRequest,
      },
      consentId: options.id,
    };
    return await this.prismaClient.consent.findMany({
      where: readQuery,
    });
  }

  async updateConsent(
    id: string,
    options: UpdateConsentOptions
  ): Promise<Consent> {
    const updateData: Prisma.ConsentUpdateInput = {};
    const insertData = <
      K extends keyof Prisma.ConsentUpdateInput,
      V extends (typeof updateData)[K]
    >(
      key: K,
      value?: V
    ) => {
      if (value) {
        updateData[key] = value;
      }
    };
    if (options.user) {
      insertData("user", {
        connect: {
          id: options.user.id,
        },
      });
    }
    if (options.expiry) {
      insertData("expiry", convertLocalDateTimeToDate(options.expiry));
    }
    if (options.consentData) {
      insertData("consentData", {
        connect: {
          id: options.consentData.id,
        },
      });
    }
    return await this.prismaClient.consent.update({
      where: {
        consentId: id,
      },
      data: updateData,
    });
  }
}

export type CompleteConsent = Consent & {
  user: User;
  consentRequest: ConsentRequest;
  requester: ConsentRequester;
  consentData: ConsentData;
  txn: TxnLog;
};
