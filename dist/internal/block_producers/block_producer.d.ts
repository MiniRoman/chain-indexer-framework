import { IProducedBlock, IProducedBlocksModel } from "./produced_blocks_model.js";
import { KafkaProducerEvents, EventListener } from "../interfaces/common_kafka_events.js";
import { AsynchronousProducer } from "../kafka/producer/asynchronous_producer.js";
import { IBlockSubscription } from "../interfaces/block_subscription.js";
import { BlockProducerError } from "../errors/block_producer_error.js";
import { IProducerConfig } from "../interfaces/producer_config.js";
import { BlockGetter } from "../block_getters/block_getter.js";
import { Metadata, DeliveryReport } from "node-rdkafka";
import { KafkaError } from "../errors/kafka_error.js";
import { ICoder } from "../interfaces/coder.js";
import { IBlock } from "../interfaces/block.js";
import { Database } from "../mongo/database.js";
/**
 * Common lock producer class which contains the common logic to retrieve
 * raw block data from the configurable "startblock" number, and produce it to
 * a kafka cluster while detecting re orgs and handling them.
 * The block data source, and kafka modules is provided the user of this class.
 *
 * @author - Vibhu Rajeev
 */
export declare class BlockProducer extends AsynchronousProducer {
    private blockSubscription;
    private blockGetter;
    private database;
    private producedBlocksModel;
    private startBlock;
    private maxReOrgDepth;
    private mongoInsertQueue;
    private queueProcessingPromise?;
    private mongoInsertInProcess;
    private restartPromise?;
    private producingBlockPromises;
    private forceStop;
    /**
     * @constructor
     *
     * @param {ICoder} coder - The protobuf coder which will be used for serialising messages.
     * @param {IProducerConfig} config - Kafka producer config.
     * @param {IBlockSubscription} blockSubscription - The block subscription instance which will emit block data.
     * @param {BlockGetter} blockGetter - BlockGetter class instance
     * @param {Database} database - database instance
     * @param {IProducedBlocksModel<IProducedBlock>} producedBlocksModel - The produced blocks model
     * which exposes methods to add and query produced block data.
     * @param {number} maxReOrgDepth - The depth upto which a re org can occur.
     */
    constructor(coder: ICoder, config: IProducerConfig, blockSubscription: IBlockSubscription<IBlock, BlockProducerError>, blockGetter: BlockGetter, database: Database, producedBlocksModel: IProducedBlocksModel<IProducedBlock>, startBlock?: number, maxReOrgDepth?: number);
    on(event: "blockProducer.fatalError", listener: (error: KafkaError | BlockProducerError) => void): this;
    on(event: "producer.error", listener: (error: KafkaError) => void): this;
    on(event: "producer.disconnected", listener: () => void): this;
    on(event: "delivered", listener: (report: DeliveryReport) => void): this;
    on<E extends KafkaProducerEvents, T>(event: E, listener: EventListener<E>): this;
    /**
     * This is the main entry point for the block producer. This method is to be called externally to start indexing the raw block data from "startblock"
     *
     * @returns {Promise<Metadata | KafkaError>}
     *
     * @throws {KafkaError | BlockProducerError} - On failure to start kafka producer or block subscription.
     */
    start(): Promise<Metadata | KafkaError>;
    /**
     * @async
     * The public method to stop an indexing process. It is important to call this to avoid application crashing when
     * there are connection issues.
     *
     * @returns {Promise<boolean>} - Returns true on graceful shutdown or throws error.
     *
     * @throws {BlockProducerError | KafkaError} - On failure to stop block subscription or kafka producer gracefully.
     */
    stop(): Promise<boolean>;
    /**
     * @private
     *
     * Private method to handle errors and logging.
     *
     * @param {KafkaError|BlockProducerError} error - Error object
     */
    private onError;
    /**
     * @private
     *
     * Private method to be used when a block producer has to be restarted.
     *
     * @returns {Promise<void>}
     */
    private restartBlockProducer;
    /**
     * @private
     *
     * Private method to add process the queue and add the blocks in queue
     * to mongo DB.
     *
     * @returns {Promise<void>}
     */
    private processQueue;
    /**
     * @private
     *
     * Private method which adds given produced block details mongoDB
     *
     * @param {IProducedBlock} details - Produced block details to be added to mongo.
     * @param {number} retryCount - param used to keep track of retry count. Should not be set externally.
     *
     * @returns {Promise<void>}
     */
    private addBlockToMongo;
    /**
     * @async
     * Internal method to retrieve last produced block from mongoDB,
     * and check to see if produced blocks have been re orged when producer was offline.
     *
     * @returns {Promise<number>} - Returns last produced valid block or startBlock if last block does not exist.
     */
    private getStartBlock;
    /**
     * @private
     *
     * Private method to produce block to kafka. This method handled exceptions internally.
     *
     * @param {IBlock} block - Block to be produced to kafka
     *
     * @returns {Promise<void>}
     */
    private produceBlock;
}
