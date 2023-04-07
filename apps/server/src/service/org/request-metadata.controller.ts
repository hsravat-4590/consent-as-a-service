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
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrgService } from '../../core/services/org.service';
import { Auth0Roles } from '../../core/authorisation/rbac/auth0.roles';
import { Roles } from '../../core/authorisation/rbac/roles.decorator';
import { UpdateRequesterMetaRequest } from '../../core/models/user-permissions.network.model';
import { UserService } from '../../core/services/user.service';
import { Validate } from '@consent-as-a-service/domain';
import { OrgDa } from '@consent-as-a-service/database-prisma/dist/transactions/org.da';
import { RequestMetadataNetworkModel } from '../../core/models/request-metadata.network.model';
import UpdatableOrgFields = OrgDa.UpdatableOrgFields;

@Controller('org/metadata/v1')
export class RequestMetadataController {
  constructor(
    private orgService: OrgService,
    private userService: UserService,
  ) {}

  @Get(':orgId')
  async getOrgMetadata(@Param() params): Promise<RequestMetadataNetworkModel> {
    const orgId = params.orgId;
    Validate.ValidateState(() => !!orgId, {
      errorMessage: `Requires an orgId`,
    });
    const org = await this.orgService.getOrg(orgId);
    const orgModel = org.orElseRunSync(() => {
      throw new Error('Could not find an Organisation with this id');
    });
    return {
      displayName: orgModel.displayName,
      banner: orgModel.banner.toString(),
      logo: orgModel.logo.toString(),
      contact: {
        email: orgModel.email.email,
      },
    };
  }

  @Post('edit')
  @Roles(Auth0Roles.CREATE_CONSENTS, Auth0Roles.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMetadata(@Body() request?: UpdateRequesterMetaRequest) {
    if (request.banner || request.logo) {
      const user = await this.userService.hydrateUserWithPrivilege();
      const mOrg = user.orgId;
      Validate.ValidateState(() => !!mOrg, {
        errorMessage: `There isn't an Org set to the requesting user`,
      });
      const updatedData: UpdatableOrgFields = {};
      const setIfNotNull = (
        obj: keyof UpdateRequesterMetaRequest,
        key: keyof UpdatableOrgFields,
      ) => {
        if (request[obj]) {
          updatedData[key] = new URL(request[obj]);
        }
      };
      setIfNotNull('banner', 'banner');
      setIfNotNull('logo', 'logo');

      await OrgDa.UpdateOrgDetails(mOrg, updatedData);
    }
  }
}
