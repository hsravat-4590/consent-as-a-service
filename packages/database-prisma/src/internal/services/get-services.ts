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

import { container } from "tsyringe";
import { PrismaClientService } from "./prisma-client.service";
import { TransactionDaInternal } from "../prisma-da/transaction.da.internal";
import { UserDaInternal } from "../prisma-da/user.da.internal";
import { ConsentDaInternal } from "../prisma-da/consent.da.internal";
import { ConsentDataSchemaDaInternal } from "../prisma-da/consent-data-schema.da.internal";
import { ConsentRequestDaInternal } from "../prisma-da/consent-request.da.internal";
import { ConsentRequesterDaInternal } from "../prisma-da/consent-requester.da.internal";
import { OrgDaInternal } from "../prisma-da/org.da.internal";

export default function getServices() {
  const prismaClientService = container.resolve(PrismaClientService);
  const txnDa = container.resolve(TransactionDaInternal);
  const userDa = container.resolve(UserDaInternal);
  const consentDa = container.resolve(ConsentDaInternal);
  const consentDataSchemaDa = container.resolve(ConsentDataSchemaDaInternal);
  const consentRequestDa = container.resolve(ConsentRequestDaInternal);
  const consentRequesterDa = container.resolve(ConsentRequesterDaInternal);
  const orgDa = container.resolve(OrgDaInternal);
  return {
    prismaClientService,
    txnDa,
    userDa,
    consentDa,
    consentDataSchemaDa,
    consentRequestDa,
    consentRequesterDa,
    orgDa,
  };
}
