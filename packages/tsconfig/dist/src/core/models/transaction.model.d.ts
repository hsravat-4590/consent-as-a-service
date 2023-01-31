import { LocalDateTime } from '@js-joda/core';
import { Optional } from '../util/optional';
export interface TransactionModel {
    id: NonNullable<number>;
    txnId: NonNullable<string>;
    txnStatus: NonNullable<TxnStatus>;
    dateTime: NonNullable<LocalDateTime>;
    parent: Optional<string>;
}
export type TxnStatus = 'CREATED' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'FULFILLED';
//# sourceMappingURL=transaction.model.d.ts.map