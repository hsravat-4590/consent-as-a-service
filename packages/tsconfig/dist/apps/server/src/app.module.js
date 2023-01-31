"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const health_controller_1 = require("./service/health/health.controller");
const health_service_1 = require("./core/services/health.service");
const session_management_service_1 = require("./core/services/session/session-management.service");
const transaction_service_1 = require("./core/services/transaction.service");
const datamodel_service_1 = require("./core/services/datamodel.service");
const transaction_controller_1 = require("./service/transaction.controller");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [transaction_controller_1.TransactionController, health_controller_1.HealthController],
        providers: [
            health_service_1.HealthService,
            session_management_service_1.SessionManagementService,
            transaction_service_1.TransactionService,
            datamodel_service_1.DataModelService,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map