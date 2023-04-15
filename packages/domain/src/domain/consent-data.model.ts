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

import { LocalDateTime } from "@js-joda/core";
import { empty, JsonEncoder, mapNullable, Optional } from "../util";

export interface ConsentDataModel {
  id: NonNullable<string>;
  data: any;
  hash: string;
  schemaId: string;
  dateCreated: LocalDateTime;
}

export const ConsentDataModel = (
  dataSchemaId: string,
  data: any,
  id: Optional<string> = empty()
): Omit<ConsentDataModel, "id"> | ConsentDataModel => {
  const model: any = {
    data: data,
    hash: mapNullable(JsonEncoder.btoa, data),
    schemaId: dataSchemaId,
    dateCreated: LocalDateTime.now(),
  };
  if (id.isPresent()) {
    model.id = id.get();
    return model as ConsentDataModel;
  } else {
    return model as Omit<ConsentDataModel, "id">;
  }
};
