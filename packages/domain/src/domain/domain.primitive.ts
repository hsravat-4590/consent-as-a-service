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

import { Validate } from "../util";
import ValidationException = Validate.ValidationException;

export abstract class DomainPrimitive<T> {
  private readonly _it: T;

  protected get it() {
    return this._it;
  }

  protected constructor(t: T) {
    Validate.ValidateState(() => this.validationPredicate(t), {
      errorException: this.getValidationException(),
    });
    this._it = t;
  }

  protected abstract validationPredicate(it: T): boolean;

  protected getValidationException(): Error {
    return new ValidationException();
  }
}

export abstract class StringPrimitive extends DomainPrimitive<
  NonNullable<string>
> {
  protected constructor(primitive: NonNullable<string>) {
    super(primitive);
  }

  protected validationPredicate(it: NonNullable<string>): boolean {
    return this.getRegex().test(it);
  }

  abstract getRegex(): RegExp;

  protected getValidationException(): Error {
    return new ValidationException("Provided string does not match regex");
  }
}
