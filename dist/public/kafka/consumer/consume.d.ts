import { IConsumerConfig } from "../../../internal/interfaces/consumer_config.js";
import { SynchronousConsumer } from "./synchronous_consumer.js";
import { AsynchronousConsumer } from "./asynchronous_consumer.js";
import { IObserver } from "../../../internal/interfaces/observer.js";
import { DeserialisedMessage } from "../../../public/index.js";
import { BaseError } from "../../../internal/errors/base_error.js";
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
export declare function consume(config: IConsumerConfig, observer: IObserver<DeserialisedMessage, BaseError>): AsynchronousConsumer | SynchronousConsumer;
