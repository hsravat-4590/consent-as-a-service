"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = void 0;
const core_1 = require("@js-joda/core");
class Optional {
    constructor(value) {
        this.value = value;
    }
    isPresent() {
        return !!this.value;
    }
    get() {
        return this.value;
    }
    orElse(other) {
        if (this.isPresent()) {
            return this.value;
        }
        else {
            return other;
        }
    }
    async orElseGet(supplier) {
        if (this.isPresent()) {
            return this.value;
        }
        else {
            return await supplier();
        }
    }
    async orElseRun(runnable) {
        if (this.isPresent()) {
            return this.value;
        }
        else {
            await runnable();
        }
    }
    static of(item) {
        if (!!!item) {
            throw new core_1.NullPointerException('Item provided must not be null!');
        }
        return new Optional(item);
    }
    static ofNullable(item) {
        return !!item ? new Optional(item) : Optional.EMPTY;
    }
    static empty() {
        return Optional.EMPTY;
    }
}
exports.Optional = Optional;
Optional.EMPTY = new Optional(null);
//# sourceMappingURL=optional.js.map