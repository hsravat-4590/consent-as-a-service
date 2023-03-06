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

import { Optional } from "./optional";

export namespace Validate {
  export type ValidateErrorHandlers = {
    errorMessage: string;
    errorException: Error;
  };

  function handleValidationError(errorHandler: Partial<ValidateErrorHandlers>) {
    if (errorHandler.errorException) {
      throw errorHandler.errorException;
    } else {
      throw (
        errorHandler.errorMessage ??
        new Error(errorHandler.errorMessage ?? "Invalid State")
      );
    }
  }

  export const ValidateOptional = (
    optional: Optional<any>,
    errorHandler: Partial<ValidateErrorHandlers>,
    expectedState: boolean = true
  ) => {
    if (optional.isPresent() == !expectedState) {
      handleValidationError(errorHandler);
    }
  };

  export const ValidateState = (
    check: () => boolean,
    errorHandler: Partial<ValidateErrorHandlers>
  ) => {
    if (check()) {
      return;
    } else {
      handleValidationError(errorHandler);
    }
  };

  export interface Comparable<T> {
    equals(other: T): boolean;
  }

  export const ValidateEquals = <T extends Comparable<T>>(
    values: T[] | [T, T],
    errorHandler: Partial<ValidateErrorHandlers>
  ) => {
    try {
      let equality = true;
      values.forEach((a) => {
        values.filter((b) => {
          equality = b.equals(a);
          if (!equality) {
            throw Error("Not Equal!");
          }
        });
      });
    } catch (e) {
      handleValidationError(errorHandler);
    }
  };
}
