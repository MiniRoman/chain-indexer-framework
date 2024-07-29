import { LibrdKafkaError } from "node-rdkafka";
import { BaseError } from "./base_error.js";
/**
 * KafkaError object used within common.
 */
export declare class KafkaError extends BaseError {
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name: string | undefined, code: number, isFatal?: boolean, message?: string, origin?: string, stack?: string);
    static codes: {
        UNKNOWN_CONSUMER_ERR: number;
        CONSUMER_OBSERVER_INVALID: number;
        INVALID_CODER_CONFIG: number;
        UNKNOWN_PRODUCER_ERR: number;
        DELIVERY_TIMED_OUT: number;
        BASE_ERROR: number;
    };
    /**
     * Internal method to convert LibKafkaError to KafkaError
     *
     * @param {LibrdKafkaError} error - The error object to be converted.
     *
     * @returns {KafkaError} - Returns the kafka error created from the error passed.
     */
    static convertLibError(error: LibrdKafkaError, isProducer?: boolean): KafkaError;
    /**
     * Static method that converts any error that is not an instance of BaseError into KafkaError
     *
     * @param {any} error - Error that needs to be checked and converted.
     *
     * @returns {KafkaError|BaseError} - Returns either KafkaError or any instance of BaseError
     */
    static createUnknown(error: any, isProducer?: boolean): KafkaError | BaseError;
}
