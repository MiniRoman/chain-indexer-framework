"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produce = void 0;
const synchronous_producer_js_1 = require("./synchronous_producer.js");
const asynchronous_producer_js_1 = require("./asynchronous_producer.js");
const block_polling_producer_js_1 = require("../../block_producers/block_polling_producer.js");
const quicknode_block_producer_js_1 = require("../../block_producers/quicknode_block_producer.js");
const erigon_block_producer_js_1 = require("../../block_producers/erigon_block_producer.js");
const block_producer_js_1 = require("../../block_producers/block_producer.js");
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
function produce(config, eventProducer) {
    const type = config.type;
    delete config.type;
    let producer;
    switch (type) {
        case "asynchronous": {
            producer = new asynchronous_producer_js_1.AsynchronousProducer(config);
            break;
        }
        case "synchronous": {
            producer = new synchronous_producer_js_1.SynchronousProducer(config);
            break;
        }
        case "blocks:quicknode": {
            producer = new quicknode_block_producer_js_1.QuickNodeBlockProducer(config);
            break;
        }
        case "blocks:erigon": {
            producer = new erigon_block_producer_js_1.ErigonBlockProducer(config);
            break;
        }
        case "blocks:polling": {
            producer = new block_polling_producer_js_1.BlockPollerProducer(config);
            break;
        }
        case "blocks": {
            producer = new block_producer_js_1.BlockProducer(config);
            break;
        }
        default: {
            throw new Error("Invalid type");
        }
    }
    producer.start();
    if (eventProducer) {
        eventProducer.emitter.bind(producer);
        eventProducer.error.bind(producer);
        eventProducer.closed.bind(producer);
        producer.on("producer.error", eventProducer.error);
        producer.on("blockProducer.fatalError", eventProducer.error);
        producer.on("producer.disconnected", eventProducer.closed);
        eventProducer.emitter();
    }
    return producer;
}
exports.produce = produce;
//# sourceMappingURL=produce.js.map