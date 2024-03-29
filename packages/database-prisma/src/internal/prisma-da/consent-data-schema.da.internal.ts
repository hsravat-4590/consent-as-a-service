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
import { AsyncOptional, Optional } from "@consent-as-a-service/domain";
import { PrismaClientService } from "../services/prisma-client.service";
import { DataType } from "@prisma/client";
import { DataEntry } from "@consent-as-a-service/domain/dist";
import { PrismaDa } from "./prisma.da";

@singleton()
export class ConsentDataSchemaDaInternal extends PrismaDa {
  constructor(prismaClientService: PrismaClientService) {
    super(prismaClientService);
  }

  async createSchemaEntry(entry: DataEntry): Promise<DataType> {
    return await this.prismaClient.dataType.create({
      data: {
        schema: JSON.stringify(entry.schema),
        uiSchema: JSON.stringify(entry.uiSchema),
        data: JSON.stringify(entry.data),
      },
    });
  }

  async readSchema(id: NonNullable<string>): AsyncOptional<DataType> {
    return Optional.ofNullable(
      await this.prismaClient.dataType.findFirst({
        where: {
          typeId: id,
        },
      })
    );
  }
}
