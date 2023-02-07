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

const stringOf = (args: string | StringTypeArgs): StringType => {
  const isString = (val: any) =>
    typeof val === "string" || val instanceof String;
  if (!isString(args)) {
    return new StringTypeImpl(args as StringTypeArgs);
  } else {
    return new StringTypeImpl({
      default: args as string,
    });
  }
};

type String = {
  [key: string]: StringType;
};

export interface StringType {
  get(options?: StringOptions): string;

  toString(): string;
}

interface StringOptions {
  case: "upper" | "lower";
}

class StringTypeImpl implements StringType {
  readonly upper: string;
  readonly lower: string;
  readonly defaultString: string;

  constructor(options: StringTypeArgs) {
    this.upper = options.upper ?? options.default;
    this.lower = options.lower ?? options.default;
    this.defaultString = options.default;
  }

  get(options?: StringOptions) {
    if (options) {
      return this[options.case];
    } else {
      return this.defaultString;
    }
  }

  public toString = (): string => this.defaultString;
}

type StringTypeArgs = {
  default: NonNullable<string>;
  upper?: string;
  lower?: string;
};

export const Strings: String = {
  signUp: stringOf("Sign Up"),
  signIn: stringOf("Sign In"),
  logOut: stringOf("Logout"),
  caas: stringOf("CAAS"),
  consentAsAService: stringOf("Consent As a Service"),
  profile: stringOf("Profile"),
  dashboard: stringOf({
    default: "Dashboard",
    lower: "dashboard",
  }),
};
