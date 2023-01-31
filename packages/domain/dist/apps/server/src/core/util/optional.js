"use strict";
/*
 * Copyright (c) 2023 Hanzalah Ravat
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = void 0;
/**
 * Lightweight implementation of Java.Optional
 * @see https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html
 */
const core_1 = require("@js-joda/core");
class Optional {
    value;
    static EMPTY = new Optional(null);
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
