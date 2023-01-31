import { TransactionModel } from './transaction.model';
import { ConsentModel } from './consent.model';
export interface ConsentRequestModel {
    id: NonNullable<string>;
    txn: TransactionModel;
    consent: ConsentModel;
    title: string;
    description: string;
}
