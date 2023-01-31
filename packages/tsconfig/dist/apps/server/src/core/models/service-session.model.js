"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceSessionModel = void 0;
const domain_1 = require("@consent-as-a-service/domain");
class ServiceSessionModel {
    constructor() {
        this.user = domain_1.Optional.empty();
        this.expiry = domain_1.Optional.empty();
        this.org = domain_1.Optional.empty();
        this.lastRequest = domain_1.Optional.empty();
        this.transaction = domain_1.Optional.empty();
    }
    clear() {
        Object.entries(this).forEach(([key]) => {
            if (this[key] instanceof domain_1.Optional) {
                this[key] = domain_1.Optional.empty();
            }
        });
    }
}
exports.ServiceSessionModel = ServiceSessionModel;
//# sourceMappingURL=service-session.model.js.map