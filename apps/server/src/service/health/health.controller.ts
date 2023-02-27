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

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { HealthService } from '../../core/services/health.service';
import { HealthStatus } from '@consent-as-a-service/domain';
import { Request } from 'express';
import { UserService } from '../../core/services/user.service';
import { Auth0Guard } from '../../core/auth/auth0.guard';

@Controller('health')
export class HealthController {
  constructor(
    private healthService: HealthService,
    private userService: UserService,
  ) {}

  @Get()
  getHealth(): HealthStatus {
    return this.healthService.getHealthStatus();
  }

  @UseGuards(Auth0Guard)
  @Get('/authenticated')
  async getHealthAuthenticated(@Req() request: Request): Promise<HealthStatus> {
    const health = this.healthService.getHealthStatus();
    // We can assume that we're already authenticated thanks to the guard, and therefore we can manually add the prop

    console.log('User Authenticated!!!');
    health.authenticated = true;
    await this.userService.getUser();
    return health;
  }
}
