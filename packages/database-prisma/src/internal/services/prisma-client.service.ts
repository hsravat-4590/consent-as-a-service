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

import { singleton } from "tsyringe";
import { PrismaClient } from "@prisma/client";

@singleton()
export class PrismaClientService {
  private _isConnected = false;
  get isConnected(): boolean {
    return this._isConnected;
  }

  private _prismaClient = new PrismaClient();
  get prismaClient(): PrismaClient {
    return this._prismaClient;
  }

  async connect() {
    if (this._isConnected) {
      return;
    }
    await this._prismaClient.$connect();
    this._isConnected = true;
  }

  async disconnect() {
    if (!this._isConnected) {
      return;
    }
    await this._prismaClient.$disconnect();
    this._isConnected = false;
  }
}
