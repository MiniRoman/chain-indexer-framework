"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLibrdKafkaError = void 0;
/**
 * Checks if given error is a LibrdKafkaError. Small helper we might will remove later on.
 *
 * @param error {unknown}
 *
 * @returns {boolean}
 */
function isLibrdKafkaError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "message" in error &&
        "code" in error &&
        "isFatal" in error &&
        "origin" in error &&
        "stack" in error);
}
exports.isLibrdKafkaError = isLibrdKafkaError;
//# sourceMappingURL=is_librdkafka_error.js.map