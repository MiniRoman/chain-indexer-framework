import { SynchronousConsumer as InternalSynchronousConsumer } from "../../../internal/kafka/consumer/synchronous_consumer.js";
import { IConsumerConfig } from "../../../internal/interfaces/consumer_config.js";
/**
 * The SynchronousConsumer extends InternalSynchronousConsumer class to provide the abstraction of the coder class.
 * coders can be passed optionally if another type of serialising/deserialising is required.
 *
 * @extends SynchronousConsumer
 */
export declare class SynchronousConsumer extends InternalSynchronousConsumer {
    /**
     * @constructor
     *
     * @param {IConsumerConfig} config - Key value pairs to override the default config of the consumer client.
     */
    constructor(config: IConsumerConfig);
}
