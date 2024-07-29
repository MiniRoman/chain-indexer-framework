/// <reference types="node" />
import { DeserialisedMessage } from "../interfaces/deserialised_kafka_message.js";
import { ITransformedBlock } from "../interfaces/transformed_block.js";
import { AbstractConsumer } from "../kafka/consumer/abstract_consumer.js";
import { AbstractProducer } from "../kafka/producer/abstract_producer.js";
import { KafkaError } from "../errors/kafka_error.js";
import { EventEmitter } from "events";
/**
 * Abstract DataTransformer class privides a way to create a Data transformer which takes input from the data consumer and
 * produces the transformed data using the passed producer. Services need to implement their own transform method.
 */
export declare abstract class AbstractDataTransformer<T, G> extends EventEmitter {
    protected consumer: AbstractConsumer;
    protected producer: AbstractProducer;
    protected restart: boolean;
    /**
    * @param {AbstractConsumer} consumer - the consumer instance to consume raw data
    * @param {AbstractProducer} producer - producer instance to produce the transformed data
    */
    constructor(consumer: AbstractConsumer, producer: AbstractProducer, restart?: boolean);
    /**
     * @param {T} data can be of any type of raw block
     *
     * @returns {Promise<ITransformedBlock<G>>} - Returns the transformed data of type G
     */
    protected abstract transform(data: T): Promise<ITransformedBlock<G>>;
    /**
     * This method starts the data transformation process by inititating the consumer and calling the onData function
     *
     * @returns {Promise<void>}
     */
    start(): Promise<void>;
    on(event: "dataTransformer.fatalError", listener: (error: KafkaError) => void): this;
    /**
     * Will be called on each in coming event and transform the message value as expected to type T.
     *
     * @param {DeserialisedMessage} message
     *
     * @returns {Promise<any>}
     */
    protected onData(message: DeserialisedMessage): Promise<any>;
}
