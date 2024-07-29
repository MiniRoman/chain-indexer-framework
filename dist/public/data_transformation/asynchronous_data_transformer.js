"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsynchronousDataTransformer = void 0;
const asynchronous_consumer_js_1 = require("../kafka/consumer/asynchronous_consumer.js");
const asynchronous_producer_js_1 = require("../kafka/producer/asynchronous_producer.js");
const abstract_data_transformer_js_1 = require("../../internal/data_transformation/abstract_data_transformer.js");
/**
 * Concurrent Data transformer transforms the data concurrently and doesn't for the transformed data to produce before
 * transforming data further. Services needs to implement their own transform method
 */
class AsynchronousDataTransformer extends abstract_data_transformer_js_1.AbstractDataTransformer {
    /**
     * @param {IConsumerConfig} consumerConfig - consumer config to create AsynchronousConsumer interface
     * @param {IProducerConfig} producerConfig - producer config to create AsynchronousProducer interface
     */
    constructor(consumerConfig, producerConfig) {
        super(new asynchronous_consumer_js_1.AsynchronousConsumer(consumerConfig), new asynchronous_producer_js_1.AsynchronousProducer(producerConfig));
    }
}
exports.AsynchronousDataTransformer = AsynchronousDataTransformer;
//# sourceMappingURL=asynchronous_data_transformer.js.map