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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockProducer = void 0;
const asynchronous_producer_js_1 = require("../kafka/producer/asynchronous_producer.js");
const block_producer_error_js_1 = require("../errors/block_producer_error.js");
const logger_js_1 = require("../logger/logger.js");
const queue_js_1 = require("../queue/queue.js");
const long_1 = __importDefault(require("long"));
/**
 * Common lock producer class which contains the common logic to retrieve
 * raw block data from the configurable "startblock" number, and produce it to
 * a kafka cluster while detecting re orgs and handling them.
 * The block data source, and kafka modules is provided the user of this class.
 *
 * @author - Vibhu Rajeev
 */
class BlockProducer extends asynchronous_producer_js_1.AsynchronousProducer {
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
    constructor(coder, config, blockSubscription, blockGetter, database, producedBlocksModel, startBlock = 0, maxReOrgDepth = 0) {
        super(coder, Object.assign({
            "message.max.bytes": 26214400
        }, config));
        this.blockSubscription = blockSubscription;
        this.blockGetter = blockGetter;
        this.database = database;
        this.producedBlocksModel = producedBlocksModel;
        this.startBlock = startBlock;
        this.maxReOrgDepth = maxReOrgDepth;
        this.mongoInsertInProcess = false;
        this.producingBlockPromises = [];
        this.forceStop = false;
        this.mongoInsertQueue = new queue_js_1.Queue();
    }
    on(event, listener) {
        //@ts-ignore
        super.on(event, listener);
        return this;
    }
    /**
     * This is the main entry point for the block producer. This method is to be called externally to start indexing the raw block data from "startblock"
     *
     * @returns {Promise<Metadata | KafkaError>}
     *
     * @throws {KafkaError | BlockProducerError} - On failure to start kafka producer or block subscription.
     */
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.forceStop = false;
            yield this.database.connect();
            const metadata = yield _super.start.call(this);
            logger_js_1.Logger.info({
                location: "block_producer",
                function: "start",
                message: "Producer started",
            });
            this.on("delivered", (report) => __awaiter(this, void 0, void 0, function* () {
                if (report.partition === -1) {
                    const error = new block_producer_error_js_1.BlockProducerError("Kafka topic does not exist", undefined, true, "Kafka topic does not exist or could not be created.", "remote");
                    this.onError(error);
                    return;
                }
                logger_js_1.Logger.info("Delivery-report:" + JSON.stringify(Object.assign(Object.assign({}, report.opaque), { offset: report.offset })));
                try {
                    this.mongoInsertQueue.enqueue(report.opaque);
                    if (!this.mongoInsertInProcess) {
                        this.queueProcessingPromise = this.processQueue();
                    }
                }
                catch (error) {
                    logger_js_1.Logger.error(error);
                }
            }));
            yield this.blockSubscription.subscribe({
                next: (block) => __awaiter(this, void 0, void 0, function* () {
                    //TODO - Simplify below logic.
                    const producingBlockPromise = this.produceBlock(block);
                    this.producingBlockPromises.push(producingBlockPromise);
                    yield producingBlockPromise;
                    this.producingBlockPromises = this.producingBlockPromises.filter((promise) => promise !== producingBlockPromise);
                }),
                error: this.onError.bind(this),
                closed: () => {
                    logger_js_1.Logger.info("Closed");
                }
            }, yield this.getStartBlock());
            return metadata;
        });
    }
    /**
     * @async
     * The public method to stop an indexing process. It is important to call this to avoid application crashing when
     * there are connection issues.
     *
     * @returns {Promise<boolean>} - Returns true on graceful shutdown or throws error.
     *
     * @throws {BlockProducerError | KafkaError} - On failure to stop block subscription or kafka producer gracefully.
     */
    stop() {
        const _super = Object.create(null, {
            stop: { get: () => super.stop }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.blockSubscription.unsubscribe();
            if (this.producingBlockPromises.length) {
                //Waiting for all pending blocks to be produced.
                yield Promise.all(this.producingBlockPromises);
            }
            if (this.queueProcessingPromise) {
                yield this.queueProcessingPromise;
            }
            yield _super.stop.call(this);
            this.removeAllListeners("delivered");
            return true;
        });
    }
    /**
     * @private
     *
     * Private method to handle errors and logging.
     *
     * @param {KafkaError|BlockProducerError} error - Error object
     */
    onError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_js_1.Logger.error(error);
            if (error.message === "Local: Erroneous state" ||
                error.message === "Erroneous state") {
                this.forceStop = true;
                try {
                    yield this.stop();
                }
                catch (_a) { }
                this.emit("blockProducer.fatalError", error);
                return;
            }
            if (error.isFatal) {
                yield this.restartBlockProducer();
            }
        });
    }
    /**
     * @private
     *
     * Private method to be used when a block producer has to be restarted.
     *
     * @returns {Promise<void>}
     */
    restartBlockProducer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.restartPromise) {
                    return yield this.restartPromise;
                }
                this.restartPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.stop();
                        if (!this.forceStop) {
                            yield this.start();
                        }
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
                yield this.restartPromise;
                this.restartPromise = undefined;
            }
            catch (error) {
                this.restartPromise = undefined;
                logger_js_1.Logger.error(error);
                this.emit("blockProducer.fatalError", block_producer_error_js_1.BlockProducerError.createUnknown(error));
            }
        });
    }
    /**
     * @private
     *
     * Private method to add process the queue and add the blocks in queue
     * to mongo DB.
     *
     * @returns {Promise<void>}
     */
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mongoInsertInProcess = true;
            try {
                while (!this.mongoInsertQueue.isEmpty()) {
                    const queueLength = this.mongoInsertQueue.getLength();
                    if (queueLength > this.maxReOrgDepth) {
                        yield this.addBlockToMongo(this.mongoInsertQueue.shiftByN(queueLength - this.maxReOrgDepth));
                    }
                    else {
                        yield this.addBlockToMongo(this.mongoInsertQueue.shift());
                    }
                }
            }
            catch (error) {
                logger_js_1.Logger.error(error);
            }
            this.mongoInsertInProcess = false;
        });
    }
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
    addBlockToMongo(details, retryCount = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producedBlocksModel.add(details, this.maxReOrgDepth);
            }
            catch (error) {
                // Tries upto 5 times to add transaction.
                if (retryCount < 4) {
                    return yield this.addBlockToMongo(details, retryCount + 1);
                }
                throw block_producer_error_js_1.BlockProducerError.createUnknown(error);
            }
        });
    }
    /**
     * @async
     * Internal method to retrieve last produced block from mongoDB,
     * and check to see if produced blocks have been re orged when producer was offline.
     *
     * @returns {Promise<number>} - Returns last produced valid block or startBlock if last block does not exist.
     */
    getStartBlock() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let blockNumber = (_a = (yield this.producedBlocksModel.get())) === null || _a === void 0 ? void 0 : _a.number;
            let block;
            for (let depth = 0; depth < this.maxReOrgDepth; depth++) {
                block = yield this.producedBlocksModel.get(blockNumber);
                if (!block) {
                    if (blockNumber) {
                        return blockNumber;
                    }
                    return this.startBlock;
                }
                const remoteBlock = yield this.blockGetter.getBlock(block.number);
                if (remoteBlock.hash === block.hash) {
                    return (remoteBlock.number + 1);
                }
                blockNumber = remoteBlock.number - 1;
            }
            return blockNumber || this.startBlock;
        });
    }
    /**
     * @private
     *
     * Private method to produce block to kafka. This method handled exceptions internally.
     *
     * @param {IBlock} block - Block to be produced to kafka
     *
     * @returns {Promise<void>}
     */
    produceBlock(block) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Have to do below as toString and toNumber methods do not exist on json Long object.
                const blockNumber = long_1.default.fromValue(block.number);
                yield this.produceEvent(blockNumber.toString(), block, undefined, undefined, undefined, {
                    number: blockNumber.toNumber(),
                    hash: block.hash
                });
            }
            catch (error) {
                this.onError(error);
            }
        });
    }
}
exports.BlockProducer = BlockProducer;
//# sourceMappingURL=block_producer.js.map