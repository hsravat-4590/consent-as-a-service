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

import { DeepLinkedConsent, TxnStatus } from "../domain";
import { mapNullableUrl } from "../util";

export interface UserReadConsentNetworkModel {
  consentId: string;
  title: NonNullable<string>;
  description: NonNullable<string>;
  org: {
    banner?: string;
    logo?: string;
    displayName: string;
    email: string;
  };
  created: string;
  expiry: string;
  consentData: any;
}

export type UserReadConsentNetworkModelWithStatus =
  UserReadConsentNetworkModel & { status: TxnStatus };

export namespace UserReadConsentNetworkModel {
  export const from = (deepLinkedConsent: DeepLinkedConsent) => {
    return {
      consentId: deepLinkedConsent.id,
      title: deepLinkedConsent.consentRequestModel.title,
      description: deepLinkedConsent.consentRequestModel.description,
      org: {
        banner: mapNullableUrl(deepLinkedConsent.orgModel.banner),
        logo: mapNullableUrl(deepLinkedConsent.orgModel.logo),
        displayName: deepLinkedConsent.orgModel.displayName,
        email: deepLinkedConsent.orgModel.email.email,
      },
      created: deepLinkedConsent.consentData.dateCreated.toString(),
      expiry: deepLinkedConsent.expiry.toString(),
      consentData: deepLinkedConsent.consentData,
    } as UserReadConsentNetworkModel;
  };
}
