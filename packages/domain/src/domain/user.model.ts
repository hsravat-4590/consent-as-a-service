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

import { EmailModel } from "./email.model";
import { ConsentRequestModel } from "./consent-request.model";
import { ConsentModel } from "./consent.model";
import { NameModel } from "./name.model";
import { OrgModel } from "./org.model";
import { decryptString, encryptString } from "encrypt-string";

export interface UserModel {
  id: NonNullable<string>;
  firstName?: NameModel;
  lastName?: NameModel;
  nickname?: string;
  email: NonNullable<EmailModel>;
  emailVerified: NonNullable<boolean>;
  consentCreator?: ConsentCreatorModel;
  consentRequester?: ConsentRequesterModel;
  orgId?: string;
}

export type NonDBUser = Omit<UserModel, "id">;

export interface ConsentCreatorModel {
  id: string;
  consentRequests?: ConsentRequestModel[];
}

export interface ConsentRequesterModel {
  id: string;
  consents?: ConsentModel[];
}

export namespace UserModel {
  export const getDisplayName = (model: UserModel): string => {
    let returnStr = model.nickname;
    if (model.firstName) {
      returnStr = model.firstName.name;
      if (model.lastName) {
        returnStr = `${returnStr} ${model.lastName.name}`;
      }
    }
    return returnStr;
  };

  export const encryptWithOrg = async (
    userModel: UserModel,
    orgModel: OrgModel,
    key: NonNullable<string>
  ) => {
    const { id } = userModel;
    const { orgId } = orgModel;
    // Merge Strings together with Key
    const merged = `${id}//${orgId}`;
    return await encryptString(merged, key);
  };

  export const decryptWithKey = async (
    encrypted: NonNullable<string>,
    key: NonNullable<string>
  ) => {
    const decrypt = await decryptString(encrypted, key);
    const [id, orgId] = decrypt.split("//");
    return { userId: id, orgId: orgId };
  };
}
