"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManagementService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@js-joda/core");
const service_session_model_1 = require("../../models/service-session.model");
let SessionManagementService = class SessionManagementService {
    getSessionForRequest(request) {
        const session = request.session;
        if (!!!session.serviceSessionModel) {
            session.serviceSessionModel = new service_session_model_1.ServiceSessionModel();
        }
        return session;
    }
    getSessionDataForRequest(request) {
        return this.getSessionForRequest(request).serviceSessionModel;
    }
    getUserForRequest(request) {
        const userModel = this.getSessionDataForRequest(request).user;
        return userModel.get();
    }
    isUserPresentOnRequest(request) {
        return this.getSessionDataForRequest(request).user.isPresent();
    }
    isOrgOnRequest(request) {
        return this.getSessionDataForRequest(request).org.isPresent();
    }
    validateSession(request) {
        return new Promise((resolve, reject) => {
            const now = core_1.LocalDateTime.now();
            const expiry = this.getSessionDataForRequest(request).expiry.orElse(core_1.LocalDateTime.MIN);
            now.isBefore(expiry) ? resolve('OK') : reject('EXPIRED');
        });
    }
};
SessionManagementService = __decorate([
    (0, common_1.Injectable)()
], SessionManagementService);
exports.SessionManagementService = SessionManagementService;
//# sourceMappingURL=session-management.service.js.map