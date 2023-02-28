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

/**
 * Lightweight implementation of Java.Optional
 * @see https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html
 */
import { NullPointerException } from "@js-joda/core";

export class Optional<T> {
  private readonly value: T;

  private static readonly EMPTY: Optional<any> = new Optional<any>(null);

  private constructor(value: NonNullable<T>) {
    this.value = value;
  }

  isPresent(): boolean {
    try {
      return !!this.value;
    } catch (e) {
      return false;
    }
  }

  get(): T {
    return this.value;
  }

  orElse(other: T): T {
    if (this.isPresent()) {
      return this.value;
    } else {
      return other;
    }
  }

  async orElseGet(supplier: () => Promise<T>): Promise<T> {
    if (this.isPresent()) {
      return this.value;
    } else {
      return await supplier();
    }
  }

  async orElseRun(runnable: () => Promise<void>): Promise<T | void> {
    if (this.isPresent()) {
      return this.value;
    } else {
      await runnable();
    }
  }

  static of<T>(item: T): Optional<T> {
    if (!!!item) {
      throw new NullPointerException("Item provided must not be null!");
    }
    return new Optional<T>(item);
  }

  static ofNullable<T>(item: T | null | undefined): Optional<T> {
    return !!item ? new Optional<T>(item) : Optional.EMPTY;
  }

  static empty<T>(): Optional<T> {
    return Optional.EMPTY;
  }
}

/**
 * This type wraps an optional in a promise for Asynchronous uses
 */
export type AsyncOptional<T> = Promise<Optional<T>>;
