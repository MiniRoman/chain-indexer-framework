import { IBlockProducerConfig } from "../../internal/interfaces/block_producer_config.js";
import { BlockProducer } from "../../internal/block_producers/block_producer.js";
/**
 * Block Poller producer class which retrieves block from polling every block
 * for producing to kafka.
 *
 */
export declare class BlockPollerProducer extends BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {BlockPollerProducer}
     */
    constructor(config: IBlockProducerConfig);
}
