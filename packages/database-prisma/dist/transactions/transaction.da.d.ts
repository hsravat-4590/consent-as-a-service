import { TransactionModel } from "@consent-as-a-service/domain";
export declare const CreateTransaction: (options: Pick<TransactionModel, "txnStatus" | "dateTime">) => Promise<string>;
export declare const ReadTransaction: (txnId: string) => Promise<TransactionModel>;
export declare const ReadWholeTransaction: (txnId: string, order: "asc" | "desc") => Promise<Array<TransactionModel>>;
export declare const UpdateTransaction: (update: Pick<TransactionModel, "dateTime" | "txnStatus" | "txnId">) => Promise<string>;
