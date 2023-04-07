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

import { UpdateOrgFieldsInternal } from "../internal/prisma-da/org.da.internal";
import {
  AsyncOptional,
  Optional,
  OrgModel,
  UserModel,
} from "@consent-as-a-service/domain";
import { mapOrgToModel } from "../internal/mappers/org.mapper";
import { mapUserToModel } from "../internal/mappers/user.mapper";
import getServices from "../internal/services/get-services";

export namespace OrgDa {
  export const CreateOrg = async (
    rootUser: UserModel,
    options: NonNullable<OrgCreateOptions>
  ): Promise<{ orgModel: OrgModel; userModel: UserModel }> => {
    const { orgDa, userDa } = getServices();
    const newOrg = await orgDa.createOrg(options);
    // Add the Root User

    const userUpdater = orgDa.updateUsers(newOrg.id);
    console.log(userUpdater);
    await userUpdater.addUser(rootUser.id).commit();
    // Return the newOrg and User
    const updatedUser = await Optional.unwrapAsync(
      userDa.readUser(rootUser.id)
    );
    return {
      orgModel: mapOrgToModel(newOrg),
      userModel: mapUserToModel(updatedUser),
    };
  };

  export type OrgCreateOptions = Omit<OrgModel, "id" | "orgId">;

  export const GetOrg = async (orgId: string): AsyncOptional<OrgModel> => {
    const { orgDa } = getServices();
    const org = await orgDa.readOrg(orgId);
    return org.map((it) => mapOrgToModel(it));
  };

  export const GetOrgByRequester = async (
    requesterId: string
  ): AsyncOptional<OrgModel> => {
    const { consentRequesterDa } = getServices();
    const optional = await consentRequesterDa.getRequesterWithOrg(requesterId);
    if (optional.isPresent()) {
      const requester = optional.get();
      return Optional.of(mapOrgToModel(requester.user.org));
    } else {
      return Optional.empty();
    }
  };

  export const UpdateOrgDetails = async (
    orgId: string,
    updatableOrgFields: UpdatableOrgFields
  ) => {
    const { orgDa } = getServices();
    // Map External to Internal
    const internalUpdatableFields = {
      banner: updatableOrgFields.banner?.toString(),
      logo: updatableOrgFields.logo?.toString(),
    } as UpdateOrgFieldsInternal;
    await orgDa.updateOrgDetails({
      orgId: orgId,
      model: internalUpdatableFields,
    });
  };

  /**
   * Add Users will allow you to add users by their Ids
   * @TODO Enterprise Feature
   */
  export const AddUsers = async () => {};
  /**
   * Add Users will allow you to remove users by their Ids
   * @TODO Enterprise Feature
   */
  export const RemoveUsers = async () => {};

  export type UpdatableOrgFields = Pick<OrgModel, "banner" | "logo">;
}
