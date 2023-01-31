"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@js-joda/core");
const src_1 = require("@consent-as-a-service/database-prisma/src");
const session_management_service_1 = require("./session/session-management.service");
const domain_1 = require("@consent-as-a-service/domain");
let TransactionService = class TransactionService {
    constructor(sessionManagementService) {
        this.sessionManagementService = sessionManagementService;
    }
    async createTransaction(enableSessionLinking = true) {
        const now = core_1.LocalDateTime.now();
        const transaction = await (0, src_1.CreateTransaction)({
            dateTime: now,
            txnStatus: 'CREATED',
        });
        if (!enableSessionLinking) {
            this.sessionManagementService.serviceSessionModel.transaction =
                domain_1.Optional.of(transaction);
        }
        return transaction;
    }
    async readTransaction(transactionId = this.getTransactionFromSession()) {
        const transactionModel = await (0, src_1.ReadTransaction)(transactionId);
        return transactionModel;
    }
    async readAllTransactions(transactionId = this.getTransactionFromSession(), order) {
        return (0, src_1.ReadWholeTransaction)(transactionId, order);
    }
    async updateTransaction(txnId = this.getTransactionFromSession(), newStatus, enableSessionLinking = true) {
        const newId = await (0, src_1.UpdateTransaction)({
            txnId: txnId,
            dateTime: core_1.LocalDateTime.now(),
            txnStatus: newStatus,
        });
        if (!enableSessionLinking) {
            this.sessionManagementService.serviceSessionModel.transaction =
                domain_1.Optional.of(newId);
        }
        return newId;
    }
    async voidTransaction(txnId = this.getTransactionFromSession(), enableSessionLinking = true) {
        return await this.updateTransaction(txnId, 'VOIDED', enableSessionLinking);
    }
    getTransactionFromSession() {
        const transactionOptional = this.sessionManagementService.serviceSessionModel.transaction;
        (0, domain_1.ValidateState)(transactionOptional.isPresent, {
            errorMessage: 'Expected a Transaction on the Session',
        });
        return transactionOptional.get();
    }
};
TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [session_management_service_1.SessionManagementService])
], TransactionService);
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map