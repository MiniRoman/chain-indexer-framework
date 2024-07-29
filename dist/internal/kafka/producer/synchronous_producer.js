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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousProducer = void 0;
const kafka_error_js_1 = require("../../errors/kafka_error.js");
const abstract_producer_js_1 = require("./abstract_producer.js");
/**
 * This class is to be used for producing events in a synchronous mode.
 * Each call waits for delivery report of the produced event to kafka before resolving.
 * This should be used for scenarios where exactly once semantics is important and speed is compromised.
 * If speed is important, then the AsynchronousProducer class must be used as it does not wait for each delivery report before resolving.
 * To achieve order guarantee, events must be produced only one at a time.
 */
class SynchronousProducer extends abstract_producer_js_1.AbstractProducer {
    /**
     * @param {Coder} serialiser - The Serialiser object to serialise messages before production.
     * @param {IProducerConfig} config - ey value pairs to override the default config of the producer client.
     */
    constructor(serialiser, config) {
        const deliveryTimeout = config.deliveryTimeout;
        delete config.deliveryTimeout;
        super(serialiser, config);
        this.deliveryTimeout = deliveryTimeout || 10000;
    }
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
    produceEvent(key, message, topic, partition, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                // @ts-ignore
                let deliveryListener;
                try {
                    const identifier = { time: Date.now() };
                    const timer = setTimeout(() => {
                        reject(new kafka_error_js_1.KafkaError("Kafka producer error", kafka_error_js_1.KafkaError.codes.DELIVERY_TIMED_OUT, false, `Could not receive delivery confirmation before ${this.deliveryTimeout} ms`, "remote"));
                    }, this.deliveryTimeout);
                    deliveryListener = (error, report) => {
                        if (error || (report.opaque === identifier && report.topic === topic)) {
                            this.removeListener("delivery-report", deliveryListener);
                            clearTimeout(timer);
                            if (error) {
                                reject(kafka_error_js_1.KafkaError.convertLibError(error));
                                return;
                            }
                            resolve(report);
                            return;
                        }
                    };
                    this.on("delivery-report", deliveryListener);
                    yield this.sendToInternalProducer(key, message, topic, partition, timestamp, identifier);
                    setTimeout(() => {
                        this.poll();
                    }, 100);
                }
                catch (error) {
                    // @ts-ignore
                    if (deliveryListener) {
                        this.removeListener("delivery-report", deliveryListener);
                    }
                    throw kafka_error_js_1.KafkaError.createUnknown(error);
                }
            }));
        });
    }
}
exports.SynchronousProducer = SynchronousProducer;
//# sourceMappingURL=synchronous_producer.js.map