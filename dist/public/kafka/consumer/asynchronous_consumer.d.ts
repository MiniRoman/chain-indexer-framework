import { AsynchronousConsumer as InternalAsynchronousConsumer } from "../../../internal/kafka/consumer/asynchronous_consumer.js";
import { IConsumerConfig } from "../../../internal/interfaces/consumer_config.js";
/**
 * The AsynchronousConsumer extends InternalAsynchronousConsumer class to provide the abstraction of the coder class.
 * coders can be passed optionally if another type of serialising/deserialising is required.
 *
 * @extends AsynchronousConsumer
 */
export declare class AsynchronousConsumer extends InternalAsynchronousConsumer {
    /**
     * @constructor
     *
     * @param {IConsumerConfig} config - Key value pairs to override the default config of the consumer client.
     */
    constructor(config: IConsumerConfig);
}
