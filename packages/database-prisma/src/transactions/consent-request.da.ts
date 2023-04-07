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

import { ConsentRequest, TxnLog } from "@prisma/client";
import {
  AsyncOptional,
  ConsentCreatorModel,
  ConsentRequestModel,
  DataEntry,
  DataSchema,
  Optional,
} from "@consent-as-a-service/domain";
import { mapConsentRequest } from "../internal/mappers/consent-request.mapper";
import getServices from "../internal/services/get-services";
import NotImplementedError from "@consent-as-a-service/domain/dist/errors/not-implemented.error";

export namespace ConsentRequestDA {
  /**
   * High Level abstraction for creating consent requests on the server.
   * Will take a Consent Model and will also handle setting up a new txn for this request
   * Consent Requests are **Immutable** and cannot be updated once set.
   * @returns
   */
  export const CreateConsentRequestType = async (
    options: CreateConsentRequestOptions,
    dataSchema: Array<DataEntry<any>>,
    requester: ConsentCreatorModel
  ): Promise<CreateConsentResultType> => {
    console.log("Creating a new Consent Request Type");
    const { consentRequestDa, consentDataSchemaDa } = getServices();
    const schemaEntry = await consentDataSchemaDa.createSchemaEntry(dataSchema);
    const schema = {
      id: schemaEntry.typeId,
      entries: dataSchema,
    } as DataSchema;

    const dbR: ConsentRequest & { txn: TxnLog } =
      await consentRequestDa.createConsentRequestType(
        {
          title: options.title,
          description: options.description,
          callbackUrl: options.callbackUrl,
        },
        requester.id,
        schema.id
      );
    return {
      txnId: dbR.txn.chainId,
      consentRequestId: dbR.consentRequestId,
      schemaId: schemaEntry.typeId,
    } as CreateConsentResultType;
  };

  /**
   * Reads out the txn with a deep link to a TxnModel
   * @param consentRequestId
   * @param withConsents NOT Yet implemented. withConsents provides functionality to link in Consents with the ConsentRequest
   * @constructor
   */
  export const ReadConsentRequest = async (
    consentRequestId: NonNullable<string>,
    withConsents: boolean = false
  ): AsyncOptional<ConsentRequestModel> => {
    if (withConsents) {
      throw new NotImplementedError(
        "Read ConsentRequest with consents has not been implemented"
      );
    }
    console.log("Reading a ConsentRequest");
    const { txnDa, consentRequestDa, consentDataSchemaDa, userDa } =
      getServices();
    const req: Optional<ConsentRequest> =
      await consentRequestDa.readConsentRequest(consentRequestId);
    let requester = null;
    if (!req.isPresent()) {
      return Optional.empty();
    }
    requester = req.get();
    //Get the Data
    const schema = await Optional.unwrapAsync(
      consentDataSchemaDa.readSchema(req.get().dataId)
    );
    const txnModel: Optional<TxnLog> = await txnDa.readTxn(req.get().txnId);
    console.log(
      `Presence of txnModel is ${txnModel.isPresent()} and the schema txnId is ${
        req.get().txnId
      }`
    );
    const owner = await Optional.unwrapAsync(
      userDa.readRequester(requester.id)
    );

    //Map to Domain
    return Optional.of(
      mapConsentRequest({
        request: req.get(),
        owner: owner.userId,
        schema: schema,
      })
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
    const { txnDa, consentRequestDa } = getServices();
    const consentRequestModel: Optional<ConsentRequest> =
      await consentRequestDa.readConsentRequest(consentRequestId);

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

  export type CreateConsentRequestOptions = Pick<
    ConsentRequestModel,
    "title" | "description" | "callbackUrl"
  >;
  export type CreateConsentResultType = {
    txnId: string;
    consentRequestId: string;
    schemaId: string;
  };
}
