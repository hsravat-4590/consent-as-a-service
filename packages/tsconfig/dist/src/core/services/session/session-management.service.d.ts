import { Request } from 'express';
import { UserModel } from '../../models/user.model';
import { Session, SessionData } from 'express-session';
import { ServiceSessionModel } from '../../models/service-session.model';
export declare class SessionManagementService {
    getSessionForRequest(request: Request): Session & Partial<SessionData>;
    getSessionDataForRequest(request: Request): ServiceSessionModel;
    getUserForRequest(request: Request): UserModel;
    isUserPresentOnRequest(request: Request): boolean;
    isOrgOnRequest(request: Request): boolean;
    validateSession(request: Request): Promise<ValidateSessionResponse>;
}
export type ValidateSessionResponse = 'OK' | 'NEW' | 'UNDEFINED' | 'EXPIRED';
//# sourceMappingURL=session-management.service.d.ts.map