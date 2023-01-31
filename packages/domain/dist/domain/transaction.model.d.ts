import { LocalDateTime } from "@js-joda/core";
import { Optional } from "../util/optional";
export interface TransactionModel {
    id: NonNullable<number>;
    txnId: string;
    txnStatus: TxnStatus;
    dateTime: LocalDateTime;
    parent: Optional<string>;
}
export type TxnStatus = "CREATED" | "IN_PROGRESS" | "ACCEPTED" | "REJECTED" | "FULFILLED" | "VOIDED";
