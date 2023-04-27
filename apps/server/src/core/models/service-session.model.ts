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

import { ConsentModel, Optional } from '@consent-as-a-service/domain';
import { LocalDateTime } from '@js-joda/core';

export class ServiceSessionModel {
  completeConsentLookupCursor: Optional<ConsentModel> = Optional.empty();
  fulfilledConsentLookupCursor: Optional<ConsentModel> = Optional.empty();

  sessionExpiry: Optional<LocalDateTime> = Optional.of(
    LocalDateTime.now().plusMinutes(60),
  );

  clear() {
    Object.entries(this).forEach(([key]) => {
      if (this[key] instanceof Optional) {
        this[key] = Optional.empty();
      }
    });
  }

  clearSome<K extends keyof ServiceSessionModel>(...models: K[]) {
    models.forEach((m) => {
      if (this[m] instanceof Optional) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[m] = Optional.empty();
      }
    });
  }
}

declare module 'express-session' {
  interface SessionData {
    sessionModel: ServiceSessionModel;
  }
}
