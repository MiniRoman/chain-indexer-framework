"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousDataTransformer = void 0;
const synchronous_consumer_js_1 = require("../kafka/consumer/synchronous_consumer.js");
const asynchronous_producer_js_1 = require("../kafka/producer/asynchronous_producer.js");
const abstract_data_transformer_js_1 = require("../../internal/data_transformation/abstract_data_transformer.js");
/**
 * SynchronousDataTransformer transforms the data sequentially and waits for the transformed data to produce before
 * transforming data further. Services needs to implement their own transform method
 */
class SynchronousDataTransformer extends abstract_data_transformer_js_1.AbstractDataTransformer {
    /**
     * @param {IConsumerConfig} consumerConfig - consumer config to create SynchronousConsumer interface
     * @param {IProducerConfig} producerConfig - producer config to create AsynchronousProducer interface
     */
    constructor(consumerConfig, producerConfig) {
        super(new synchronous_consumer_js_1.SynchronousConsumer(consumerConfig), new asynchronous_producer_js_1.AsynchronousProducer(producerConfig));
    }
}
exports.SynchronousDataTransformer = SynchronousDataTransformer;
//# sourceMappingURL=synchronous_data_transformer.js.map