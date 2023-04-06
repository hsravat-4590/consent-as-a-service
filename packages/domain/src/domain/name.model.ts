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

import { StringPrimitive } from "./domain.primitive";

/**
 * Domain Primitive for Names. Has Regex detection to manage and enforce names
 * This is an IMMUTABLE primitive so there isn't a way to set the value once it's created
 */
export class NameModel extends StringPrimitive {
  static tryStringValidation = (testSubject: string): boolean =>
    nameRegexICAO.test(testSubject);
  constructor(name: string) {
    super(name);
  }
  get name() {
    return super.it;
  }

  getRegex(): RegExp {
    return nameRegexICAO;
  }
}

/**
 * Simple Regex for validating ICAO passports.
 * @see https://stackoverflow.com/a/45949895/4455077
 */
const nameRegexICAO = new RegExp(/^[a-zA-Z '.-]*$/);
