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

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserModel } from '@consent-as-a-service/domain';
import { UserMapper } from '../mappers/user.mapper';
import { UserDA } from '@consent-as-a-service/database-prisma';
import { Auth0Roles } from '../authorisation/rbac/auth0.roles';
import { Auth0RolesService } from './auth0/auth0-roles.service';
import { Role } from 'auth0';

@Injectable()
export class UserService {
  private readonly AUTH0_ISSUER;

  private requestUser: UserModel;

  constructor(
    @Inject(REQUEST) private request: Request,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
    private readonly auth0RolesService: Auth0RolesService,
  ) {
    this.AUTH0_ISSUER = configService.get('AUTH0_ISSUER_URL');
  }

  async getUser(): Promise<UserModel> {
    // Get the user from AuthToken
    // Fetch
    const mUser = await this.getUserFromAuth0();
    const userModelPromise = await this.checkAndAddUserToDB(mUser);
    this.requestUser = userModelPromise;
    return userModelPromise;
  }

  async getUserRoles(): Promise<Role[]> {
    const mUser = await this.getUser();
    return await this.auth0RolesService.getRolesForUser(mUser);
  }

  async upgradeUserRoles(
    requesterOptions: Omit<UserDA.CreateRequesterOptions, 'user'>,
    roles: Auth0Roles[],
  ): Promise<UserModel> {
    // Update roles @ Auth0
    const mUser = await this.getUser();
    await this.auth0RolesService.updateUserRoles(mUser, roles);
    //Add user to requester
    if (roles.includes(Auth0Roles.REQUEST_CONSENTS)) {
      return await UserDA.ElevateUserToRequester({
        displayName: requesterOptions.displayName,
        user: mUser,
      });
    }
    return mUser;
  }

  private getUserFromAuth0(): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.httpService
        .get('https://dev-oixkoo26y6fn8sbd.uk.auth0.com/userinfo', {
          headers: {
            'content-type': 'application/json',
            Authorization: this.request.headers.authorization,
          },
        })
        .subscribe(
          (res) => {
            resolve(this.userMapper.mapUserInfoToUserModel(res.data));
          },
          (error) => {
            console.log('have an error :-(');
            reject(error);
          },
        );
    });
  }

  private async checkAndAddUserToDB(user: UserModel): Promise<UserModel> {
    const userModelOptional = await UserDA.GetUser(user.id);
    if (userModelOptional.isPresent()) {
      return userModelOptional.get();
    }
    return await UserDA.CreateUser(user);
  }
}
