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
} from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { ElevateUserToCRRolesRequest } from '../../../../../packages/domain/src/network/user-permissions.network.model';
import { RequireAuth } from '../../core/auth/require-auth.decorator';
import { Role } from 'auth0';
import { OrgService } from '../../core/services/org.service';

@Controller('user/roles/v1')
export class UserPermissionsController {
  constructor(
    private userService: UserService,
    private orgService: OrgService,
  ) {}

  @Get('elevate')
  @Roles(Auth0Roles.USER)
  async elevateUserToRequester(@Body() request?: ElevateUserToCRRolesRequest) {
    if (request.displayName) {
      // Create the org
      const userModel = await this.userService.hydrateUserWithPrivilege();
      if (!!userModel.orgId) {
        throw new HttpException(
          'User already elevated',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.orgService.createNewOrg({
        email: userModel.email,
        displayName: request.displayName,
      });
      await this.userService.upgradeUserRoles([
        Auth0Roles.REQUEST_CONSENTS,
        Auth0Roles.CREATE_CONSENTS,
      ]);
    } else {
      throw new HttpException('Requires a DisplayName', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('getRoles')
  @RequireAuth()
  async getUserRoles(): Promise<Role[]> {
    return await this.userService.getUserRoles();
  }
}
