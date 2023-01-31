import { LocalDateTime } from "@js-joda/core";
import { Optional } from "../../../../apps/server/src/core/util/optional";
export interface TransactionModel {
    id: NonNullable<number>;
    txnId: NonNullable<string>;
    txnStatus: NonNullable<TxnStatus>;
    dateTime: NonNullable<LocalDateTime>;
    parent: Optional<string>;
}
export type TxnStatus = "CREATED" | "IN_PROGRESS" | "ACCEPTED" | "REJECTED" | "FULFILLED";
