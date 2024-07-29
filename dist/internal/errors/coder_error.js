"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoderError = void 0;
const base_error_js_1 = require("./base_error.js");
const error_codes_js_1 = require("./error_codes.js");
/**
 * Error type specific to coder errors
 */
class CoderError extends base_error_js_1.BaseError {
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param stack {string} - The stack trace
     */
    constructor(name = "Coder Error", code = CoderError.codes.UNKNOWN_CODER_ERR, isFatal = false, message, stack) {
        super(name, code, isFatal, message, "local", stack);
    }
}
exports.CoderError = CoderError;
CoderError.codes = Object.assign(Object.assign({}, base_error_js_1.BaseError.codes), error_codes_js_1.codes.coder);
//# sourceMappingURL=coder_error.js.map