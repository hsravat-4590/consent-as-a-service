import { Optional, UserModel } from '@consent-as-a-service/domain';
import { LocalDateTime } from '@js-joda/core';
export declare class ServiceSessionModel {
    user: Optional<UserModel>;
    expiry: Optional<LocalDateTime>;
    org: Optional<string>;
    lastRequest: Optional<any>;
    transaction: Optional<string>;
    clear(): void;
}
//# sourceMappingURL=service-session.model.d.ts.map