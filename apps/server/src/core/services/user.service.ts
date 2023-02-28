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

@Injectable()
export class UserService {
  private readonly AUTH0_ISSUER;

  private requestUser: UserModel;

  constructor(
    @Inject(REQUEST) private request: Request,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
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
