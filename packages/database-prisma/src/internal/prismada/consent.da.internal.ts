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
import { Consent, Prisma } from "@prisma/client";
import { PrismaClientService } from "../services/prisma-client.service";
import { ConsentModel, Optional } from "@consent-as-a-service/domain";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";
import { PrismaDa } from "./prisma.da";

@singleton()
export class ConsentDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createConsent(
    txnId: string,
    options: CreateConsentOptions
  ): Promise<Consent> {
    return await this.prismaClient.consent.create({
      data: {
        txnId: txnId,
        consentRequestId: options.consentRequestId,
        orgid: options.org.orgId,
      },
    });
  }

  async readConsent(options: ReadConsentOptions): Promise<Optional<Consent>> {
    return Optional.ofNullable(
      await this.prismaClient.consent.findFirst({
        where: {
          consentId: options.id,
        },
      })
    );
  }

  async readConsentsMatching(
    options: ReadAllConsentOptions
  ): Promise<Array<Consent>> {
    const readQuery: Prisma.ConsentWhereInput = {
      consentRequestId: options.consentRequestId,
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
    insertData("userid", options.user.id);
    insertData("expiry", convertLocalDateTimeToDate(options.expiry));
    insertData("consentDataId", options.consentDataId);
    return await this.prismaClient.consent.update({
      where: {
        consentId: id,
      },
      data: updateData,
    });
  }
}

export type UpdateConsentOptions = Partial<
  Pick<ConsentModel, "expiry" | "user" | "consentDataId">
>;

export type CreateConsentOptions = Pick<
  ConsentModel,
  "expiry" | "consentRequestId" | "org"
>;

export type ReadConsentOptions = Pick<ConsentModel, "id">;

export type ReadAllConsentOptions = Partial<
  Pick<ConsentModel, "id" | "consentRequestId">
>;
