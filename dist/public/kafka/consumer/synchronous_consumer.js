"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousConsumer = void 0;
const synchronous_consumer_js_1 = require("../../../internal/kafka/consumer/synchronous_consumer.js");
const protobuf_coder_js_1 = require("../../../internal/coder/protobuf_coder.js");
/**
 * The SynchronousConsumer extends InternalSynchronousConsumer class to provide the abstraction of the coder class.
 * coders can be passed optionally if another type of serialising/deserialising is required.
 *
 * @extends SynchronousConsumer
 */
class SynchronousConsumer extends synchronous_consumer_js_1.SynchronousConsumer {
    /**
     * @constructor
     *
     * @param {IConsumerConfig} config - Key value pairs to override the default config of the consumer client.
     */
    constructor(config) {
        let coders = config.coders;
        const topic = config.topic;
        delete config.topic;
        delete config.coders;
        if (!topic) {
            throw new Error("Please provide topic");
        }
        if (!coders) {
            throw new Error("Please provide coders");
        }
        if (Array.isArray(coders) || "fileName" in coders) {
            const coderConfig = coders;
            coders = {};
            if (Array.isArray(topic) && Array.isArray(coderConfig)) {
                for (let topicIndex = 0; topicIndex < topic.length; topicIndex++) {
                    coders[topic[topicIndex]] = new protobuf_coder_js_1.Coder(coderConfig[topicIndex].fileName, coderConfig[topicIndex].packageName, coderConfig[topicIndex].messageType);
                }
            }
            else if (!Array.isArray(topic) && !Array.isArray(coderConfig)) {
                coders[topic] = new protobuf_coder_js_1.Coder(coderConfig.fileName, coderConfig.packageName, coderConfig.messageType, coderConfig.fileDirectory);
            }
            else {
                throw new Error("Please provide valid coder config or topic");
            }
        }
        super(topic, coders, config);
    }
}
exports.SynchronousConsumer = SynchronousConsumer;
//# sourceMappingURL=synchronous_consumer.js.map