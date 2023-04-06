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
import { PrismaDa } from "./prisma.da";
import { Org, User } from "@prisma/client";
import { PrismaClientService } from "../services/prisma-client.service";
import {
  AsyncOptional,
  Optional,
  OrgModel,
} from "@consent-as-a-service/domain";

@singleton()
export class OrgDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createOrg(orgModel: Omit<OrgModel, "orgId">) {
    return await this.prismaClient.org.create({
      data: {
        displayname: orgModel.displayName,
        banner: orgModel.banner?.toString(),
        logo: orgModel.logo?.toString(),
        email: orgModel.email?.email,
      },
    });
  }

  async updateOrgDetails(data: {
    orgId: string;
    model: UpdateOrgFieldsInternal;
  }) {
    return await this.prismaClient.org.update({
      where: {
        id: data.orgId,
      },
      data: data.model,
    });
  }

  updateUsers(orgId: string): UserUpdater {
    const context = this;
    const internalCls = class implements UserUpdater {
      private readonly newUsers: Array<string> = [];
      private readonly removedUsers: Array<string> = [];
      public readonly addUser = (userId: string) => {
        this.newUsers.push(userId);
        return this;
      };
      public readonly removeUser = (userId: string) => {
        this.removedUsers.push(userId);
        return this;
      };
      public readonly commit = async () => {
        const disconnectOrgFromUsers = context.prismaClient.user.updateMany({
          where: {
            orgId: orgId,
          },
          data: {
            orgId: null,
          },
        });
        const existingUsers: { users: User[] } =
          await context.prismaClient.org.findFirst({
            where: {
              id: orgId,
            },
            select: {
              users: true,
            },
          });
        let users = existingUsers.users;
        // Remove All "TO REMOVE USERS"
        users = users.filter(
          (it) => this.removedUsers.findIndex((obj) => it.id === obj) != -1
        );
        let allUserIdMap: Array<string> = users.map((u) => u.id);
        this.newUsers.push(...allUserIdMap);
        //remove duplicates
        const updatableUsers = this.newUsers.filter(
          (elem, index, self) => index === self.indexOf(elem)
        );
        // Add any new users
        const newUserPromises = [];
        updatableUsers.forEach((userId) => {
          const promise = context.prismaClient.user.update({
            where: {
              id: userId,
            },
            data: {
              org: {
                connect: {
                  id: orgId,
                },
              },
            },
          });
          newUserPromises.push(promise);
        });
        await context.prismaClient.$transaction([
          disconnectOrgFromUsers,
          ...newUserPromises,
        ]);
      };
    };
    return new internalCls();
  }

  async readOrg(orgId: string): AsyncOptional<Org> {
    return Optional.ofNullable(
      await this.prismaClient.org.findFirst({
        where: {
          id: orgId,
        },
      })
    );
  }
}

interface UserUpdater {
  addUser(userId: string): UserUpdater;
  removeUser(userId: string): UserUpdater;
  commit(): Promise<void>;
}

export type UpdateOrgFieldsInternal = {
  banner: string;
  logo: string;
};
