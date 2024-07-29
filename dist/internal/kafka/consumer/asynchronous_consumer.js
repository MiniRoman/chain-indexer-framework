"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsynchronousConsumer = void 0;
const abstract_consumer_js_1 = require("./abstract_consumer.js");
const is_base_error_js_1 = require("../../errors/is_base_error.js");
const kafka_error_js_1 = require("../../errors/kafka_error.js");
/**
 * The AsynchronousConsumer extends AbstractConsumer class to provide guarantee of
 * ordered committing of offsets. The messages are processed concurrently using the event loop,
 * but offsets are committed in order. If an earlier promise in the queue fails, later offsets will
 * not be comitted even if successful.
 * @extends AbstractConsumer
 */
class AsynchronousConsumer extends abstract_consumer_js_1.AbstractConsumer {
    /**
     * Private method to be used as a wrapper to retry the next promise internally upto max retries by using recursive calls.
     *
     * @param {DeserialisedMessage} message - The Deserialised message to be passed to the next promise.
     *
     * @param {number} errorCount - This param should not be set externally and is used by recursive calls to track the number of times next promise failed.
     *
     * @returns {Promise<void>}
     */
    retryPromise(message, errorCount = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield ((_a = this.observer) === null || _a === void 0 ? void 0 : _a.next(message));
            }
            catch (error) {
                if (errorCount >= this.maxRetries || ((0, is_base_error_js_1.isBaseError)(error) && error.isFatal)) {
                    throw kafka_error_js_1.KafkaError.createUnknown(error);
                }
                return this.retryPromise(message, errorCount + 1);
            }
        });
    }
    /**
     * Implementation of the abstract enqueue method. This implementation adds queue object with the wrapped retryPromise to the queue
     *
     * @param {DeserialisedMessage} message - The message of which queue object needs to be added to the internal queue.
     *
     * @returns {IConsumerQueueObject<DeserialisedMessage>} - Returns consumer queue object with the observer.next wrapped in next promise.
     */
    enqueue(message) {
        return {
            message,
            promise: this.retryPromise(message)
        };
    }
}
exports.AsynchronousConsumer = AsynchronousConsumer;
//# sourceMappingURL=asynchronous_consumer.js.map