"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTxnLogToModel = void 0;
const core_1 = require("@js-joda/core");
const domain_1 = require("@consent-as-a-service/domain");
const mapTxnLogToModel = (record) => {
    return {
        id: record.id,
        txnId: record.txnId,
        txnStatus: record.TxnStatus.toString(),
        dateTime: (0, core_1.nativeJs)(record.datetime).toLocalDateTime(),
        parent: domain_1.Optional.ofNullable(record.parent),
    };
};
exports.mapTxnLogToModel = mapTxnLogToModel;
