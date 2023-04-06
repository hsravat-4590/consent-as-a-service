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

import { Injectable } from '@nestjs/common';
import {
  AsyncOptional,
  OrgModel,
  UserModel,
} from '@consent-as-a-service/domain';
import { OrgDa } from '@consent-as-a-service/database-prisma/dist/transactions/org.da';
import { UserService } from './user.service';

@Injectable()
export class OrgService {
  constructor(private userService: UserService) {}

  async createNewOrg(
    orgDetails: Pick<OrgModel, 'email' | 'displayName' | 'banner' | 'logo'>,
  ): Promise<{ orgModel: OrgModel; userModel: UserModel }> {
    const user = await this.userService.hydrateUserWithPrivilege();
    if (user.orgId) {
      throw new Error('User already part of an organisation');
    }
    return await OrgDa.CreateOrg(user, {
      banner: orgDetails.banner,
      displayName: orgDetails.displayName,
      email: orgDetails.email,
      logo: orgDetails.logo,
    });
  }

  async getOrg(orgId: string): AsyncOptional<OrgModel> {
    return await OrgDa.GetOrg(orgId);
  }
}
