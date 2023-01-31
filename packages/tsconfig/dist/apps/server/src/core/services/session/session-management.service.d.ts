import { Request } from 'express';
import { UserModel } from '@consent-as-a-service/domain';
import { ServiceSessionModel } from '../../models/service-session.model';
export declare class SessionManagementService {
    private request;
    private readonly session;
    readonly serviceSessionModel: ServiceSessionModel;
    constructor(request: Request);
    private getSessionForRequest;
    getUserForRequest(): UserModel;
    isUserPresentOnRequest(): boolean;
    isOrgOnRequest(): boolean;
    validateSession(): Promise<ValidateSessionResponse>;
}
export type ValidateSessionResponse = 'OK' | 'NEW' | 'UNDEFINED' | 'EXPIRED';
//# sourceMappingURL=session-management.service.d.ts.map