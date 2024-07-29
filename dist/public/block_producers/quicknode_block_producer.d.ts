import { BlockProducer } from "../../internal/block_producers/block_producer.js";
import { IBlockProducerConfig } from "../../internal/interfaces/block_producer_config.js";
/**
 * Quicknode block producer class which retrieves block from quick node
 * for producing to kafka.
 *
 */
export declare class QuickNodeBlockProducer extends BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {QuickNodeBlockProducer}
     */
    constructor(config: IBlockProducerConfig);
}
