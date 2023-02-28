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
import { PrismaClientService } from "../services/prisma-client.service";
import { RequesterModel } from "@consent-as-a-service/domain/dist/domain/requester.model";
import { Requester } from "@prisma/client";
import { AsyncOptional, Optional } from "@consent-as-a-service/domain";

@singleton()
export class RequesterDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async elevateUserToRequester(
    options: CreateRequesterOptions
  ): Promise<Requester> {
    return await this.prismaClient.requester.create({
      data: {
        displayname: options.displayName,
        banner: options.banner,
        logo: options.logo,
      },
    });
  }

  async readRequesterData(requesterId: string): AsyncOptional<Requester> {
    return Optional.ofNullable(
      await this.prismaClient.requester.findFirst({
        where: {
          id: requesterId,
        },
      })
    );
  }

  async updateRequesterDetail(
    id: string,
    options: UpdatableRequesterOptions
  ): Promise<Requester> {
    return await this.prismaClient.requester.update({
      where: {
        id: id,
      },
      data: options,
    });
  }

  async deleteRequester(id: string): Promise<Requester> {
    return await this.prismaClient.requester.delete({
      where: {
        id: id,
      },
    });
  }
}

export type CreateRequesterOptions = Omit<RequesterModel, "id">;

export type UpdatableRequesterOptions = Omit<Requester, "id" | "user">;
