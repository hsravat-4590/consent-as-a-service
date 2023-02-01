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

import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { Optional, UserModel } from '@consent-as-a-service/domain';
import { Session, SessionData } from 'express-session';
import { LocalDateTime } from '@js-joda/core';
import { ServiceSessionModel } from '../../models/service-session.model';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class SessionManagementService {
  readonly serviceSessionModel: ServiceSessionModel;
  private readonly session: Session & Partial<SessionData>;

  constructor(@Inject(REQUEST) private request: Request) {
    this.session = this.getSessionForRequest();
    this.serviceSessionModel = this.session.serviceSessionModel;
  }

  getUserForRequest(): UserModel {
    const userModel: Optional<UserModel> = this.serviceSessionModel.user;
    return userModel.get();
  }

  isUserPresentOnRequest(): boolean {
    return this.serviceSessionModel.user.isPresent();
  }

  isOrgOnRequest(): boolean {
    return this.serviceSessionModel.org.isPresent();
  }

  validateSession(): Promise<ValidateSessionResponse> {
    return new Promise<ValidateSessionResponse>((resolve, reject) => {
      const now = LocalDateTime.now();
      const expiry = this.serviceSessionModel.expiry.orElse(LocalDateTime.MIN); // Expire by default
      now.isBefore(expiry) ? resolve('OK') : reject('EXPIRED');
    });
  }

  private getSessionForRequest(): Session & Partial<SessionData> {
    const session = this.request.session;
    console.log(`Session is ${JSON.stringify(session)}`); //TODO Remove
    if (!Object.hasOwn(session, 'serviceSessionModel')) {
      session.serviceSessionModel = new ServiceSessionModel();
    }
    return session;
  }
}

export type ValidateSessionResponse = 'OK' | 'NEW' | 'UNDEFINED' | 'EXPIRED';
