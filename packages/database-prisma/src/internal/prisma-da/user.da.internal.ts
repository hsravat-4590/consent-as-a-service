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
import {
  ConsentCreator,
  ConsentRequester as cRequester,
  Org,
  Prisma,
  User,
} from "@prisma/client";
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
        firstname: userModel.firstName.name,
        lastname: userModel.lastName.name,
        nickname: userModel.nickname,
        email: userModel.email.email,
        emailVerified: userModel.emailVerified,
      },
    });
  }

  async readUser(
    userId: string,
    inclusions: ReadInclusions = {}
  ): AsyncOptional<User> {
    return Optional.ofNullable(
      await this.prismaClient.user.findFirst({
        where: {
          id: userId,
        },
        include: buildPrismaInclude(inclusions),
      })
    );
  }

  async readUserPrivilegeInclusions(
    userId: string
  ): AsyncOptional<PrivilegeUser> {
    const userPrivilege = await this.prismaClient.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        consents: false,
        consentRequester: true,
        consentCreator: true,
        org: true,
      },
    });
    return Optional.ofNullable(userPrivilege);
  }

  async readRequester(requesterId: string): AsyncOptional<cRequester> {
    return Optional.ofNullable(
      await this.prismaClient.consentRequester.findFirst({
        where: {
          id: requesterId,
        },
      })
    );
  }

  async readConsentRequesterProp(userId: string) {
    const item = await this.prismaClient.consentRequester.findFirst({
      where: {
        id: userId,
      },
    });
    return Optional.ofNullable(item);
  }

  async readUsersByEmail(
    email: string,
    inclusions: ReadInclusions
  ): AsyncOptional<User[]> {
    return Optional.ofNullable(
      await this.prismaClient.user.findMany({
        where: {
          email: email,
        },
        include: buildPrismaInclude(inclusions),
      })
    );
  }

  async updateUserDetails(
    userId: string,
    options: UpdatableUserFieldsInternal
  ): Promise<User> {
    return await this.prismaClient.user.update({
      where: {
        id: userId,
      },
      data: options,
    });
  }

  async elevateUserPermissions(
    user: User,
    options: {
      consentCreator?: boolean;
      consentRequester?: boolean;
    }
  ): Promise<{
    consentRequester?: cRequester;
    consentCreator?: ConsentCreator;
  }> {
    const data: Prisma.UserUpdateInput = {};
    if (!!options.consentCreator) {
      data.consentCreator = {
        create: {},
      };
    }
    if (!!options.consentRequester) {
      data.consentRequester = {
        create: {},
      };
    }
    return await this.prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: data,
      select: options,
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

export type UpdatableUserFieldsInternal = Partial<
  Pick<UserModel, "firstName" | "lastName" | "nickname" | "emailVerified">
>;

export type ReadInclusions = {
  consents?: Optional<boolean>;
  org?: Optional<boolean>;
  consentRequester?: Optional<boolean>;
  consentCreator?: Optional<boolean>;
};

const buildPrismaInclude = (inclusions: ReadInclusions): Prisma.UserInclude => {
  return {
    consents: readInclusions(inclusions, "consents", false),
    org: readInclusions(inclusions, "org", false),
    consentRequester: readInclusions(inclusions, "consentRequester", false),
    consentCreator: readInclusions(inclusions, "consentCreator", false),
  };
};

const readInclusions = <T, K extends keyof ReadInclusions>(
  inclusions: ReadInclusions,
  key: K,
  defaultValue: boolean
) => {
  const val = inclusions[key];
  if (!!val && val.isPresent()) {
    // Val is Truthy
    return val.get();
  } else {
    return defaultValue;
  }
};

export type PrivilegeUser = User & {
  org: Org;
  consentRequester: cRequester;
  consentCreator: ConsentCreator;
};
