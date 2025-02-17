import { IProducerConfig } from "../../interfaces/producer_config.js";
import { DeliveryReport } from "node-rdkafka";
import { KafkaError } from "../../errors/kafka_error.js";
import { AbstractProducer } from "./abstract_producer.js";
import { ICoder } from "../../interfaces/coder.js";
/**
 * This class is to be used for producing events in a synchronous mode.
 * Each call waits for delivery report of the produced event to kafka before resolving.
 * This should be used for scenarios where exactly once semantics is important and speed is compromised.
 * If speed is important, then the AsynchronousProducer class must be used as it does not wait for each delivery report before resolving.
 * To achieve order guarantee, events must be produced only one at a time.
 */
export declare class SynchronousProducer extends AbstractProducer {
    private deliveryTimeout;
    /**
     * @param {Coder} serialiser - The Serialiser object to serialise messages before production.
     * @param {IProducerConfig} config - ey value pairs to override the default config of the producer client.
     */
    constructor(serialiser: ICoder, config: IProducerConfig);
    /**
     * @async
     * This is method produces an event to kafka in synchrononous mode. Which means it waits for successful delivery report before resolving.
     * The method throws an error on failure which is usually when the queue is full or when it cannot retrieve delivery report successfully.
     * Resolving of this function is confirmation that message has been successfully delivered to kafka. This method is slower than the produceEventAsynchronously method.
     * If using this function for producing events it is recommended that 'acks' in producer config is -1 which is the default value.
     * The produce event rejects with an error if delivery report not received within certain timeout.User can re produce the message if
     * atleast once semantics is required and it is important to consider that the message may already be produced even with this rejection.
     *
     * @param {string} key - The key associated with the message.
     * @param {object} message - The message object to produce to kafka
     * @param {string} topic - The topic name to produce the event to.
     * @param {number} partition - To manually set the partition number of the topic to which the event needs to be produced to.
     * @param {number} timestamp - To manually set the timestamp (Unix in ms) of the message
     *
     * @returns {Promise<DeliveryReport|LibrdKafkaError|Error>} - Returns an error if it failed, or the delivery report of the delivered message
     */
    produceEvent(key: string, message: object, topic?: string, partition?: number, timestamp?: number): Promise<DeliveryReport | KafkaError>;
}
