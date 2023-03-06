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

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import {
  ElevateUserToCRRolesRequest,
  UpdateRequesterMetaRequest,
} from '../../core/models/user-permissions.network.model';
import { RequesterService } from '../../core/services/requester.service';
import { RequesterDA } from '@consent-as-a-service/database-prisma/dist/transactions/requester.da';
import { RequireAuth } from '../../core/auth/require-auth.decorator';
import { Role } from 'auth0';
import UpdatableRequesterOptions = RequesterDA.UpdatableRequesterOptions;

@Controller('user/roles/v1')
export class UserPermissionsController {
  constructor(
    private userService: UserService,
    private requesterService: RequesterService,
  ) {}

  @Get('elevate')
  @Roles(Auth0Roles.USER)
  async elevateUserToRequester(@Body() request?: ElevateUserToCRRolesRequest) {
    if (request.displayName) {
      await this.userService.upgradeUserRoles(request, [
        Auth0Roles.REQUEST_CONSENTS,
        Auth0Roles.CREATE_CONSENTS,
      ]);
    } else {
      throw new HttpException('Requires a DisplayName', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('updateMetadata')
  @Roles(Auth0Roles.REQUEST_CONSENTS)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRequesterMeta(@Body() request?: UpdateRequesterMetaRequest) {
    if (request.banner || request.logo) {
      const user = await this.userService.getUser();
      const requester = await this.requesterService.getRequester(
        user.requesterId,
      );
      const updatedData: UpdatableRequesterOptions = {};
      const setIfNotNull = (
        obj: keyof UpdateRequesterMetaRequest,
        key: keyof UpdatableRequesterOptions,
      ) => {
        if (request[obj]) {
          updatedData[key] = request[obj];
        }
      };
      setIfNotNull('banner', 'banner');
      setIfNotNull('logo', 'logo');
      await this.requesterService.updateRequesterMetadata(
        requester,
        updatedData,
      );
    }
  }

  @Get('getRoles')
  @RequireAuth()
  async getUserRoles(): Promise<Role[]> {
    return await this.userService.getUserRoles();
  }
}
