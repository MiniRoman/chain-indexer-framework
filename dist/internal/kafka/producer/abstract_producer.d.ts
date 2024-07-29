import noderdkafka, { Metadata } from "node-rdkafka";
import { KafkaProducerEvents, EventListener } from "../../interfaces/common_kafka_events.js";
import { IProducerConfig } from "../../interfaces/producer_config.js";
import { ICoder } from "../../interfaces/coder.js";
import { KafkaError } from "../../errors/kafka_error.js";
/**
 * Producer class wraps the Producer class of Node-RdKafka and provides simple straightforward methods to start producing events to Kafka.
 * Connection is handled by the class internally and an option to create the connection manually is also provided.
 * Connecting manually allows to get the metadata details and also avoid latency involved in creating a connection on production of first event.
 * Each public method follows a promised based error handling pattern to report thrown during the execution of the method.
 * To capture all exceptions that may occur internally in the library or the kafka producer client, error event ('producer.error') is emitted which can be subscribed to.
 * @extends noderdkafka.Producer
 */
export declare abstract class AbstractProducer extends noderdkafka.Producer {
    private serialiser;
    private topic;
    private producerConnected;
    private producerConnecting;
    private producerConnectPromise?;
    private pollInterval;
    private connectionTimeout;
    private flushTimeout;
    private stopProducerPromise?;
    private static readonly DISCONNECTED;
    private static readonly ERROR;
    /**
     * @param {Coder} serialiser - The Serialiser object to serialise messages before production.
     * @param {IProducerConfig}  config - Key value pairs to override the default config of the producer client.
     */
    constructor(serialiser: ICoder, config: IProducerConfig);
    once(event: "producer.error", listener: (error: KafkaError) => void): this;
    once(event: "producer.disconnected", listener: () => void): this;
    once<E extends KafkaProducerEvents>(event: E, listener: EventListener<E>): this;
    on(event: "producer.error", listener: (error: KafkaError) => void): this;
    on(event: "producer.disconnected", listener: () => void): this;
    on<E extends KafkaProducerEvents>(event: E, listener: EventListener<E>): this;
    /**
     * Private internal method to connect to the broker and subscribe to the librdkafka events.
     *
     * @returns {Promise<Metadata|LibrdKafkaError>} A promise which resolves to give the metadata of connected broker or rejects with the error that caused connection failure.
     */
    private connectToBroker;
    /**
     * Private internal method to handle connection internally when disconnected from broker
     * and if no re connection is achieved emit disconnected event.
     *
     * @returns {void}
     */
    private onDisconnected;
    /**
     * Internal private method to emit error event when librdkafka reports an error.
     *
     * @param {LibrdKafkaError} error - Error object to be emitted.
     *
     * @returns {void}
     */
    private onKafkaError;
    /**
     * @async
     * Method to connect the producer to broker and update the connection status in the class.
     * This method is called internally when produceEvent() method is called if producer is not connected.
     * In cases where it may be beneficial to connect the producer in advance, it may be called by an external caller.
     * If there is an already existing promise to connect to broker, the method will wait for the original promise to resolve.
     *
     * @returns {Promise<Metadata|LibrdKafkaError>} - The object containing the metadata of broker that the producer is connected to
     * and the topics available in that broker or the error thrown during connection.
     */
    start(): Promise<Metadata | KafkaError>;
    /**
     * @async
     * This method serialises and sends the message to the internal producer client. It resolves on successful adding of
     * event to internal producer buffer which means it does not guarantee delivery of message to kafka cluster.
     * The method throws an error on failure which is usually when the queue is full. It is recommended to listen
     * "delivered" event for confirmation and set "acks" setting to -1 which is the default setting.
     *
     * @param {string} key - The key associated with the message.
     * @param {object} message - The message object to produce to kafka
     * @param {string} topic - The topic name to produce the event to.
     * @param {number} partition - To manually set the partition number of the topic to which the event needs to be produced to.
     * @param {number} timestamp - To manually set the timestamp (Unix in ms) of the message.
     * @param {object} opaque - Per-message opaque pointer that will be provided in the delivery report callback (dr_cb) for referencing this message.
     *
     * @returns {Promise<LibrdKafkaError|boolean|Error>} - Throws an error if it failed, or resolves to "true" if not
     *
     * @throws {LibrdKafkaError|Error} - Throws the exception behind the failure.
     */
    sendToInternalProducer(key: string, message: object, topic?: string, partition?: number, timestamp?: number, opaque?: object): Promise<KafkaError | boolean>;
    /**
     * This methods clears the internal client buffer by sending all the messages and on success disconnects the producer client from clust
     *
     * @returns {true} - Returns true on successful disconnection. The producer still disconnects on failure to flush before timeout.
     *
     * @throws {LibrdKafkaError} - Throws any error faced during flushing or disconnecting.
     */
    stop(): Promise<boolean>;
    /**
     * @param {string} topic - The topic name to produce the event to.
     * @param {string} key - The key associated with the message.
     * @param {object} message - The message object to produce to kafka
     * @param {number} partition - To manually set the partition number of the topic to which the event needs to be produced to.
     * @param {number} timestamp - To manually set the timestamp (Unix in ms) of the message.
     * @param {object} opaque - Per-message opaque pointer that will be provided in the delivery report callback (dr_cb) for referencing this message.
     *
     * @returns {Promise<LibrdKafkaError|boolean|Error>} - Returns an error if it failed, or true if not
     */
    abstract produceEvent(key: string, message: object, topic?: string, partition?: number, timestamp?: number, opaque?: object): Promise<any>;
}
