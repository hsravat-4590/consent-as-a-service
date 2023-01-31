"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateEquals = exports.ValidateState = void 0;
function handleValidationError(errorHandler) {
    var _a, _b;
    throw ((_a = errorHandler.errorMessage) !== null && _a !== void 0 ? _a : new Error((_b = errorHandler.errorMessage) !== null && _b !== void 0 ? _b : 'Invalid State'));
}
const ValidateState = (check, errorHandler) => {
    if (check()) {
        return;
    }
    else {
        handleValidationError(errorHandler);
    }
};
exports.ValidateState = ValidateState;
const ValidateEquals = (values, errorHandler) => {
    try {
        let equality = true;
        values.forEach((a) => {
            values.filter((b) => {
                equality = b.equals(a);
                if (!equality) {
                    throw Error('Not Equal!');
                }
            });
        });
    }
    catch (e) {
        handleValidationError(errorHandler);
    }
};
exports.ValidateEquals = ValidateEquals;
//# sourceMappingURL=validate.js.map