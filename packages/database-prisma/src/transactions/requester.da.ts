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
import { RequesterDaInternal } from "../internal/prisma-da/requester.da.internal";
import { RequesterModel, Validate } from "@consent-as-a-service/domain";
import { mapRequesterToModel } from "../internal/mappers/requester.mapper";
import { Requester } from "@prisma/client";
import ValidateOptional = Validate.ValidateOptional;

export namespace RequesterDA {
  async function getServices(connect: boolean = true) {
    const prismaClientService = container.resolve(PrismaClientService);
    const txnDa = container.resolve(TransactionDaInternal);
    const internalDa = container.resolve(RequesterDaInternal);
    if (connect) {
      await prismaClientService.connect();
    }
    return { prismaClientService, txnDa, internalDa };
  }

  export const ReadRequester = async (
    requesterId: string
  ): Promise<RequesterModel> => {
    const { internalDa } = await getServices();
    const optionalRequester = await internalDa.readRequesterData(requesterId);
    ValidateOptional(optionalRequester, {
      errorMessage: `No requester detail found for id ${requesterId}`,
    });
    return mapRequesterToModel(optionalRequester.get());
  };

  export const UpdateRequesterDetails = async (
    id: string,
    updateRequesterOptions: UpdatableRequesterOptions
  ) => {
    const { internalDa } = await getServices();
    //TODO Update Txn
    //Check for the requester in DB
    const optionalRequester = await internalDa.readRequesterData(id);
    ValidateOptional(optionalRequester, {
      errorMessage: "No Requester Present",
    });
    return mapRequesterToModel(
      await internalDa.updateRequesterDetail(id, updateRequesterOptions)
    );
  };

  export type UpdatableRequesterOptions = Omit<Requester, "id" | "user">;
}
