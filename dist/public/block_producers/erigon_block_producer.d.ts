import { IBlockProducerConfig } from "../../internal/interfaces/block_producer_config.js";
import { BlockProducer } from "../../internal/block_producers/block_producer.js";
/**
 * Erigon block producer class which retrieves block from erigon node
 * for producing to kafka.
 *
 * @author - Vibhu Rajeev
 */
export declare class ErigonBlockProducer extends BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {ErigonBlockProducer}
     */
    constructor(config: IBlockProducerConfig);
}
