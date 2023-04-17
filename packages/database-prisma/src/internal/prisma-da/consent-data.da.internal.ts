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

import { injectable } from "tsyringe";
import { PrismaClientService } from "../services/prisma-client.service";
import { PrismaDa } from "./prisma.da";
import { AsyncOptional, Optional } from "@consent-as-a-service/domain";
import { convertLocalDateTimeToDate } from "../mappers/util-type.mapper";
import { ConsentData } from "@prisma/client";
import { ConsentDataDA } from "../../transactions";

@injectable()
export class ConsentDataDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async create(dataModel: ConsentDataDA.CreateDataEntryModel) {
    return await this.prismaClient.consentData.create({
      data: {
        data: dataModel.data,
        dateCreated: convertLocalDateTimeToDate(dataModel.dateCreated),
        hash: dataModel.hash,
        dataType: {
          connect: {
            typeId: dataModel.schemaId,
          },
        },
      },
    });
  }

  async read(id: string): AsyncOptional<ConsentData> {
    return Optional.ofNullable(
      await this.prismaClient.consentData.findFirst({
        where: {
          id: id,
        },
      })
    );
  }

  async delete(id: string) {
    await this.prismaClient.consentData.delete({
      where: {
        id: id,
      },
    });
  }
}
