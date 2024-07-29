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
exports.AbstractDataTransformer = void 0;
const kafka_error_js_1 = require("../errors/kafka_error.js");
const logger_js_1 = require("../logger/logger.js");
const events_1 = require("events");
/**
 * Abstract DataTransformer class privides a way to create a Data transformer which takes input from the data consumer and
 * produces the transformed data using the passed producer. Services need to implement their own transform method.
 */
class AbstractDataTransformer extends events_1.EventEmitter {
    /**
    * @param {AbstractConsumer} consumer - the consumer instance to consume raw data
    * @param {AbstractProducer} producer - producer instance to produce the transformed data
    */
    constructor(consumer, producer, restart = true) {
        super();
        this.consumer = consumer;
        this.producer = producer;
        this.restart = restart;
    }
    /**
     * This method starts the data transformation process by inititating the consumer and calling the onData function
     *
     * @returns {Promise<void>}
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_js_1.Logger.info("Starting transformer.");
            yield this.producer.start();
            return yield this.consumer.start({
                next: this.onData.bind(this),
                error: (error) => {
                    logger_js_1.Logger.error(error);
                },
                closed: () => __awaiter(this, void 0, void 0, function* () {
                    if (this.restart) {
                        try {
                            yield this.producer.stop();
                            yield this.start();
                            return;
                        }
                        catch (error) {
                            return this.emit("dataTransformer.fatalError", kafka_error_js_1.KafkaError.createUnknown(error));
                        }
                    }
                    this.emit("dataTransformer.fatalError", new kafka_error_js_1.KafkaError("Transformer stopped", kafka_error_js_1.KafkaError.codes.UNKNOWN_CONSUMER_ERR, true, "Transformer stopped due to a fatal error."));
                    return;
                })
            });
        });
    }
    on(event, listener) {
        super.on(event, listener);
        return this;
    }
    /**
     * Will be called on each in coming event and transform the message value as expected to type T.
     *
     * @param {DeserialisedMessage} message
     *
     * @returns {Promise<any>}
     */
    onData(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const transformedBlock = yield this.transform(message.value);
            logger_js_1.Logger.debug({
                location: "abstract_data_transformer",
                function: "onData",
                status: "data received",
                data: {
                    blockNumber: transformedBlock.blockNumber,
                    length: transformedBlock.data.length
                }
            });
            if (transformedBlock.data.length > 0) {
                yield this.producer.produceEvent(transformedBlock.blockNumber.toString(), transformedBlock);
                logger_js_1.Logger.info({
                    location: "abstract_data_transformer",
                    function: "onData",
                    status: "data produced",
                    data: {
                        blockNumber: transformedBlock.blockNumber,
                        length: transformedBlock.data.length
                    }
                });
            }
        });
    }
}
exports.AbstractDataTransformer = AbstractDataTransformer;
//# sourceMappingURL=abstract_data_transformer.js.map