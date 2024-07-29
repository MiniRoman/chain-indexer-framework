"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const asynchronous_data_transformer_js_1 = require("./asynchronous_data_transformer.js");
const synchronous_data_transformer_js_1 = require("./synchronous_data_transformer.js");
/**
 * Function to be used as functional implementation for the transformer classes for asynchronous
 * and synchronous data trasnformer. this function will creates the class and then start transforming the events.
 * transform function needs to be passed.
 *
 * @param {ITransformerConfig} config - consumer config
 * @param {IEventTransformer<T, G, KafkaError>} eventTransformer - event transformer containing and transform and error function
 *
 * @returns {AsynchronousDataTransformer<T, G> | SynchronousDataTransformer<T, G>}
 */
function transform(config, eventTransformer) {
    const type = config.type;
    const consumerConfig = config.consumerConfig;
    const producerConfig = config.producerConfig;
    let transformer;
    switch (type) {
        case "asynchronous": {
            //@ts-ignore
            transformer = new asynchronous_data_transformer_js_1.AsynchronousDataTransformer(consumerConfig, producerConfig);
            break;
        }
        case "synchronous": {
            //@ts-ignore
            transformer = new synchronous_data_transformer_js_1.SynchronousDataTransformer(consumerConfig, producerConfig);
            break;
        }
        default: {
            throw new Error("Invalid type");
        }
    }
    eventTransformer.error.bind(transformer);
    eventTransformer.transform.bind(transformer);
    //@ts-ignore
    transformer.transform = eventTransformer.transform;
    transformer.on("dataTransformer.fatalError", eventTransformer.error);
    transformer.start();
    return transformer;
}
exports.transform = transform;
//# sourceMappingURL=transform.js.map