import { BaseError } from "./base_error.js";
/**
 * Error type specific to coder errors
 */
export declare class CoderError extends BaseError {
    static codes: {
        UNKNOWN_CODER_ERR: number;
        INVALID_PATH_PROTO: number;
        INVALID_PATH_TYPE: number;
        DECODING_ERROR: number;
        ENCODING_VERIFICATION_FAILED: number;
        BASE_ERROR: number;
    };
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param stack {string} - The stack trace
     */
    constructor(name?: string, code?: number, isFatal?: boolean, message?: string, stack?: string);
}
