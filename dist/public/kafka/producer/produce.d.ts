import { IProducerConfig } from "../../../internal/interfaces/producer_config.js";
import { IBlockProducerConfig } from "../../../internal/interfaces/block_producer_config.js";
import { KafkaError } from "../../../internal/errors/kafka_error.js";
import { IEventProducer } from "../../interfaces/event_producer.js";
/**
 * Function to be used as functional implementation for the producer classes for asynchronous
 * and synchronous producer and block producers. this function will create coder class if protobuf coder is required.
 * type and coder can be passed if coder other that protobuf coder is needed.
 *
 * @param {IProducerConfig} config - producer config
 * @param {IEventProducer<KafkaError>} eventProducer - event producer function object for emitter, error and close
 *
 * @returns {AsynchronousProducer | SynchronousProducer | BlockProducer}
 */
export declare function produce<T>(config: IProducerConfig | IBlockProducerConfig, eventProducer?: IEventProducer<KafkaError>): T;
