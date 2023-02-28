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

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { Auth0RolesService } from '../../services/auth0/auth0-roles.service';
import { UserService } from '../../services/user.service';
import { UserModel } from '@consent-as-a-service/domain';
import { Role } from 'auth0';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private auth0RolesService: Auth0RolesService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const user: UserModel = await this.userService.getUser();
    const userRoles: Awaited<Role[]> =
      await this.auth0RolesService.getRolesForUser(user);
    const userRoleIds = userRoles.map((it) => it.id);
    const hasRoles = [];
    requiredRoles.forEach((r) => {
      const id = r.valueOf();
      if (userRoleIds.includes(id)) {
        hasRoles.push(r);
      }
    });
    return requiredRoles.length === hasRoles.length;
  }
}
