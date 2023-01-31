"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManagementService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@js-joda/core");
const service_session_model_1 = require("../../models/service-session.model");
const core_2 = require("@nestjs/core");
let SessionManagementService = class SessionManagementService {
    constructor(request) {
        this.request = request;
        this.session = this.getSessionForRequest();
        this.serviceSessionModel = this.session.serviceSessionModel;
    }
    getSessionForRequest() {
        const session = this.request.session;
        if (!!!session.serviceSessionModel) {
            session.serviceSessionModel = new service_session_model_1.ServiceSessionModel();
        }
        return session;
    }
    getUserForRequest() {
        const userModel = this.serviceSessionModel.user;
        return userModel.get();
    }
    isUserPresentOnRequest() {
        return this.serviceSessionModel.user.isPresent();
    }
    isOrgOnRequest() {
        return this.serviceSessionModel.org.isPresent();
    }
    validateSession() {
        return new Promise((resolve, reject) => {
            const now = core_1.LocalDateTime.now();
            const expiry = this.serviceSessionModel.expiry.orElse(core_1.LocalDateTime.MIN);
            now.isBefore(expiry) ? resolve('OK') : reject('EXPIRED');
        });
    }
};
SessionManagementService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_2.REQUEST)),
    __metadata("design:paramtypes", [Object])
], SessionManagementService);
exports.SessionManagementService = SessionManagementService;
//# sourceMappingURL=session-management.service.js.map