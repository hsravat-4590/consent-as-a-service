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

import { CompleteConsent } from "../internal/prisma-da/consent.da.internal";
import { mapConsentToModel } from "../internal/mappers/consent.mapper";
import {
  ConsentModel,
  ConsentRequesterModel,
  DeepLinkedConsent,
  Optional,
  TransactionModel,
  TxnStatus,
  UserModel,
} from "@consent-as-a-service/domain";
import { ConsentRequester, User } from "@prisma/client";
import { mapTxnLogToModel } from "../internal/mappers/txn-log.mapper";
import getServices from "../internal/services/get-services";
import { mapUserToModel } from "../internal/mappers/user.mapper";
import { mapRequesterToModel } from "../../dist/internal/mappers/requester.mapper";
import { mapConsentRequest } from "../internal/mappers/consent-request.mapper";
import { mapOrgToModel } from "../internal/mappers/org.mapper";

export namespace ConsentDA {
  /**
   * Creates a pending consent which can then be completed by a user once they receive the consentId
   */
  export const CreatePendingConsent = async (
    requester: ConsentRequesterModel,
    options: CreateConsentOptions
  ): Promise<ConsentModel> => {
    const { consentDa, consentRequestDa, userDa } = getServices();
    const requesterFromDa: Optional<ConsentRequester> =
      await userDa.readRequester(requester.id);
    const requesterReal = requesterFromDa.orElseRunSync(() => {
      throw new Error(
        `Error: Cannot create a pending consent. Can't find Requester`
      );
    });
    // Validate against consent request
    const consentRequest = await consentRequestDa.readWholeConsentRequest(
      options.consentRequest
    );
    if (!consentRequest.isPresent()) {
      throw new Error(
        "Error: Cannot create a pending consent without a valid ConsentRequest"
      );
    }
    let user: User = null;
    if (options.user) {
      user = await Optional.unwrapAsync(userDa.readUser(options.user.id));
    }
    options.requester = requesterReal.id;
    options.consentRequest = consentRequest.get().consentRequestId;
    // Create record with provided options
    const consent = await consentDa.createConsent(options);
    return mapConsentToModel({
      consent,
      consentRequest: {
        request: consentRequest.get(),
        owner: consentRequest.get().ownerId,
        schema: consentRequest.get().dataType,
      },
      requester: requesterReal.id,
      user,
    });
  };

  const getConsentAndValidate = async (
    consentId: string,
    validateVoided: boolean = true
  ): Promise<CompleteConsent> => {
    const { consentDa } = getServices();
    const mConsent = await consentDa.readConsentWithOptions(consentId, true);
    if (!mConsent.isPresent()) {
      throw new Error("Error: Cannot update a non-existent consent");
    }
    const consent = mConsent.get();
    const txn = consent.txn;
    if (validateVoided && txn.TxnStatus === "VOIDED") {
      throw new Error(
        "Error: Cannot update a consent with invalid transaction"
      );
    }
    return consent;
  };

  async function updateTxnConsentAndMapBack(
    mConsent: CompleteConsent,
    txnStatus: TxnStatus,
    updateConsentOptions: UpdateConsentOptions
  ): Promise<ConsentModel> {
    const { txnDa, consentDa, userDa, consentRequestDa } = getServices();
    const updatedTxn = await txnDa.updateTxn(mConsent.txn.chainId, {
      txnStatus: txnStatus,
    });
    const consent = await consentDa.updateConsent(
      mConsent.consentId,
      updateConsentOptions
    );
    // Get the user
    const user = await Optional.unwrapAsync(userDa.readUser(consent.userId));
    // Get the requester
    const requester = await Optional.unwrapAsync(
      userDa.readRequester(consent.requesterId)
    );
    // Get the request model
    const consentRequest = await Optional.unwrapAsync(
      consentRequestDa.readWholeConsentRequest(consent.requestId)
    );
    return mapConsentToModel({
      consent,
      consentRequest: {
        request: consentRequest,
        owner: consentRequest.ownerId,
        schema: consentRequest.dataType,
      },
      requester: requester.id,
      user,
    });
  }

  export const AddUserToConsent = async (
    consentId: string,
    user: UserModel
  ): Promise<ConsentModel> => {
    const mConsent = await getConsentAndValidate(consentId);
    if (mConsent.userId) {
      throw new Error("Error: Consent is already linked to a user");
    }
    return await updateTxnConsentAndMapBack(mConsent, "IN_PROGRESS", {
      user: user,
    });
  };

