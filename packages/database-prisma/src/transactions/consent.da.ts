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

import {
  CompleteConsent,
  CreateConsentOptions,
  UpdateConsentOptions,
} from "../internal/prisma-da/consent.da.internal";
import { mapConsentToModel } from "../internal/mappers/consent.mapper";
import {
  ConsentModel,
  ConsentRequesterModel,
  Optional,
  TransactionModel,
  TxnStatus,
  UserModel,
} from "@consent-as-a-service/domain";
import { ConsentRequester, User } from "@prisma/client";
import { mapTxnLogToModel } from "../internal/mappers/txn-log.mapper";
import getServices from "../internal/services/get-services";

export namespace ConsentDA {
  /**
   * Creates a pending consent which can then be completed by a user once they receive the consentId
   */
  export const CreatePendingConsent = async (
    requester: ConsentRequesterModel,
    options: CreateConsentOptions
  ): Promise<ConsentModel> => {
    const { txnDa, consentDa, consentRequestDa, userDa } = getServices();
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
    mConsent,
    txnStatus: TxnStatus,
    updateConsentOptions: UpdateConsentOptions
  ): Promise<ConsentModel> {
    const { txnDa, consentDa, userDa, consentRequestDa } = getServices();
    const updatedTxn = await txnDa.updateTxn(mConsent.txnId, {
      txnStatus: txnStatus,
    });
    const consent = await consentDa.updateConsent(
      mConsent.id,
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

  export const RevokeConsent = async (
    consentId: string
  ): Promise<TransactionModel> => {
    const { txnDa } = await getServices();
    const mConsent = await getConsentAndValidate(consentId);
    const voidedTxn = await txnDa.updateTxn(mConsent.txnId, {
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
    });
  };

  export type AcceptConsentWithDataOptions = Pick<
    ConsentModel,
    "id" | "user" | "expiry" | "consentData" // ConsentData isn't handled here but still checked for state validity
  >;
  export type AcceptConsentOptions = Pick<
    ConsentModel,
    "id" | "user" | "expiry" // ConsentData isn't handled here but still checked for state validity
  >;
}
