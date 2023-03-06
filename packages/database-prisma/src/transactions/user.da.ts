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
import { PrismaClientService } from "../internal/services/prisma-client.service";
import { TransactionDaInternal } from "../internal/prisma-da/transaction.da.internal";
import {
  UpdatableUserFieldsInternal,
  UserDaInternal,
} from "../internal/prisma-da/user.da.internal";
import { RequesterDaInternal } from "../internal/prisma-da/requester.da.internal";
import {
  AsyncOptional,
  Optional,
  UserModel,
  Validate,
} from "@consent-as-a-service/domain";
import { mapUserToModel } from "../internal/mappers/user.mapper";
import { RequesterModel } from "@consent-as-a-service/domain/dist/domain/requester.model";
import ValidateOptional = Validate.ValidateOptional;

export namespace UserDA {
  async function getServices(connect: boolean = true) {
    const prismaClientService = container.resolve(PrismaClientService);
    const txnDa = container.resolve(TransactionDaInternal);
    const internalDa = container.resolve(UserDaInternal);
    const requesterDa = container.resolve(RequesterDaInternal);
    return { prismaClientService, txnDa, internalDa, requesterDa };
  }

  export const CreateUser = async (
    userModel: UserModel
  ): Promise<UserModel> => {
    const { txnDa, internalDa } = await getServices();
    // CHECK db for any existing users
    const optionalUsr = await internalDa.readUser(userModel.id);
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
    const createdUsr = await internalDa.createUser(userModel);

    return mapUserToModel(createdUsr);
  };

  export const ElevateUserToRequester = async (
    createRequester: CreateRequesterOptions
  ): Promise<UserModel> => {
    const { internalDa, requesterDa } = await getServices();
    // Check the user exists
    const userOptional = await internalDa.readUser(createRequester.user.id);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    let user = userOptional.get();
    const requester = await requesterDa.elevateUserToRequester(createRequester);
    user = await internalDa.updateUserDetails(createRequester.user.id, {
      requesterId: requester.id,
    });

    return mapUserToModel(user);
  };

  export const GetUser = async (userId: string): AsyncOptional<UserModel> => {
    const { prismaClientService, txnDa, internalDa, requesterDa } =
      await getServices();
    const userOptional = await internalDa.readUser(userId);
    if (!userOptional.isPresent()) {
      return Optional.empty();
    }
    return Optional.of(mapUserToModel(userOptional.get()));
  };

  export const UpdateUserDetails = async (
    userId: string,
    options: UpdatableUserFields
  ): Promise<UserModel> => {
    const { internalDa } = await getServices();
    //TODO Update the Transaction
    const userOptional = await internalDa.readUser(userId);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    return mapUserToModel(await internalDa.updateUserDetails(userId, options));
  };

  export const DeleteUser = async (user: UserModel) => {
    // TODO Update Transaction
    const { internalDa } = await getServices();
    const userOptional = await internalDa.readUser(user.id);
    ValidateOptional(userOptional, {
      errorMessage: "User doesn't exist in the database",
    });
    await internalDa.deleteUser(user.id, user.email.email);
  };

  export type CreateRequesterOptions = Omit<RequesterModel, "id">;

  export type UpdatableUserFields = Omit<
    UpdatableUserFieldsInternal,
    "requesterId"
  >;
}
