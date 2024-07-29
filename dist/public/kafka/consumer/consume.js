"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consume = void 0;
const synchronous_consumer_js_1 = require("./synchronous_consumer.js");
const asynchronous_consumer_js_1 = require("./asynchronous_consumer.js");
/**
 * Function to be used as functional implementation for the consumer classes for asynchronous
 * and synchronous consumer. this function will create coder class if protobuf coder is required.
 * type and coder can be passed if coder other that protobuf coder is needed.
 *
 * @param {IConsumerConfig} config - consumer config
 * @param {IObserver<DeserialisedMessage, BaseError>} observer - observer class for next, error, closed event
 *
 * @returns {AsynchronousConsumer | SynchronousConsumer}
 */
function consume(config, observer) {
    const type = config.type;
    delete config.type;
    let consumer;
    switch (type) {
        case "asynchronous": {
            consumer = new asynchronous_consumer_js_1.AsynchronousConsumer(config);
            break;
        }
        case "synchronous": {
            consumer = new synchronous_consumer_js_1.SynchronousConsumer(config);
            break;
        }
        default: {
            throw new Error("Invalid type");
        }
    }
    consumer.start(observer);
    return consumer;
}
exports.consume = consume;
//# sourceMappingURL=consume.js.map