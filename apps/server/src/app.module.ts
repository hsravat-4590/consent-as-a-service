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

import { Module } from '@nestjs/common';
import { HealthController } from './service/health/health.controller';
import { HealthService } from './core/services/health.service';
import { SessionManagementService } from './core/services/session/session-management.service';
import { TransactionService } from './core/services/transaction.service';
import { DataModelService } from './core/services/datamodel.service';
import { TransactionController } from './service/transaction.controller';
import { AuthModule } from './core/auth/auth.module';
import { UserService } from './core/services/user.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Auth0Guard } from './core/auth/auth0.guard';
import { LoginController } from './service/user/login.controller';
import { UserMapper } from './core/mappers/user.mapper';
import { RolesGuard } from './core/authorisation/rbac/roles.guard';
import { Auth0ClientService } from './core/services/auth0/auth0-client.service';
import { Auth0RolesService } from './core/services/auth0/auth0-roles.service';
import { ConsentRequestController } from './service/consent/consent-request.controller';
import { DAManagementService } from './core/services/da-management.service';
import { ConsentRequestService } from './core/services/consent-request.service';
import { UserPermissionsController } from './service/user/user-permissions.controller';
import { RequesterService } from './core/services/requester.service';

@Module({
  imports: [AuthModule, HttpModule, ConfigModule.forRoot()],
  controllers: [
    TransactionController,
    HealthController,
    LoginController,
    ConsentRequestController,
    UserPermissionsController,
  ],
  providers: [
    HealthService,
    SessionManagementService,
    TransactionService,
    DataModelService,
    UserService,
    Auth0Guard,
    UserMapper,
    RolesGuard,
    Auth0ClientService,
    Auth0RolesService,
    DAManagementService,
    ConsentRequestService,
    RequesterService,
  ],
})
export class AppModule {}
