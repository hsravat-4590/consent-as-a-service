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

import { Optional } from "../../src/util/optional";
import { NullPointerException } from "@js-joda/core";

describe("Optional", () => {
  let fixture;
  beforeEach(() => {
    fixture = new FixtureClass();
  });

  describe("isPresent", () => {
    it("Should return true as there is a value present", () => {
      const { optional } = givenOptionalString();
      expect(optional.isPresent()).toBe(true);
    });
    it("Should return false as no values exist", () => {
      jest.fn(FixtureClass.prototype.optionalOf);
      expect(() => {
        fixture.optionalOf(null);
      }).toThrow(NullPointerException);
    });
    it("Should return false as it's undefined", () => {
      jest.fn(FixtureClass.prototype.optionalOf);
      expect(() => {
        fixture.optionalOf(undefined);
      }).toThrow(NullPointerException);
    });
  });
  describe("get", () => {
    it("Should provide the value given", () => {
      const { value, optional } = givenOptionalString();
      expect(optional.get() == value).toBe(true);
    });
  });

  describe("orElse", () => {
    it("As it's a truthy value, it should return the same", () => {
      const { value, optional } = givenOptionalString();
      expect(optional.orElse("Other") == value).toBe(true);
    });
    it("As it's a falsy value, it should return the same", () => {
      const optional: Optional<string> = Optional.empty();
      expect(optional.orElse("Other") == "Other").toBe(true);
    });
  });

  describe("orElseGet", () => {
    it("As it's a truthy value, it should return the same", async () => {
      const { value, optional } = givenOptionalString();
      FixtureClass.prototype.orElseGetSupplier = jest.fn(
        FixtureClass.prototype.orElseGetSupplier
      );
      const orElseFnRes = await optional.orElseGet(
        FixtureClass.prototype.orElseGetSupplier
      );
      expect(orElseFnRes === value).toBe(true);
      expect(FixtureClass.prototype.orElseGetSupplier).toBeCalledTimes(0);
    });
    it("As it's a falsy value, it should return the same", async () => {
      const optional = Optional.empty();
      FixtureClass.prototype.orElseGetSupplier = jest.fn(
        FixtureClass.prototype.orElseGetSupplier
      );
      const orElseFnRes = await optional.orElseGet(
        FixtureClass.prototype.orElseGetSupplier
      );
      expect(orElseFnRes === FixtureClass.orElseGetRetValue).toBe(true);
      expect(FixtureClass.prototype.orElseGetSupplier).toBeCalledTimes(1);
    });
  });
  describe("orElseRun", () => {
    it("As it's a truthy value, it should return the same", async () => {
      const { value, optional } = givenOptionalString();
      FixtureClass.prototype.orElseRunSupplier = jest.fn(
        FixtureClass.prototype.orElseRunSupplier
      );
      const orElseFnRes = await optional.orElseRun(
        FixtureClass.prototype.orElseRunSupplier
      );
      expect(orElseFnRes === value).toBe(true);
      expect(FixtureClass.prototype.orElseRunSupplier).toBeCalledTimes(0);
    });
    it("As it's a falsy value, it should return the same", async () => {
      const optional = Optional.empty();
      FixtureClass.prototype.orElseRunSupplier = jest.fn(
        FixtureClass.prototype.orElseRunSupplier
      );
      await optional.orElseRun(FixtureClass.prototype.orElseRunSupplier);
      expect(FixtureClass.prototype.orElseRunSupplier).toBeCalledTimes(1);
    });
  });

  function givenOptionalString() {
    const value = "Hello World";
    const optional = Optional.of(value);
    return { value, optional };
  }
});

const FixtureClass = class {
  static readonly orElseGetRetValue = "orElseGet";

  async orElseGetSupplier(): Promise<string> {
    return FixtureClass.orElseGetRetValue;
  }

  orElseRunSupplier() {
    return Promise.resolve();
  }

  optionalOf(of: any) {
    return Optional.of(of);
  }
};
