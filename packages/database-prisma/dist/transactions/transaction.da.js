"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransaction = exports.ReadWholeTransaction = exports.ReadTransaction = exports.CreateTransaction = void 0;
const client_1 = require("@prisma/client");
const domain_1 = require("@consent-as-a-service/domain");
const util_type_mapper_1 = require("../mappers/util-type.mapper");
const txn_log_mapper_1 = require("../mappers/txn-log.mapper");
const prismaClient = new client_1.PrismaClient();
const CreateTransaction = (options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating a TXN");
    yield prismaClient.$connect();
    const created = yield prismaClient.txnLog.create({
        data: {
            TxnStatus: client_1.TxnLog_TxnStatus[options.txnStatus],
            datetime: (0, util_type_mapper_1.convertLocalDateTimeToDate)(options.dateTime),
        },
    });
    yield prismaClient.$disconnect();
    return created.txnId;
});
exports.CreateTransaction = CreateTransaction;
const ReadTransaction = (txnId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Reading A Txn");
    yield prismaClient.$connect();
    const readOut = domain_1.Optional.ofNullable(yield prismaClient.txnLog.findFirst({
        where: {
            txnId: txnId,
        },
        orderBy: {
            id: "desc",
        },
    }));
    if (readOut.isPresent()) {
        return (0, txn_log_mapper_1.mapTxnLogToModel)(readOut.get());
    }
    else {
        throw new Error("No Entries Returned");
    }
});
exports.ReadTransaction = ReadTransaction;
const ReadWholeTransaction = (txnId, order) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient.$connect();
    let arr = new Array();
    const result = yield prismaClient.txnLog.findMany({
        where: {
            txnId: txnId,
        },
        orderBy: {
            id: order,
        },
    });
    arr = result.map(txn_log_mapper_1.mapTxnLogToModel);
    return arr;
});
exports.ReadWholeTransaction = ReadWholeTransaction;
const UpdateTransaction = (update) => __awaiter(void 0, void 0, void 0, function* () {
    const parent = yield (0, exports.ReadTransaction)(update.txnId);
    const parentId = parent.txnId;
    console.log(JSON.stringify(update));
    (0, domain_1.ValidateState)(() => parent.txnStatus !== "VOIDED", {
        errorMessage: "Transaction has been voided and therefore cannot be updated",
    });
    yield prismaClient.$connect();
    const newRecord = yield prismaClient.txnLog.create({
        data: {
            parent: parentId,
            TxnStatus: client_1.TxnLog_TxnStatus[update.txnStatus],
            datetime: (0, util_type_mapper_1.convertLocalDateTimeToDate)(update.dateTime),
        },
    });
    return newRecord.txnId;
});
exports.UpdateTransaction = UpdateTransaction;
