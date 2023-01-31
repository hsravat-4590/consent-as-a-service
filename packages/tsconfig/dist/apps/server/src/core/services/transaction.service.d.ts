import { SessionManagementService } from './session/session-management.service';
import { TransactionModel, TxnStatus } from '@consent-as-a-service/domain';
export declare class TransactionService {
    private sessionManagementService;
    constructor(sessionManagementService: SessionManagementService);
    createTransaction(enableSessionLinking?: boolean): Promise<string>;
    readTransaction(transactionId?: string): Promise<TransactionModel>;
    readAllTransactions(transactionId: string, order: 'asc' | 'desc'): Promise<Array<TransactionModel>>;
    updateTransaction(txnId: string, newStatus: TxnStatus, enableSessionLinking?: boolean): Promise<string>;
    voidTransaction(txnId?: string, enableSessionLinking?: boolean): Promise<string>;
    private getTransactionFromSession;
}
//# sourceMappingURL=transaction.service.d.ts.map