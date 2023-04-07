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

import { Consent, ConsentRequest, DataType } from "@prisma/client";
import { ConsentRequestModel } from "@consent-as-a-service/domain";
import { mapDataTypeToSchema } from "./schema.mapper";
import { WholeConsentRequest } from "../prisma-da/consent-request.da.internal";
import { mapConsentToModel } from "./consent.mapper";

export const mapConsentRequest = (opt: ConsentRequestMapperOptions) => {
  const requestModel: ConsentRequestModel = {
    callbackUrl: new URL(opt.request.callbackUrl),
    description: opt.request.description,
    ownerId: opt.owner,
    title: opt.request.title,
    id: opt.request.consentRequestId,
    txn: opt.request.txnId,
  };
  return requestModel;
};

export const mapWholeConsentRequest = (req: WholeConsentRequest) => {
  const mdl: ConsentRequestModel = {
    id: req.consentRequestId,
    txn: req.txn.txnId,
    ownerId: req.ownerId,
    title: req.title,
    description: req.description,
    schema: mapDataTypeToSchema(req.dataType),
    callbackUrl: new URL(req.callbackUrl),
    consents: req.consents.map((it) =>
      mapConsentToModel({
        requester: it.requesterId,
        user: undefined,
        consent: it,
        consentRequest: {
          request: req,
          owner: req.ownerId,
          schema: req.dataType,
        },
      })
    ),
  };
};

export type ConsentRequestMapperOptions = {
  request: ConsentRequest;
  owner: string;
  consents?: Array<Consent>;
  schema: DataType;
};
