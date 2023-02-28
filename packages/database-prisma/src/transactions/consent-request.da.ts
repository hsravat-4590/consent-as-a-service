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

import { ConsentRequests, TxnLog } from "@prisma/client";
import {
  AsyncOptional,
  ConsentRequestModel,
  DataEntry,
  DataSchema,
  Optional,
} from "@consent-as-a-service/domain";
import { mapConsentRequestToModel } from "../internal/mappers/consent-request.mapper";
import { container } from "tsyringe";
import { PrismaClientService } from "../internal/services/prisma-client.service";
import { TransactionDaInternal } from "../internal/prisma-da/transaction.da.internal";
import {
  ConsentRequestDaInternal,
  CreateConsentRequestOptions,
  CreateConsentResultType,
} from "../internal/prisma-da/consent-request.da.internal";
import { ConsentDataSchemaDaInternal } from "../internal/prisma-da/consent-data-schema.da.internal";

export namespace ConsentRequestDA {
  async function getServices() {
    const prismaClientService = container.resolve(PrismaClientService);
    const txnDa = container.resolve(TransactionDaInternal);
    const internalDa = container.resolve(ConsentRequestDaInternal);
    const schemaDa = container.resolve(ConsentDataSchemaDaInternal);
    return { prismaClientService, txnDa, internalDa, schemaDa };
  }

  /**
   * High Level abstraction for creating consent requests on the server.
   * Will take a Consent Model and will also handle setting up a new txn for this request
   * Consent Requests are **Immutable** and cannot be updated once set.
   * @returns
   */
  export const CreateConsentRequestType = async (
    options: CreateConsentRequestOptions,
    dataSchema: Array<DataEntry<any>>
  ): Promise<CreateConsentResultType> => {
    console.log("Creating a new Consent Request Type");
    const { prismaClientService, txnDa, internalDa, schemaDa } =
      await getServices();
    await prismaClientService.connect();
    const txn = await txnDa.createTxn({
      txnStatus: "CREATED",
    });
    const schemaEntry = await schemaDa.createSchemaEntry(dataSchema);
    const schema = {
      id: schemaEntry.typeId,
      entries: dataSchema,
    } as DataSchema;

    const dbR: ConsentRequests = await internalDa.createConsentRequestType(
      txn.txnId,
      {
        title: options.title,
        description: options.description,
        schema: schema,
        callbackUrl: options.callbackUrl,
      }
    );

    return {
      txnId: txn.txnId,
      consentRequestId: dbR.consentRequestId,
      schemaId: schemaEntry.typeId,
    } as CreateConsentResultType;
  };

  /**
   * Reads out the txn with a deep link to a TxnModel
   * @param consentRequestId
   * @constructor
   */
  export const ReadConsentRequest = async (
    consentRequestId: NonNullable<string>
  ): AsyncOptional<ConsentRequestModel> => {
    console.log("Reading a ConsentRequest");
    const { prismaClientService, txnDa, internalDa, schemaDa } =
      await getServices();
    await prismaClientService.connect();
    const req: Optional<ConsentRequests> = await internalDa.readConsentRequest(
      consentRequestId
    );

    if (!req.isPresent()) {
      return Optional.empty();
    }
    //Get the Data
    const schema = await schemaDa.readSchema(req.get().dataId);
    const txnModel: Optional<TxnLog> = await txnDa.readTxn(req.get().txnId);
    //Map to Domain
    return Optional.of(
      mapConsentRequestToModel(req.get(), txnModel.get(), schema.get())
    );
  };

  /**
   * Voids the Consent Request (makes permanently unusable) via updating its Txn to VOIDED
   * @param consentRequestId
   * @constructor
   */
  export const VoidConsentRequest = async (
    consentRequestId: NonNullable<string>
  ): Promise<string> => {
    const { prismaClientService, txnDa, internalDa } = await getServices();
    await prismaClientService.connect();
    const consentRequestModel: Optional<ConsentRequests> =
      await internalDa.readConsentRequest(consentRequestId);

    if (consentRequestModel.isPresent()) {
      const txnId = consentRequestModel.get().txnId;
      const newTxn = await txnDa.updateTxn(txnId, {
        txnStatus: "VOIDED",
      });
      return newTxn.txnId;
    } else {
      throw new Error(
        "Unable to void request, no matching transaction present"
      );
    }
  };
}
