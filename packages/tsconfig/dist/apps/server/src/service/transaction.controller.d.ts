import { TransactionService } from '../core/services/transaction.service';
import { TransactionModel } from '@consent-as-a-service/domain';
export declare class TransactionController {
    private transactionService;
    constructor(transactionService: TransactionService);
    createNew(): Promise<string>;
    getTransaction(id: string): Promise<TransactionModel>;
}
//# sourceMappingURL=transaction.controller.d.ts.map