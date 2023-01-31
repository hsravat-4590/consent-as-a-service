import { TxnLog } from "@prisma/client";
import { TransactionModel } from "@consent-as-a-service/domain";
export declare const mapTxnLogToModel: (record: TxnLog) => TransactionModel;
