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

import { AsyncOptional, ConsentDataModel } from "@consent-as-a-service/domain";
import getServices from "../internal/services/get-services";
import { ConsentData } from "@prisma/client";
import { mapConsentDataToModel } from "../internal/mappers/consent-data.mapper";

export namespace ConsentDataDA {
  export const CreateDataEntry = async (
    entryModel: CreateDataEntryModel
  ): Promise<ConsentDataModel> => {
    const { consentDataDa } = getServices();
    const consentData: ConsentData = await consentDataDa.create(entryModel);
    return {
      id: consentData.id,
      ...entryModel,
    };
  };

  export const ReadDataEntry = async (
    id: NonNullable<string>
  ): AsyncOptional<ConsentDataModel> => {
    const { consentDataDa } = getServices();
    const data = await consentDataDa.read(id);
    return data.map((it) => mapConsentDataToModel(it));
  };

  export type CreateDataEntryModel = Omit<ConsentDataModel, "id">;
}
