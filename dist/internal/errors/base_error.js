"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
const error_codes_js_1 = require("./error_codes.js");
/**
 * BaseError used within the micro services that guarantees we don't loose the stack trace.
 */
class BaseError extends Error {
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name, code, isFatal = false, message, origin, stack) {
        super(message || name);
        this.name = name;
        this.code = code;
        this.isFatal = isFatal;
        this.origin = origin;
        this.stack = stack;
        this.identifier = BaseError.codes.BASE_ERROR;
        if (stack) {
            this.stack = stack;
        }
    }
}
exports.BaseError = BaseError;
BaseError.codes = error_codes_js_1.codes.base;
//# sourceMappingURL=base_error.js.map