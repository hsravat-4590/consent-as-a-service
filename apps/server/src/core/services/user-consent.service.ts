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

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionManagementService } from './session/session-management.service';
import {
  ConsentModel,
  ConsentModelTxnDeep,
  DeepLinkedConsent,
  Optional,
  UserModel,
} from '@consent-as-a-service/domain';
import { ConsentDA } from '@consent-as-a-service/database-prisma';

@Injectable()
export class UserConsentService {
  constructor(
    private userService: UserService,
    private sessionManagementService: SessionManagementService,
  ) {}

  async getNextConsentsForUser(userId?: string) {
    const user = await this.getUserForAction(Optional.ofNullable(userId));
    // Check if the session exists or respawn
    // await this.sessionManagementService.validateAndRespawn();
    // Get cursor
    const cursor =
      this.sessionManagementService.serviceSessionModel
        .completeConsentLookupCursor;
    return this.getNextConsentsInternal(user, cursor);
  }

  async getNextFulfilledConsentsForUser(userId?: string) {
    const user = await this.getUserForAction(Optional.ofNullable(userId));
    // Check if the session exists or respawn
    // await this.sessionManagementService.validateAndRespawn();
    // Get cursor
    const cursor =
      this.sessionManagementService.serviceSessionModel
        .fulfilledConsentLookupCursor;
    const filter: ConsentFilterFunction = (value: DeepLinkedConsent) =>
      value.transactionModel.txnStatus === 'FULFILLED';
    return this.getNextConsentsInternal(user, cursor, Optional.of(filter));
  }

  clearSession() {
    this.sessionManagementService.serviceSessionModel.clearSome(
      'completeConsentLookupCursor',
      'fulfilledConsentLookupCursor',
    );
  }

  private async getNextConsentsInternal(
    user: UserModel,
    cursor: Optional<ConsentModel>,
    filter: Optional<ConsentFilterFunction> = Optional.empty(),
  ) {
    const cursorId: string = cursor.map((it) => it.id).orElse(undefined);
    const consents = await ConsentDA.ReadAllConsentsForUser(user, cursorId);
    if (filter.isPresent()) {
      return consents.filter(filter.get());
    } else {
      return consents;
    }
  }

  private async getUserForAction(userId: Optional<string>) {
    return await userId
      .map(async (id) => await this.validateUser(id))
      .orElseGetSync(async () => await this.userService.getUser());
  }
  private async validateUser(userId: NonNullable<string>): Promise<UserModel> {
    const userOptional = await this.userService.getUserModelForId(userId);
    return userOptional.orElseRunSync(() => {
      throw new NotFoundException('User Not Found');
    });
  }
}

type ConsentFilterFunction = (
  value: ConsentModelTxnDeep,
  index: number,
  array: ConsentModelTxnDeep[],
) => boolean;
