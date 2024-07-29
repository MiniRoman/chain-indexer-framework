"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsynchronousProducer = void 0;
const asynchronous_producer_js_1 = require("../../../internal/kafka/producer/asynchronous_producer.js");
const protobuf_coder_js_1 = require("../../../internal/coder/protobuf_coder.js");
/**
 * AsynchronousProducer class entends InternalAsynchronousProducer which creates an instance of AsynchronousProducer
 * it abstracts the usage of coder class internally. serialiser can be passed optionally if another type of
 * serialising/deserialising is required.
 */
class AsynchronousProducer extends asynchronous_producer_js_1.AsynchronousProducer {
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
exports.AsynchronousProducer = AsynchronousProducer;
//# sourceMappingURL=asynchronous_producer.js.map