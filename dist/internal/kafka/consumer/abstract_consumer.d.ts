import noderdkafka, { Metadata, LibrdKafkaError, Message } from "node-rdkafka";
import { DeserialisedMessage } from "../../interfaces/deserialised_kafka_message.js";
import { IConsumerQueueObject } from "../../interfaces/consumer_queue_object.js";
import { IConsumerConfig } from "../../interfaces/consumer_config.js";
import { IKafkaCoderConfig } from "../../interfaces/kafka_coder_config.js";
import { IObserver } from "../../interfaces/observer.js";
import { BaseError } from "../../errors/base_error.js";
import { Queue } from "../../queue/queue.js";
/**
 * Abstract Consumer class wraps the Producer class of Node-RdKafka and provides simple straightforward methods to start producing events to Kafka.
 * Connection is handled by the class internally and an option to create the connection manually is also provided. Connecting manually allows to get the
 * metadata details and also avoid latency involved in creating a connection on production of first event.
 * Each public method follows a promised based error handling pattern to report thrown during the execution of the method.
 * To capture all exceptions that may occur internally in the library outside the execution of a method, error event is emitted which can be subscribed to.
 * @extends noderdkafka.KafkaConsumer
 * @author Vibhu Rajeev - Polygon Technology - 2022
 */
export declare abstract class AbstractConsumer extends noderdkafka.KafkaConsumer {
    private coders;
    private consumerPaused;
    private maxBufferLength;
    private connectionTimeout;
    private consumerConnected;
    private consumerConnecting;
    private consumerConnectPromise;
    private brokerMetadata;
    private queueIsProcessing;
    private startOffsets;
    protected topics: string[];
    protected maxRetries: number;
    protected queue: Queue<IConsumerQueueObject<DeserialisedMessage>>;
    protected observer: IObserver<DeserialisedMessage, BaseError> | null;
    private seekCalled;
    /**
     * @param {string|string[]} topic - The default topic that the consumer will subscribe to in case not specified in the method.
     * @param {IKafkaCoderConfig} coders  - Object with coder instances where key is the topic name.
     * @param {IConsumerConfig} config - Key value pairs to override the default config of the consumer client.
     * The following additional config can also be set:
     *      1. [maxBufferLength=100]  - The maximum length of the internal buffer exceeding which consumer will be paused.
     *      2. [maxRetries=10] - Number of times to retry executing the onData promise before giving up.
     *      3. [flushTimeout=10000] - Timeout in milliseconds before which the buffer of internal producer client should be cleared when the disconnect method is called.
     */
    constructor(topic: string | string[], coders: IKafkaCoderConfig, config?: IConsumerConfig);
    /**
     * This method must be implemented by the subclasses. This method is called before adding the message to queue.
     * It must be used to call promises concurrently, before adding to queue.
     *
     * @param {DeserialisedMessage} message - The Deserialised message to perform any action on.
     * @returns {IConsumerQueueObject} - The method needs to return an object that implements interface IConsumerQueueObject.
     */
    protected abstract enqueue(message: DeserialisedMessage): IConsumerQueueObject<DeserialisedMessage>;
    /**
     * Private internal method to connect to the broker and return broker metadata.
     *
     * @returns {Promise<Metadata>} A promise which resolves to give the metadata of connected.
     *
     * @throws {KafkaError} - On failure to connect, rejects with the kafka error.
     */
    private connectToBroker;
    /**
     * The private internal method, that pauses or resumes the consumer based on the current
     * length of internal buffer.
     *
     * @param message {DeserialisedMessage} - The latest message added to the queue.
     *
     * @returns {void}
     */
    private handleBackpressure;
    /**
     * @async
     * Protected method, which deserialises the kafka message and adds it to the internal queue.
     * It also then calls handlebackPressure() and processQueue() after the message is added to the queue.
     *
     * @param {Message} message - The kafka message, value of which needs to be deserialised.
     *
     * @throws {KafkaError|CoderError} - Throws CoderError or KafkaError on failure to deserialise or add the message to queue.
     */
    protected onData(message: Message): Promise<void>;
    /**
     * Internal private method to commitMessage and retry on failure upto maxRetries.
     *
     * @param {Message} message - Kafka message to be committed to cluster.
     *
     * @param {number} errorCount - This param must not be set externally and is used to track errorCount.
     */
    private safeCommitMessage;
    /**
     * Private internal method that is used to process a queue of messages, commit its offset after successful processing/
     * On failure after maximum retries of processing a message, the queue is cleared and error function of the observer is called.
     *
     * @returns {Promise<void>}
     */
    private processQueue;
    /**
     * @async
     * Private internal method to deserialise every message.
     *
     * @param {Messsage} message - Kafka message of which the value needs to be deserialised
     *
     * @returns {Promise<DeserialisedMessage>} - The LibRdKafka message object with deserialised message value.
     *
     * @throws {CoderError} - Throws coder error on failure to deserialise.
     */
    private deserialize;
    /**
     * Internal method which clears the queue and diconnects the kafka consumer on fatal
     * error, and always informs the observer about any error
     *
     * @param {BaseError} error - The error object to be acted on.
     *
     * @returns {void}
     */
    protected onError(error: BaseError): void;
    /**
     * Private method which updates the connection status of consumer to disconnected, and removes all listeners.
     *
     * @returns {void}
     */
    private onDisconnect;
    /**
     * Private internal method to subscribe a consumer to a single topic and start consuming from previously committed offset.
     *
     * @returns {Promise<void>}
     */
    private createSubscription;
    /**
     * @async
     * Method to connect the consumer to broker and update the connection status in the class.
     * This method is called internally when produceEvent() method is called if consumer is not connected.
     * In cases where it may be beneficial to connect the consumer in advance, it may be called by an external caller.
     * If there is an already existing promise to connect to broker, the method will wait for the original promise to resolve.
     *
     * @returns {Promise<Metadata|LibrdKafkaError>} - The promise resolves to give the object containing the metadata of broker that
     * the consumer is connected to and the topics available in that broker or the error thrown during connection.
     *
     * @throws {KafkaError} - Throws error object on failure.
     */
    createConnection(): Promise<Metadata | LibrdKafkaError | Error>;
    /**
     * @async
     * The main entry point to start consuming events. This method returns an observable object which on subscription
     * connects the consumer to a broker if not connection and creates a stream of messages consumed from kafka.
     * Calling this event, creates a new stream everytime.
     *
     * @param {Observer} observer - Th observer object to be passed consisting of next(), error(), and closed().
     * next() method is the promise method to be called for every event.
     *
     * @returns {Promise<void>} - This method on resolving does not return any value.
     *
     * @throws {KafkaError} - Throws KafkaError on failure to connect or subscribe to the topic.
     */
    start(observer: IObserver<DeserialisedMessage, BaseError>): Promise<void>;
    /**
     * Public method that must be called to stop consuming kafka events. It de registers all listeners and disconnects from brokers.
     *
     * @returns {void}
     */
    stop(): void;
}
