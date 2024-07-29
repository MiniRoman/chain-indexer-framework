"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const create_error_object_js_1 = require("./create_error_object.js");
const is_base_error_js_1 = require("./is_base_error.js");
const base_error_js_1 = require("./base_error.js");
const error_codes_js_1 = require("./error_codes.js");
/**
 * BlockProducerError object used within common.
 */
class ApiError extends base_error_js_1.BaseError {
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name = "Internal server error", code = ApiError.codes.SERVER_ERROR, isFatal = false, message, origin = "local", stack) {
        super(name, code, isFatal, message, origin, stack);
    }
    /**
     * Static method that converts any error that is not an instance of BaseError into BlockProducerError
     *
     * @param {any} error - Error that needs to be checked and converted.
     *
     * @returns {BlockProducerError|BaseError} - Returns either BlockProducer or any instance of BaseError
     */
    static createUnknown(error, isLocal = true) {
        if (!(0, is_base_error_js_1.isBaseError)(error)) {
            const errorObject = (0, create_error_object_js_1.createErrorObject)(error);
            return new ApiError("Internal server error", ApiError.codes.SERVER_ERROR, true, errorObject.message, isLocal ? "local" : "remote", errorObject.stack);
        }
        return error;
    }
}
exports.ApiError = ApiError;
ApiError.codes = Object.assign(Object.assign({}, base_error_js_1.BaseError.codes), error_codes_js_1.codes.api);
//# sourceMappingURL=api_error.js.map