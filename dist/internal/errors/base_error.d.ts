/**
 * BaseError used within the micro services that guarantees we don't loose the stack trace.
 */
export declare class BaseError extends Error {
    name: string;
    code: number;
    isFatal: boolean;
    origin?: string | undefined;
    stack?: string | undefined;
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name: string, code: number, isFatal?: boolean, message?: string, origin?: string | undefined, stack?: string | undefined);
    static codes: {
        BASE_ERROR: number;
    };
    identifier: number;
}
