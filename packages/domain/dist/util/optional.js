"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = void 0;
const core_1 = require("@js-joda/core");
class Optional {
    constructor(value) {
        this.value = value;
    }
    isPresent() {
        try {
            return !!this.value;
        }
        catch (e) {
            return false;
        }
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
    orElseGet(supplier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPresent()) {
                return this.value;
            }
            else {
                return yield supplier();
            }
        });
    }
    orElseRun(runnable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPresent()) {
                return this.value;
            }
            else {
                yield runnable();
            }
        });
    }
    static of(item) {
        if (!!!item) {
            throw new core_1.NullPointerException("Item provided must not be null!");
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
