import { ServiceSessionModel } from '../models/service-session.model';
declare module 'express-session' {
    interface SessionData {
        serviceSessionModel: ServiceSessionModel;
    }
}
//# sourceMappingURL=session.extension.d.ts.map