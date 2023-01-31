"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEmailAddressError = exports.EmailModel = void 0;
const validate_1 = require("../util/validate");
class EmailModel {
    constructor(email) {
        this.regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        this.checkAndSet(email);
    }
    get email() {
        return this._email;
    }
    set email(email) {
        this.checkAndSet(email);
    }
    checkAndSet(email) {
        (0, validate_1.ValidateState)(() => this.regexp.test(email), {
            errorException: new InvalidEmailAddressError('Email Address Invalid'),
        });
        this._email = email;
    }
}
exports.EmailModel = EmailModel;
class InvalidEmailAddressError extends Error {
}
exports.InvalidEmailAddressError = InvalidEmailAddressError;
//# sourceMappingURL=email.model.js.map