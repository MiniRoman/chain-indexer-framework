"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousProducer = void 0;
const synchronous_producer_js_1 = require("../../../internal/kafka/producer/synchronous_producer.js");
const protobuf_coder_js_1 = require("../../../internal/coder/protobuf_coder.js");
/**
 * SynchronousProducer class entends InternalSynchronousProducer which creates an instance of SynchronousProducer
 * it abstracts the usage of coder class internally. serialiser can be passed optionally if another type of
 * serialising/deserialising is required.
 */
class SynchronousProducer extends synchronous_producer_js_1.SynchronousProducer {
    /**
     *
     * @param {IProducerConfig} config - key value pairs to override the default config of the producer client.
     */
    constructor(config) {
        let coder = config.coder;
        delete config.coder;
        if (!coder) {
            throw new Error("Please provide coder");
        }
        if ("fileName" in coder) {
            coder = new protobuf_coder_js_1.Coder(coder.fileName, coder.packageName, coder.messageType, coder.fileDirectory);
        }
        super(coder, config);
    }
}
exports.SynchronousProducer = SynchronousProducer;
//# sourceMappingURL=synchronous_producer.js.map