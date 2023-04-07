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

import {
  ConsentCreatorModel,
  ConsentModel,
  ConsentRequesterModel,
  EmailModel,
  UserModel,
} from "@consent-as-a-service/domain";
import { ConsentCreator, ConsentRequester, User } from "@prisma/client";
import { NameModel } from "@consent-as-a-service/domain/dist/domain/name.model";
import { PrivilegeUser } from "../prisma-da/user.da.internal";

export const mapUserModelToORM = (user: UserModel): User => {
  return {
    id: user.id,
    firstname: user.firstName.name,
    lastname: user.lastName.name,
    nickname: user.nickname,
    email: user.email.email,
    emailVerified: user.emailVerified,
    orgId: user.orgId,
  };
};

export const mapUserToModel = (user: User): UserModel => {
  return {
    id: user.id,
    firstname: new NameModel(user.firstname),
    lastname: new NameModel(user.lastname),
    nickname: user.nickname,
    email: new EmailModel(user.email),
    emailVerified: user.emailVerified,
  } as UserModel;
};

export const mapUserToModelWithPrivilege = (user: PrivilegeUser) => {
  return {
    id: user.id,
    firstname: new NameModel(user.firstname),
    lastname: new NameModel(user.lastname),
    nickname: user.nickname,
    email: new EmailModel(user.email),
    emailVerified: user.emailVerified,
    orgId: !!user.org ? user.org.id : null,
    consentRequester: !!user.consentRequester
      ? {
          id: user.consentRequester.id,
          consents: [],
        }
      : null,
    consentCreator: !!user.consentCreator
      ? {
          id: user.consentCreator.id,
          consents: [],
        }
      : null,
  } as UserModel;
};

export const mapConsentRequesterToModel = (
  consentRequester: ConsentRequester,
  consentModels?: ConsentModel[]
) => {
  return {
    id: consentRequester.id,
    consents: !!consentModels ? consentModels : null,
  } as ConsentRequesterModel;
};

export const mapConsentCreatorToModel = (consentCreator: ConsentCreator) => {
  return {
    id: consentCreator.id,
  } as ConsentCreatorModel;
};
