import { BaseError } from "./base_error.js";
/**
 * BlockProducerError object used within common.
 */
export declare class ApiError extends BaseError {
    static codes: {
        BAD_REQUEST: number;
        NOT_FOUND: number;
        SERVER_ERROR: number; /**
         * Static method that converts any error that is not an instance of BaseError into BlockProducerError
         *
         * @param {any} error - Error that needs to be checked and converted.
         *
         * @returns {BlockProducerError|BaseError} - Returns either BlockProducer or any instance of BaseError
         */
        BASE_ERROR: number;
    };
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name?: string, code?: number, isFatal?: boolean, message?: string, origin?: string, stack?: string);
    /**
     * Static method that converts any error that is not an instance of BaseError into BlockProducerError
     *
     * @param {any} error - Error that needs to be checked and converted.
     *
     * @returns {BlockProducerError|BaseError} - Returns either BlockProducer or any instance of BaseError
     */
    static createUnknown(error: any, isLocal?: boolean): ApiError | BaseError;
}
