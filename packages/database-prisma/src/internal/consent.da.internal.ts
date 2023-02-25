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
import { Consent, Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientService } from "./prisma-client.service";
import { ConsentModel } from "@consent-as-a-service/domain";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";

@singleton()
export class ConsentDaInternal {
  private readonly prismaClient: PrismaClient;

  constructor(private readonly prismaClientService: PrismaClientService) {
    this.prismaClient = prismaClientService.prismaClient;
  }

  async createConsent(options: CreateConsentOptions): Promise<Consent> {
    return await this.prismaClient.consent.create({
      data: {
        consentRequestId: options.consentRequestId,
        orgid: options.org.orgId,
        consentState: "CREATED",
      },
    });
  }

  async updateConsent(
    id: string,
    options: UpdateConsentOptions
  ): Promise<Consent> {
    const updateData: Prisma.ConsentUpdateInput = {};
    if (options.user) {
      updateData.userid = options.user.id;
    }
    if (options.consentState) {
      updateData.consentState = options.consentState;
    }
    if (options.expiry) {
      updateData.expiry = convertLocalDateTimeToDate(options.expiry);
    }
    return await this.prismaClient.consent.update({
      where: {
        consentId: d,
      },
      data: updateDaa,
    });
  }
}

export type CreateConsentOptions = Pick<
  ConsentModel,
  "expiry" | "consentRequestId" | "org"
>;

export type UpdateConsentOptions = Partial<
  Pick<ConsentModel, "expiry" | "consentState" | "user">
>;
