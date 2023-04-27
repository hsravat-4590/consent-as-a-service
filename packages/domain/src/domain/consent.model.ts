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

import { ConsentRequesterModel, UserModel } from "./user.model";
import { LocalDateTime } from "@js-joda/core";
import { ConsentDataModel } from "./consent-data.model";
import { TransactionModel } from "./transaction.model";
import { ConsentRequestModel } from "./consent-request.model";
import { OrgModel } from "./org.model";

export interface ConsentModel {
  id: NonNullable<string>;
  user?: UserModel;
  expiry: NonNullable<LocalDateTime>;
  consentRequest: NonNullable<string>;
  requester: NonNullable<string>;
  transaction: NonNullable<string>;
  consentData?: ConsentDataModel;
}

export type ConsentModelTxnDeep = ConsentModel & {
  transactionModel: TransactionModel;
};

export type DeepLinkedConsent = ConsentModel & {
  transactionModel: TransactionModel;
  userModel: UserModel;
  consentRequestModel: ConsentRequestModel;
  requesterModel: ConsentRequesterModel;
  orgModel: OrgModel;
};
/**
 * Alias for:
 * Consent & {user: User, consentRequest: ConsentRequest & {dataType: DataType}, requester: ConsentRequester, consentData: ConsentData, txn: TxnLog
 *
 */
export namespace ConsentModel {
  export const applyDeepLinkToConsent = (
    consentModel: ConsentModel,
    transactionModel: TransactionModel,
    userModel: UserModel,
    consentRequestModel: ConsentRequestModel,
    requesterModel: ConsentRequesterModel,
    orgModel: OrgModel
  ): DeepLinkedConsent => {
    return {
      ...consentModel,
      transactionModel,
      userModel,
      consentRequestModel,
      requesterModel,
      orgModel,
    };
  };
  export const applyDeepLinkTransaction = (
    consentModel: ConsentModel,
    transactionModel: TransactionModel
  ): ConsentModelTxnDeep => {
    return {
      ...consentModel,
      transactionModel,
    };
  };
}