  export const AcceptConsentWithData = async (
    options: AcceptConsentWithDataOptions
  ): Promise<ConsentModel> => {
    const mConsent = await getConsentAndValidate(options.id);
    return await updateTxnConsentAndMapBack(mConsent, "FULFILLED", options);
  };

  export const AcceptConsentWithoutData = async (
    options: AcceptConsentOptions
  ): Promise<ConsentModel> => {
    const mConsent = await getConsentAndValidate(options.id);
    return await updateTxnConsentAndMapBack(mConsent, "ACCEPTED", options);
  };

  export const RejectConsentRequest = async (consentId: string) => {
    const { txnDa } = getServices();

    const mConsent = await getConsentAndValidate(consentId);
    const rejectedTxn = await txnDa.updateTxn(mConsent.txn.chainId, {
      txnStatus: "REJECTED",
    });
    return mapTxnLogToModel(rejectedTxn);
  };

  export const RevokeConsent = async (
    consentId: string
  ): Promise<TransactionModel> => {
    const { txnDa } = getServices();
    const mConsent = await getConsentAndValidate(consentId);
    const voidedTxn = await txnDa.updateTxn(mConsent.txn.chainId, {
      txnStatus: "VOIDED",
    });
    return mapTxnLogToModel(voidedTxn);
  };

  /**
   * Reads a consent from a given ID
   * @param consentId unique id given to the consent
   * @param allowVoided States if Voided consents should throw an error (defaults to true)
   */
  export const ReadConsent = async (
    consentId: string,
    allowVoided: boolean = false
  ): Promise<ConsentModel> => {
    const { consentRequestDa, userDa } = getServices();
    const consent = await getConsentAndValidate(consentId, !allowVoided);
    const consentRequest = await Optional.unwrapAsync(
      consentRequestDa.readWholeConsentRequest(consent.requestId, false)
    );
    const requester = await Optional.unwrapAsync(
      userDa.readConsentRequesterProp(consent.requesterId)
    );
    let user: User = null;
    if (consent.userId) {
      user = await Optional.unwrapAsync(userDa.readUser(consent.userId));
    }
    return mapConsentToModel({
      consent,
      consentRequest: {
        request: consentRequest,
        owner: consentRequest.ownerId,
        schema: consentRequest.dataType,
      },
      requester: requester.id,
      user,
      data: consent.consentData,
    });
  };

  export const ReadAllConsentsForUser = async (
    mdl: UserModel,
    cursor?: string
  ): Promise<DeepLinkedConsent[]> => {
    const { consentDa, txnDa } = getServices();
    const consents = await consentDa.readConsentsForUserWithPagination(mdl.id, {
      take: 10,
      cursor: !!cursor
        ? {
            consentId: cursor,
          }
        : undefined,
    });
    let newArr = [];
    for (const consent of consents) {
      const evenNewerModel: DeepLinkedConsent =
        ConsentModel.applyDeepLinkToConsent(
          mapConsentToModel({
            consent,
            consentRequest: {
              request: consent.consentRequest,
              owner: consent.consentRequest.ownerId,
              schema: consent.consentRequest.dataType,
            },
            requester: consent.requester.id,
            user: consent.user,
            data: consent.consentData,
          }),
          mapTxnLogToModel(
            await Optional.unwrapAsync(txnDa.readTxn(consent.txn.chainId))
          ),
          mapUserToModel(consent.user),
          mapConsentRequest({
            request: consent.consentRequest,
            owner: consent.requester.id,
            schema: consent.consentRequest.dataType,
          }),
          mapRequesterToModel(consent.requester),
          mapOrgToModel(consent.requester.user.org)
        );
      newArr.push(evenNewerModel);
    }
    return newArr;
  };
  export type AcceptConsentWithDataOptions = Pick<
    ConsentModel,
    "id" | "user" | "expiry" | "consentData" // ConsentData isn't handled here but still checked for state validity
  >;
  export type AcceptConsentOptions = Pick<
    ConsentModel,
    "id" | "user" | "expiry" // ConsentData isn't handled here but still checked for state validity
  >;
  export type UpdateConsentOptions = Partial<
    Pick<ConsentModel, "expiry" | "user" | "consentData">
  >;

  export type CreateConsentOptions = Omit<ConsentModel, "transaction">;

  export type ReadConsentWithModelOptions = Pick<ConsentModel, "id">;

  export type ReadAllConsentOptions = Partial<
    Partial<Pick<ConsentModel, "id" | "consentRequest" | "user">>
  >;
}
