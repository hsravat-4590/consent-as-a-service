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

import { ExecutionContext } from '@nestjs/common';
import { Auth0Roles } from '../../../../src/core/authorisation/rbac/auth0.roles';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { Auth0RolesService } from '../../../../src/core/services/auth0/auth0-roles.service';
import { UserService } from '../../../../src/core/services/user.service';
import { UserModel } from '@consent-as-a-service/domain';
import { Role } from 'auth0';
import { RolesGuard } from '../../../../src/core/authorisation/rbac/roles.guard';

describe('RolesGuard', () => {
  let requiredRoles: Auth0Roles[];
  let mUser: UserModel;
  let mUserRoles: Role[];
  let guard: RolesGuard;

  // beforeEach(async () => await givenDependenciesAreMocked());

  describe('Single Role Test', () => {
    function givenUserAndRole() {
      requiredRoles = [Auth0Roles.ADMIN];
      givenUser();
    }

    it("Should Return false as user doesn't have privilege", async () => {
      givenUserAndRole();
      mUserRoles = [];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(false);
    });
    it('Should Return true as user has the privilege', async () => {
      givenUserAndRole();
      mUserRoles = [
        {
          id: Auth0Roles.ADMIN.valueOf(),
        },
      ];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(true);
    });
  });

  describe('Multi Role Test', () => {
    function givenUserAndRoles() {
      requiredRoles = [Auth0Roles.ADMIN, Auth0Roles.CREATE_CONSENTS];
      givenUser();
    }

    it("Should Return false as user doesn't have privilege", async () => {
      givenUserAndRoles();
      mUserRoles = [];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(false);
    });
    it('Should Return true as user has one of the roles', async () => {
      givenUserAndRoles();
      mUserRoles = [
        {
          id: Auth0Roles.ADMIN.valueOf(),
        },
      ];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(true);
    });
    it('Should Return true as user has both roles', async () => {
      givenUserAndRoles();
      mUserRoles = [
        {
          id: Auth0Roles.ADMIN.valueOf(),
        },
        {
          id: Auth0Roles.CREATE_CONSENTS.valueOf(),
        },
      ];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(true);
    });
    it('Should Return true as user one the roles and a non-required role', async () => {
      givenUserAndRoles();
      mUserRoles = [
        {
          id: Auth0Roles.ADMIN.valueOf(),
        },
        {
          id: Auth0Roles.USER.valueOf(),
        },
      ];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(true);
    });
    it('Should Return false as users roles doesnt match and a non-required role', async () => {
      givenUserAndRoles();
      mUserRoles = [
        {
          id: Auth0Roles.REQUEST_CONSENTS.valueOf(),
        },
        {
          id: Auth0Roles.USER.valueOf(),
        },
      ];
      await givenDependenciesAreMocked();
      givenCanActivateIsSpied();
      await whenCanActivateisCalled_expect(false);
    });
  });

  function givenUser() {
    mUser = {
      email: undefined,
      emailVerified: false,
      nickname: '',
      id: 'TestUserId',
    };
  }

  function givenCanActivateIsSpied() {
    jest.spyOn(guard, 'canActivate');
  }

  async function whenCanActivateisCalled_expect(expectation: boolean) {
    expect(await guard.canActivate(givenExeContext())).toEqual(expectation);
  }
  function givenExeContext(): ExecutionContext {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      getHandler: () => {},
    } as ExecutionContext;
  }

  async function givenDependenciesAreMocked() {
    const reflectorMock = {
      get: <T>() => requiredRoles,
    };
    const userServiceMock = {
      getUser: async () => mUser,
    };
    const auth0ServiceMock = {
      getRolesForUser: async (user: UserModel) => mUserRoles,
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
        {
          provide: Auth0RolesService,
          useValue: auth0ServiceMock,
        },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    guard = new RolesGuard(reflectorMock, auth0ServiceMock, userServiceMock);
  }
});
