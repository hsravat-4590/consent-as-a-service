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
import { Auth0ClientService } from './auth0-client.service';
import { UserModel } from '@consent-as-a-service/domain';
import { Role } from 'auth0';
import { Auth0Roles } from '../../authorisation/rbac/auth0.roles';
import { userModelToObjectWithId } from '../../util/auth0.util';

@Injectable()
export class Auth0RolesService {
  constructor(private readonly auth0Client: Auth0ClientService) {}

  async getRolesForUser(userModel: UserModel): Promise<Role[]> {
    return await this.auth0Client.managementClient.getUserRoles(
      userModelToObjectWithId(userModel),
    );
  }

  async updateUserRoles(
    userModel: UserModel,
    roles: Auth0Roles[],
  ): Promise<void> {
    await this.auth0Client.managementClient.assignRolestoUser(
      userModelToObjectWithId(userModel),
      {
        roles: this.mapAuth0Roles(roles),
      },
    );
  }

  private mapAuth0Roles(roles: Auth0Roles[]) {
    return roles.map((it) => it.valueOf());
  }
}
