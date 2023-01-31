"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceSessionModel = void 0;
const optional_1 = require("../util/optional");
class ServiceSessionModel {
    constructor() {
        this.user = optional_1.Optional.empty();
        this.expiry = optional_1.Optional.empty();
        this.org = optional_1.Optional.empty();
        this.lastRequest = optional_1.Optional.empty();
    }
    clear() {
        Object.entries(this).forEach(([key]) => {
            if (this[key] instanceof optional_1.Optional) {
                this[key] = optional_1.Optional.empty();
            }
        });
    }
}
exports.ServiceSessionModel = ServiceSessionModel;
//# sourceMappingURL=service-session.model.js.map