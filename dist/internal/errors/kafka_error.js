"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaError = void 0;
const is_librdkafka_error_js_1 = require("./is_librdkafka_error.js");
const create_error_object_js_1 = require("./create_error_object.js");
const is_base_error_js_1 = require("./is_base_error.js");
const base_error_js_1 = require("./base_error.js");
const error_codes_js_1 = require("./error_codes.js");
/**
 * KafkaError object used within common.
 */
class KafkaError extends base_error_js_1.BaseError {
    /**
     * @param name {string} - The error name
     * @param code {number} - The error code
     * @param isFatal {boolean} - Flag to know if it is a fatal error
     * @param message {string} - The actual error message
     * @param origin {string} - The point this error originated
     * @param stack {string} - The stack trace
     */
    constructor(name = "Kafka Error", code, isFatal = false, message, origin = "local", stack) {
        super(name, code, isFatal, message, origin, stack);
    }
    /**
     * Internal method to convert LibKafkaError to KafkaError
     *
     * @param {LibrdKafkaError} error - The error object to be converted.
     *
     * @returns {KafkaError} - Returns the kafka error created from the error passed.
     */
    static convertLibError(error, isProducer = false) {
        return new KafkaError(isProducer ? "Kafka producer error" : "Kafka consumer error", error.code || (isProducer ? KafkaError.codes.UNKNOWN_PRODUCER_ERR : KafkaError.codes.UNKNOWN_CONSUMER_ERR), error.isFatal, error.message, error.origin, error.stack);
    }
    /**
     * Static method that converts any error that is not an instance of BaseError into KafkaError
     *
     * @param {any} error - Error that needs to be checked and converted.
     *
     * @returns {KafkaError|BaseError} - Returns either KafkaError or any instance of BaseError
     */
    static createUnknown(error, isProducer = false) {
        if (!(0, is_base_error_js_1.isBaseError)(error)) {
            if ((0, is_librdkafka_error_js_1.isLibrdKafkaError)(error)) {
                return KafkaError.convertLibError(error, isProducer);
            }
            const errorObject = (0, create_error_object_js_1.createErrorObject)(error);
            return new KafkaError(isProducer ? "Kafka producer error" : "Kafka consumer error", isProducer ? KafkaError.codes.UNKNOWN_PRODUCER_ERR : KafkaError.codes.UNKNOWN_CONSUMER_ERR, true, errorObject.message, "local", errorObject.stack);
        }
        return error;
    }
}
exports.KafkaError = KafkaError;
KafkaError.codes = Object.assign(Object.assign({}, base_error_js_1.BaseError.codes), error_codes_js_1.codes.kafkaclient);
//# sourceMappingURL=kafka_error.js.map