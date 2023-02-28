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
import { User } from "@prisma/client";
import { PrismaClientService } from "../services/prisma-client.service";
import { PrismaDa } from "./prisma.da";
import {
  AsyncOptional,
  Optional,
  UserModel,
} from "@consent-as-a-service/domain";

@singleton()
export class UserDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createUser(userModel: UserModel): Promise<User> {
    return await this.prismaClient.user.create({
      data: {
        id: userModel.id,
        firstname: userModel.firstName,
        lastname: userModel.lastName,
        nickname: userModel.nickname,
        email: userModel.email.email,
        emailVerified: userModel.emailVerified,
      },
    });
  }

  async readUser(userId: string): AsyncOptional<User> {
    return Optional.ofNullable(
      await this.prismaClient.user.findFirst({
        where: {
          id: userId,
        },
      })
    );
  }

  async readUsersByEmail(email: string): AsyncOptional<User[]> {
    return Optional.ofNullable(
      await this.prismaClient.user.findMany({
        where: {
          email: email,
        },
      })
    );
  }

  async updateUserDetails(
    userId: string,
    options: UpdatableUserFields
  ): Promise<User> {
    return await this.prismaClient.user.update({
      where: {
        id: userId,
      },
      data: options,
    });
  }

  async deleteUser(userId: string, email: string) {
    return await this.prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

export type UpdatableUserFields = Partial<
  Pick<UserModel, "firstName" | "lastName" | "nickname" | "emailVerified">
>;
