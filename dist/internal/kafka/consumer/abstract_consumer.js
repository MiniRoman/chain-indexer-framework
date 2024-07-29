"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractConsumer = void 0;
const node_rdkafka_1 = __importDefault(require("node-rdkafka"));
const is_base_error_js_1 = require("../../errors/is_base_error.js");
const kafka_error_js_1 = require("../../errors/kafka_error.js");
const logger_js_1 = require("../../logger/logger.js");
const queue_js_1 = require("../../queue/queue.js");
/**
 * Abstract Consumer class wraps the Producer class of Node-RdKafka and provides simple straightforward methods to start producing events to Kafka.
 * Connection is handled by the class internally and an option to create the connection manually is also provided. Connecting manually allows to get the
 * metadata details and also avoid latency involved in creating a connection on production of first event.
 * Each public method follows a promised based error handling pattern to report thrown during the execution of the method.
 * To capture all exceptions that may occur internally in the library outside the execution of a method, error event is emitted which can be subscribed to.
 * @extends noderdkafka.KafkaConsumer
 * @author Vibhu Rajeev - Polygon Technology - 2022
 */
class AbstractConsumer extends node_rdkafka_1.default.KafkaConsumer {
    /**
     * @param {string|string[]} topic - The default topic that the consumer will subscribe to in case not specified in the method.
     * @param {IKafkaCoderConfig} coders  - Object with coder instances where key is the topic name.
     * @param {IConsumerConfig} config - Key value pairs to override the default config of the consumer client.
     * The following additional config can also be set:
     *      1. [maxBufferLength=100]  - The maximum length of the internal buffer exceeding which consumer will be paused.
     *      2. [maxRetries=10] - Number of times to retry executing the onData promise before giving up.
     *      3. [flushTimeout=10000] - Timeout in milliseconds before which the buffer of internal producer client should be cleared when the disconnect method is called.
     */
    constructor(topic, coders, config = {}) {
        // Has to be done otherwise Kafka will complain (they have runtime checks)
        const maxBufferLength = config.maxBufferLength || 100;
        const maxRetries = config.maxRetries || config.maxRetries === 0 ? config.maxRetries : 10;
        const connectionTimeout = config.connectionTimeout || 10000;
        const topicConfig = config.topicConfig || {};
        const startOffsets = config.startOffsets || {};
        delete config.maxBufferLength;
        delete config.maxRetries;
        delete config.connectionTimeout;
        delete config.topicConfig;
        delete config.startOffsets;
        super(Object.assign({
            "debug": "cgrp",
            "bootstrap.servers": "localhost:9092",
            "enable.auto.commit": false,
            "enable.auto.offset.store": false,
            "event_cb": true,
            "message.max.bytes": 26214400,
            "fetch.message.max.bytes": 26214400,
            "queued.max.messages.kbytes": 25000,
            "isolation.level": "read_uncommitted",
        }, config), Object.assign({
            "auto.offset.reset": "earliest",
        }, topicConfig));
        this.coders = coders;
        this.consumerPaused = false;
        this.consumerConnected = false;
        this.consumerConnecting = false;
        this.consumerConnectPromise = null;
        this.brokerMetadata = null;
        this.queueIsProcessing = false;
        this.observer = null;
        this.seekCalled = false;
        //Below is required to not break current implementations. TODO: Apply changes with a breaking change.
        if (Array.isArray(topic)) {
            this.topics = topic;
        }
        else {
            this.topics = [topic];
        }
        this.queue = new queue_js_1.Queue();
        this.maxBufferLength = maxBufferLength;
        this.maxRetries = maxRetries;
        this.connectionTimeout = connectionTimeout;
        this.startOffsets = startOffsets;
    }
    /**
     * Private internal method to connect to the broker and return broker metadata.
     *
     * @returns {Promise<Metadata>} A promise which resolves to give the metadata of connected.
     *
     * @throws {KafkaError} - On failure to connect, rejects with the kafka error.
     */
    connectToBroker() {
        return new Promise((resolve, reject) => {
            // The method can be expanded in future to allow requesting metadata of specific topics along with broker details.
            this.consumerConnecting = true;
            this.connect({ timeout: this.connectionTimeout }, (error, metadata) => {
                this.consumerConnecting = false;
                if (error) {
                    reject(kafka_error_js_1.KafkaError.convertLibError(error));
                    return;
                }
                this.consumerConnected = true;
                this.brokerMetadata = metadata;
                logger_js_1.Logger.info(this.brokerMetadata);
                resolve(metadata);
            });
        });
    }
    /**
     * The private internal method, that pauses or resumes the consumer based on the current
     * length of internal buffer.
     *
     * @param message {DeserialisedMessage} - The latest message added to the queue.
     *
     * @returns {void}
     */
    handleBackpressure(message) {
        if (!this.consumerPaused && this.maxBufferLength <= this.queue.getLength()) {
            this.pause([message]);
            this.consumerPaused = true;
            return;
        }
        if (this.consumerPaused && this.queue.getLength() < this.maxBufferLength) {
            this.resume([message]);
            this.consumerPaused = false;
        }
    }
    /**
     * @async
     * Protected method, which deserialises the kafka message and adds it to the internal queue.
     * It also then calls handlebackPressure() and processQueue() after the message is added to the queue.
     *
     * @param {Message} message - The kafka message, value of which needs to be deserialised.
     *
     * @throws {KafkaError|CoderError} - Throws CoderError or KafkaError on failure to deserialise or add the message to queue.
     */
    onData(message) {
        return __awaiter(this, void 0, void 0, function* () {
            //Skip processing the message if behind start offset.
            if (message.offset < (this.startOffsets[message.topic] || 0)) {
                if (!this.seekCalled) {
                    logger_js_1.Logger.info(`Seeking offset number: ${this.startOffsets[message.topic]}, for topic: ${message.topic}`);
                    yield new Promise((res, rej) => this.seek({
                        topic: message.topic,
                        offset: this.startOffsets[message.topic],
                        partition: message.partition
                    }, this.connectionTimeout, (err) => {
                        if (err) {
                            return rej(err);
                        }
                        res(undefined);
                    }));
                    this.seekCalled = true;
                }
                return;
            }
            const deserializedMsg = yield this.deserialize(message);
            this.queue.enqueue(this.enqueue(deserializedMsg));
            this.handleBackpressure(deserializedMsg);
            this.processQueue();
        });
    }
    /**
     * Internal private method to commitMessage and retry on failure upto maxRetries.
     *
     * @param {Message} message - Kafka message to be committed to cluster.
     *
     * @param {number} errorCount - This param must not be set externally and is used to track errorCount.
     */
    safeCommitMessage(message, errorCount = 0) {
        try {
            this.commitMessage(message);
        }
        catch (error) {
            // TODO - skip retry if fatal error 
            if (this.maxRetries <= errorCount) {
                this.onError(kafka_error_js_1.KafkaError.createUnknown(error));
                return;
            }
            return this.safeCommitMessage(message, errorCount + 1);
        }
    }
    /**
     * Private internal method that is used to process a queue of messages, commit its offset after successful processing/
     * On failure after maximum retries of processing a message, the queue is cleared and error function of the observer is called.
     *
     * @returns {Promise<void>}
     */
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.observer) {
                throw new kafka_error_js_1.KafkaError("Kafka Consumer Error", kafka_error_js_1.KafkaError.codes.CONSUMER_OBSERVER_INVALID, true, "Observer is not set", "local");
            }
            if (this.queueIsProcessing) {
                return;
            }
            let errorCount = 0;
            this.queueIsProcessing = true;
            while (!this.queue.isEmpty()) {
                try {
                    const element = this.queue.front();
                    if (element.promise) {
                        yield element.promise;
                    }
                    else {
                        yield this.observer.next(element.message);
                    }
                    this.safeCommitMessage(element.message);
                    this.queue.shift();
                    this.handleBackpressure(element.message);
                    errorCount = 0;
                }
                catch (error) {
                    errorCount++;
                    if (errorCount > this.maxRetries || ((0, is_base_error_js_1.isBaseError)(error) && error.isFatal)) {
                        this.onError(kafka_error_js_1.KafkaError.createUnknown(error));
                        return;
                    }
                }
            }
            this.queueIsProcessing = false;
        });
    }
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
    deserialize(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.value) {
                Object.assign(message, {
                    value: yield this.coders[message.topic].deserialize(message.value)
                });
            }
            return message;
        });
    }
    /**
     * Internal method which clears the queue and diconnects the kafka consumer on fatal
     * error, and always informs the observer about any error
     *
     * @param {BaseError} error - The error object to be acted on.
     *
     * @returns {void}
     */
    onError(error) {
        var _a;
        if (error.isFatal) {
            this.queue.clear();
            this.stop();
        }
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.error(error);
    }
    /**
     * Private method which updates the connection status of consumer to disconnected, and removes all listeners.
     *
     * @returns {void}
     */
    onDisconnect() {
        var _a;
        if (this.consumerConnected || this.brokerMetadata || !this.queue.isEmpty()) {
            this.queue.clear();
            this.brokerMetadata = null;
            this.consumerConnected = false;
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.closed();
            this.removeAllListeners();
        }
    }
    /**
     * Private internal method to subscribe a consumer to a single topic and start consuming from previously committed offset.
     *
     * @returns {Promise<void>}
     */
    createSubscription() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.consumerConnected) {
                    yield this.createConnection();
                }
                // Can alternatively use this.assign();
                this.subscribe(this.topics);
                this.consume();
            }
            catch (error) {
                throw kafka_error_js_1.KafkaError.createUnknown(error);
            }
        });
    }
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
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object.keys(this.coders).length !== this.topics.length) {
                throw new kafka_error_js_1.KafkaError("Invalid coder config", kafka_error_js_1.KafkaError.codes.INVALID_CODER_CONFIG, true, "Coder configuration is not set for every topic.", "local");
            }
            this.topics.forEach((topic) => {
                if (!this.coders[topic]) {
                    throw new kafka_error_js_1.KafkaError("Invalid coder config", kafka_error_js_1.KafkaError.codes.INVALID_CODER_CONFIG, true, "Coder config does not match topic names.", "local");
                }
            });
            if (!this.consumerConnecting && !this.consumerConnected) {
                this.consumerConnectPromise = this.connectToBroker();
            }
            return this.brokerMetadata ? this.brokerMetadata : yield this.consumerConnectPromise;
        });
    }
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
    start(observer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.listenerCount("event.error") || this.listenerCount("data") || this.listenerCount("disconnected")) {
                this.removeAllListeners();
            }
            this.observer = observer;
            this.on("event.error", (error) => this.onError(kafka_error_js_1.KafkaError.convertLibError(error)))
                .on("data", (message) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.onData(message);
                }
                catch (error) {
                    this.onError(kafka_error_js_1.KafkaError.createUnknown(error));
                }
            }))
                .on("disconnected", this.onDisconnect.bind(this));
            yield this.createSubscription();
        });
    }
    /**
     * Public method that must be called to stop consuming kafka events. It de registers all listeners and disconnects from brokers.
     *
     * @returns {void}
     */
    stop() {
        this.disconnect((err) => {
            if (err) {
                logger_js_1.Logger.error(kafka_error_js_1.KafkaError.createUnknown(err));
            }
            this.onDisconnect();
        });
    }
}
exports.AbstractConsumer = AbstractConsumer;
//# sourceMappingURL=abstract_consumer.js.map