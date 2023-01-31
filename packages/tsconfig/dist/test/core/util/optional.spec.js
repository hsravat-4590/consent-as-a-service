"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const optional_1 = require("../../../src/core/util/optional");
const core_1 = require("@js-joda/core");
describe('Optional', () => {
    let fixture;
    beforeEach(() => {
        fixture = new FixtureClass();
    });
    describe('isPresent', () => {
        it('Should return true as there is a value present', () => {
            const { optional } = givenOptionalString();
            expect(optional.isPresent()).toBe(true);
        });
        it('Should return false as no values exist', () => {
            jest.fn(FixtureClass.prototype.optionalOf);
            expect(() => {
                fixture.optionalOf(null);
            }).toThrow(core_1.NullPointerException);
        });
        it("Should return false as it's undefined", () => {
            jest.fn(FixtureClass.prototype.optionalOf);
            expect(() => {
                fixture.optionalOf(undefined);
            }).toThrow(core_1.NullPointerException);
        });
    });
    describe('get', () => {
        it('Should provide the value given', () => {
            const { value, optional } = givenOptionalString();
            expect(optional.get() == value).toBe(true);
        });
    });
    describe('orElse', () => {
        it("As it's a truthy value, it should return the same", () => {
            const { value, optional } = givenOptionalString();
            expect(optional.orElse('Other') == value).toBe(true);
        });
        it("As it's a falsy value, it should return the same", () => {
            const optional = optional_1.Optional.empty();
            expect(optional.orElse('Other') == 'Other').toBe(true);
        });
    });
    describe('orElseGet', () => {
        it("As it's a truthy value, it should return the same", async () => {
            const { value, optional } = givenOptionalString();
            FixtureClass.prototype.orElseGetSupplier = jest.fn(FixtureClass.prototype.orElseGetSupplier);
            const orElseFnRes = await optional.orElseGet(FixtureClass.prototype.orElseGetSupplier);
            expect(orElseFnRes === value).toBe(true);
            expect(FixtureClass.prototype.orElseGetSupplier).toBeCalledTimes(0);
        });
        it("As it's a falsy value, it should return the same", async () => {
            const optional = optional_1.Optional.empty();
            FixtureClass.prototype.orElseGetSupplier = jest.fn(FixtureClass.prototype.orElseGetSupplier);
            const orElseFnRes = await optional.orElseGet(FixtureClass.prototype.orElseGetSupplier);
            expect(orElseFnRes === FixtureClass.orElseGetRetValue).toBe(true);
            expect(FixtureClass.prototype.orElseGetSupplier).toBeCalledTimes(1);
        });
    });
    describe('orElseRun', () => {
        it("As it's a truthy value, it should return the same", async () => {
            const { value, optional } = givenOptionalString();
            FixtureClass.prototype.orElseRunSupplier = jest.fn(FixtureClass.prototype.orElseRunSupplier);
            const orElseFnRes = await optional.orElseRun(FixtureClass.prototype.orElseRunSupplier);
            expect(orElseFnRes === value).toBe(true);
            expect(FixtureClass.prototype.orElseRunSupplier).toBeCalledTimes(0);
        });
        it("As it's a falsy value, it should return the same", async () => {
            const optional = optional_1.Optional.empty();
            FixtureClass.prototype.orElseRunSupplier = jest.fn(FixtureClass.prototype.orElseRunSupplier);
            await optional.orElseRun(FixtureClass.prototype.orElseRunSupplier);
            expect(FixtureClass.prototype.orElseRunSupplier).toBeCalledTimes(1);
        });
    });
    function givenOptionalString() {
        const value = 'Hello World';
        const optional = optional_1.Optional.of(value);
        return { value, optional };
    }
});
const FixtureClass = (_a = class {
        async orElseGetSupplier() {
            return FixtureClass.orElseGetRetValue;
        }
        orElseRunSupplier() {
            return Promise.resolve();
        }
        optionalOf(of) {
            return optional_1.Optional.of(of);
        }
    },
    _a.orElseGetRetValue = 'orElseGet',
    _a);
//# sourceMappingURL=optional.spec.js.map