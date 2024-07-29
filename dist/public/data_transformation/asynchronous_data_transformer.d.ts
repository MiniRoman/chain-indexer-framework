import { AbstractDataTransformer } from "../../internal/data_transformation/abstract_data_transformer.js";
import { IConsumerConfig } from "../../internal/interfaces/consumer_config.js";
import { IProducerConfig } from "../../internal/interfaces/producer_config.js";
/**
 * Concurrent Data transformer transforms the data concurrently and doesn't for the transformed data to produce before
 * transforming data further. Services needs to implement their own transform method
 */
export declare abstract class AsynchronousDataTransformer<T, G> extends AbstractDataTransformer<T, G> {
    /**
     * @param {IConsumerConfig} consumerConfig - consumer config to create AsynchronousConsumer interface
     * @param {IProducerConfig} producerConfig - producer config to create AsynchronousProducer interface
     */
    constructor(consumerConfig: IConsumerConfig, producerConfig: IProducerConfig);
}
