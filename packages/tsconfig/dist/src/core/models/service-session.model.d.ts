import { Optional } from '../util/optional';
import { UserModel } from './user.model';
import { LocalDateTime } from '@js-joda/core';
export declare class ServiceSessionModel {
    user: Optional<UserModel>;
    expiry: Optional<LocalDateTime>;
    org: Optional<string>;
    lastRequest: Optional<any>;
    clear(): void;
}
//# sourceMappingURL=service-session.model.d.ts.map