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
exports.AbstractProducer = void 0;
const node_rdkafka_1 = __importDefault(require("node-rdkafka"));
const kafka_error_js_1 = require("../../errors/kafka_error.js");
/**
 * Producer class wraps the Producer class of Node-RdKafka and provides simple straightforward methods to start producing events to Kafka.
 * Connection is handled by the class internally and an option to create the connection manually is also provided.
 * Connecting manually allows to get the metadata details and also avoid latency involved in creating a connection on production of first event.
 * Each public method follows a promised based error handling pattern to report thrown during the execution of the method.
 * To capture all exceptions that may occur internally in the library or the kafka producer client, error event ('producer.error') is emitted which can be subscribed to.
 * @extends noderdkafka.Producer
 */
class AbstractProducer extends node_rdkafka_1.default.Producer {
    /**
     * @param {Coder} serialiser - The Serialiser object to serialise messages before production.
     * @param {IProducerConfig}  config - Key value pairs to override the default config of the producer client.
     */
    constructor(serialiser, config) {
        // This has to be done cause otherwise Kafka complains
        const pollInterval = config.pollInterval || 1000;
        const connectionTimeout = config.connectionTimeout || 10000;
        const flushTimeout = config.flushTimeout || 10000;
        const topic = config.topic;
        delete config.pollInterval;
        delete config.connectionTimeout;
        delete config.flushTimeout;
        delete config.topic;
        super(Object.assign({
            "bootstrap.servers": "localhost:9092",
            "dr_cb": true,
            "enable.idempotence": true,
            "acks": -1
        }, config));
        this.serialiser = serialiser;
        this.producerConnected = false;
        this.producerConnecting = false;
        this.pollInterval = pollInterval;
        this.connectionTimeout = connectionTimeout;
        this.flushTimeout = flushTimeout;
        this.topic = topic;
    }
    once(event, listener) {
        //@ts-ignore
        return super.once(event, listener);
    }
    on(event, listener) {
        //@ts-ignore
        return super.on(event, listener);
    }
    /**
     * Private internal method to connect to the broker and subscribe to the librdkafka events.
     *
     * @returns {Promise<Metadata|LibrdKafkaError>} A promise which resolves to give the metadata of connected broker or rejects with the error that caused connection failure.
     */
    connectToBroker() {
        return new Promise((resolve, reject) => {
            this.on("event.error", (error) => {
                this.onKafkaError(kafka_error_js_1.KafkaError.convertLibError(error, true));
            })
                .on("disconnected", this.onDisconnected.bind(this));
            this.producerConnecting = true;
            // The method can be expanded in future to allow requesting metadata of specific topics along with broker details. 
            this.connect({ timeout: this.connectionTimeout }, (error, metadata) => {
                this.producerConnecting = false;
                if (error) {
                    reject(error);
                    return;
                }
                this.setPollInterval(this.pollInterval);
                this.producerConnected = true;
                resolve(metadata);
            });
        });
    }
    /**
     * Private internal method to handle connection internally when disconnected from broker
     * and if no re connection is achieved emit disconnected event.
     *
     * @returns {void}
     */
    onDisconnected() {
        //Can further implement reconnecting logic failing which, disconnected event will be emitted. 
        this.producerConnected = false;
        this.emit(AbstractProducer.DISCONNECTED);
        this.removeAllListeners("event.error");
        this.removeAllListeners("disconnected");
    }
    /**
     * Internal private method to emit error event when librdkafka reports an error.
     *
     * @param {LibrdKafkaError} error - Error object to be emitted.
     *
     * @returns {void}
     */
    onKafkaError(error) {
        this.emit(AbstractProducer.ERROR, error);
        return;
    }
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
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.producerConnecting && !this.producerConnected) {
                    this.producerConnectPromise = this.connectToBroker();
                }
                const brokerMetadata = yield this.producerConnectPromise;
                return brokerMetadata;
            }
            catch (error) {
                this.producerConnecting = false;
                throw kafka_error_js_1.KafkaError.createUnknown(error, true);
            }
        });
    }
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
    sendToInternalProducer(key, message, topic = this.topic, partition, timestamp, opaque) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.producerConnected) {
                    yield this.start();
                }
                // TODO: Runtime check for all parameters
                const produced = yield this.produce(topic, partition, yield this.serialiser.serialize(message), key, timestamp, opaque);
                if (produced === true) {
                    return produced;
                }
                throw produced;
            }
            catch (error) {
                this.onKafkaError(kafka_error_js_1.KafkaError.createUnknown(error, true));
                throw kafka_error_js_1.KafkaError.createUnknown(error, true);
            }
        });
    }
    /**
     * This methods clears the internal client buffer by sending all the messages and on success disconnects the producer client from clust
     *
     * @returns {true} - Returns true on successful disconnection. The producer still disconnects on failure to flush before timeout.
     *
     * @throws {LibrdKafkaError} - Throws any error faced during flushing or disconnecting.
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.stopProducerPromise) {
                    this.stopProducerPromise = new Promise((resolve, reject) => {
                        this.disconnect(this.flushTimeout, (error) => {
                            if (error) {
                                return reject(kafka_error_js_1.KafkaError.convertLibError(error));
                            }
                            return resolve(true);
                        });
                    });
                }
                yield this.stopProducerPromise;
                this.stopProducerPromise = undefined;
                return true;
            }
            catch (error) {
                this.stopProducerPromise = undefined;
                throw error;
            }
        });
    }
}
exports.AbstractProducer = AbstractProducer;
AbstractProducer.DISCONNECTED = "producer.disconnected";
AbstractProducer.ERROR = "producer.error";
//# sourceMappingURL=abstract_producer.js.map