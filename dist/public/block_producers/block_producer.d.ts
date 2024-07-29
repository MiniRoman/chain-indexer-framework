import { BlockProducer as InternalBlockProducer } from "../../internal/block_producers/block_producer.js";
import { IBlockProducerConfig } from "../../internal/interfaces/block_producer_config.js";
/**
 * Common lock producer class which contains the common logic to retrieve
 * raw block data from the configurable "startblock" number, and produce it to
 * a kafka cluster while detecting re orgs and handling them.
 * The block data source, and kafka modules is provided the user of this class.
 *
 * @author - Nitin Mittal
 */
export declare class BlockProducer extends InternalBlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {BlockProducer}
     */
    constructor(config: IBlockProducerConfig);
}
