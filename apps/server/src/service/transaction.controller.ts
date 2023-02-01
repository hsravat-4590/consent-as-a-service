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

import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from '../core/services/transaction.service';
import { TransactionModel, TxnStatus } from '@consent-as-a-service/domain';
import { AuthGuard } from '@nestjs/passport';

/**
 * FOR DEVELOPMENT PROCESS ONLY. WON'T BE INCLUDED AFTER PROD
 */
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createNew(): Promise<string> {
    return await this.transactionService.createTransaction(false);
  }

  @Post('update')
  async updateTxn(
    @Query('txnId')
    id: string,
    @Query('status') updatedStatus: TxnStatus,
  ) {
    return await this.transactionService.updateTransaction(id, updatedStatus);
  }

  @Get()
  async getTransaction(@Param('txnId') id: string): Promise<TransactionModel> {
    return await this.transactionService.readTransaction(id);
  }
}
