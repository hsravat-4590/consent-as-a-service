import { UserModel } from "./user.model";
import { OrgModel } from "./org.model";
import { LocalDateTime } from "@js-joda/core";
export interface ConsentModel {
    id: NonNullable<string>;
    user: UserModel;
    org: OrgModel;
    expiry: LocalDateTime;
    dataId: string;
    consentState: ConsentState;
}
export type ConsentState = "CREATED" | "WAITING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
