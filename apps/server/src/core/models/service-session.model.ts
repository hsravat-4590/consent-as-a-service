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

import { Optional, UserModel } from '@consent-as-a-service/domain';
import { LocalDateTime } from '@js-joda/core';

export class ServiceSessionModel {
  user: Optional<UserModel> = Optional.empty(); // If a user is registered for a particular session
  expiry: Optional<LocalDateTime> = Optional.empty(); // If a session has a defined expiry
  org: Optional<string> = Optional.empty(); // OrgId for organisation linked to the session
  lastRequest: Optional<any> = Optional.empty(); // Last httpRequest made by this session
  transaction: Optional<string> = Optional.empty();

  clear() {
    Object.entries(this).forEach(([key]) => {
      if (this[key] instanceof Optional) {
        this[key] = Optional.empty();
      }
    });
  }
}
