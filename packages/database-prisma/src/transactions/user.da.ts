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

import { UpdatableUserFieldsInternal } from "../internal/prisma-da/user.da.internal";
import {
  AsyncOptional,
  OrgModel,
  UserModel,
  Validate,
} from "@consent-as-a-service/domain";
import {
  mapConsentCreatorToModel,
  mapConsentRequesterToModel,
  mapUserToModel,
  mapUserToModelWithPrivilege,
} from "../internal/mappers/user.mapper";
import getServices from "../internal/services/get-services";
import ValidateOptional = Validate.ValidateOptional;

export namespace UserDA {
  export const CreateUser = async (
    userModel: UserModel
  ): Promise<UserModel> => {
    const { txnDa, userDa } = getServices();
    // CHECK db for any existing users
    const optionalUsr = await userDa.readUser(userModel.id);
    ValidateOptional(
      optionalUsr,
      {
        errorMessage: "User already exists with this ID",
      },
      false
    );
    // Create a new Txn
    await txnDa.createTxn({
      txnStatus: "CREATED",
    });
    // Create the user
    const createdUsr = await userDa.createUser(userModel);

    return mapUserToModel(createdUsr);
  };

  export const ElevateUserPrivileges = async (
    userModel: UserModel,
    options: {
      consentCreator?: boolean;
      consentRequester?: boolean;
    }
  ): Promise<UserModel> => {
    const { userDa } = getServices();
    // Check the user exists
    const userOptional = await userDa.readUser(userModel.id);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    let user = userOptional.get();
    const requester = await userDa.elevateUserPermissions(user, options);
    const userMdl = mapUserToModel(user);
    userMdl.consentRequester = mapConsentRequesterToModel(
      requester.consentRequester
    );
    userMdl.consentCreator = mapConsentCreatorToModel(requester.consentCreator);
    return mapUserToModel(user);
  };

  export const GetUser = async (userId: string): AsyncOptional<UserModel> => {
    const { userDa } = getServices();
    const userOptional = await userDa.readUser(userId);
    return userOptional.map((it) => mapUserToModel(it));
  };

  export const GetUserWithPrivilege = async (
    userId: string
  ): AsyncOptional<UserModel> => {
    const { userDa } = getServices();
    const wholeUser = await userDa.readUserPrivilegeInclusions(userId);
    return wholeUser.map((it) => mapUserToModelWithPrivilege(it));
  };

  export const UpdateUserDetails = async (
    userId: string,
    options: UpdatableUserFields
  ): Promise<UserModel> => {
    const { userDa } = await getServices();
    //TODO Update the Transaction
    const userOptional = await userDa.readUser(userId);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    return mapUserToModel(await userDa.updateUserDetails(userId, options));
  };

  export const DeleteUser = async (user: UserModel) => {
    // TODO Update Transaction
    const { userDa } = getServices();
    const userOptional = await userDa.readUser(user.id);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    await userDa.deleteUser(user.id, user.email.email);
  };

  export type CreateRequesterOptions = Omit<OrgModel, "id">;

  export type UpdatableUserFields = Omit<
    UpdatableUserFieldsInternal,
    "requesterId"
  >;
}
