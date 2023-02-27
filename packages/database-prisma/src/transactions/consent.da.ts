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
import { PrismaClientService } from "../internal/prisma-client.service";
import { TransactionDaInternal } from "../internal/transaction.da.internal";
import {
  ConsentDaInternal,
  CreateConsentOptions,
  UpdateConsentOptions,
} from "../internal/consent.da.internal";
import { ConsentRequestDaInternal } from "../internal/consent-request.da.internal";
import { mapConsentToModel } from "../mappers/consent.mapper";
import {
  ConsentModel,
  Optional,
  TransactionModel,
  TxnStatus,
  UserModel,
} from "@consent-as-a-service/domain";
import { TxnLog } from "@prisma/client";
import { mapTxnLogToModel } from "../mappers/txn-log.mapper";

async function getServices(connect: boolean = true) {
  const prismaClientService = container.resolve(PrismaClientService);
  const txnDa = container.resolve(TransactionDaInternal);
  const internalDa = container.resolve(ConsentDaInternal);
  const requestDa = container.resolve(ConsentRequestDaInternal);
  if (connect) {
    await prismaClientService.connect();
  }
  return { prismaClientService, txnDa, internalDa, requestDa };
}

/**
 * Creates a pending consent which can then be completed by a user once they receive the consentId
 */
export const CreatePendingConsent = async (
  options: CreateConsentOptions
): Promise<ConsentModel> => {
  const { prismaClientService, txnDa, internalDa, requestDa } =
    await getServices();
  // Validate against consent request
  const consentRequest = await requestDa.readConsentRequest(
    options.consentRequestId
  );
  if (!consentRequest.isPresent()) {
    throw new Error(
      "Error: Cannot create a pending consent without a valid ConsentRequest"
    );
  }
  // Create a Txn for this consent
  const txn = await txnDa.createTxn({
    txnStatus: "CREATED",
  });
  // Create record with provided options
  const consent = await internalDa.createConsent(txn.txnId, options);
  // Map (Requires Deep Map to Txn)
  await prismaClientService.disconnect();
  return mapConsentToModel(consent, txn);
  // Return ConsentModel with completed values
};

const getConsentAndValidate = async (
  consentId: string,
  validateVoided: boolean = true
) => {
  const { internalDa, txnDa } = await getServices(false);
  const optional = await internalDa.readConsent({
    id: consentId,
  });
  if (!optional.isPresent()) {
    throw new Error("Error: Cannot update a non-existent consent");
  }
  const consent = optional.get();
  const txn: Optional<TxnLog> = await txnDa.readTxn(consent.txnId);
  if (!txn.isPresent()) {
    throw new Error("Error: Cannot update a consent with invalid transaction");
  }
  if (validateVoided && txn.get().TxnStatus === "VOIDED") {
    throw new Error("Error: Cannot update a consent with invalid transaction");
  }
  return consent;
};

async function updateTxnConsentAndMapBack(
  mConsent,
  txnStatus: TxnStatus,
  updateConsentOptions: UpdateConsentOptions,
  shouldDisconnect: boolean = true
): Promise<ConsentModel> {
  const { txnDa, internalDa, prismaClientService } = await getServices(false);
  const updatedTxn = await txnDa.updateTxn(mConsent.txnId, {
    txnStatus: txnStatus,
  });
  const updatedConsent = await internalDa.updateConsent(
    mConsent.id,
    updateConsentOptions
  );
  if (shouldDisconnect) {
    await prismaClientService.disconnect();
  }
  return mapConsentToModel(mConsent, updatedTxn);
}

export const AddUserToConsent = async (
  consentId: string,
  user: UserModel
): Promise<ConsentModel> => {
  const { prismaClientService, txnDa, internalDa, requestDa } =
    await getServices();
  const mConsent = await getConsentAndValidate(consentId);
  if (mConsent.userid) {
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
  const { txnDa, prismaClientService } = await getServices();
  const mConsent = await getConsentAndValidate(consentId);
  const voidedTxn = await txnDa.updateTxn(mConsent.txnId, {
    txnStatus: "VOIDED",
  });
  await prismaClientService.disconnect();
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
  const { txnDa } = await getServices();
  const consent = await getConsentAndValidate(consentId, !allowVoided);
  const txn = await txnDa.readTxn(consent.txnId);
  return mapConsentToModel(consent, txn.get());
};

export type AcceptConsentWithDataOptions = Pick<
  ConsentModel,
  "consentDataId" | "id" | "user" | "org" | "expiry" | "consentData" // ConsentData isn't handled here but still checked for state validity
>;
export type AcceptConsentOptions = Pick<
  ConsentModel,
  "id" | "user" | "org" | "expiry" // ConsentData isn't handled here but still checked for state validity
>;
