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
exports.AbstractBlockSubscription = void 0;
const block_producer_error_js_1 = require("../errors/block_producer_error.js");
const logger_js_1 = require("../logger/logger.js");
const queue_js_1 = require("../queue/queue.js");
const long_1 = __importDefault(require("long"));
/**
 * @abstract
 *
 * Block subscription class which emits full block data whenever added to chain and
 * takes care to backfill historical blocks requested. The backfilling strategy needs to be implemented by
 * class extending from this.
 *
 * @author - Vibhu Rajeev
 */
class AbstractBlockSubscription extends queue_js_1.Queue {
    /**
     * @constructor
     *
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} timeout - Timeout for which if there has been no event, connection must be restarted.
     */
    constructor(eth, timeout = 60000, blockDelay = 0) {
        super();
        this.eth = eth;
        this.timeout = timeout;
        this.blockDelay = blockDelay;
        this.subscription = null;
        this.lastBlockHash = "";
        this.processingQueue = false;
        this.fatalError = false;
        this.lastFinalizedBlock = 0;
        this.nextBlock = 0;
        this.activeBackFillingId = null;
        this.lastReceivedBlockNumber = 0;
    }
    /**
     * The subscribe method starts the subscription from last produced block, and calls observer.next for
     * each new block.
     *
     * @param {IObserver} observer - The observer object with its functions which will be called on events.
     * @param {number} startBlock - The block number to start subscribing from.
     *
     * @returns {Promise<void>}
     *
     * @throws {BlockProducerError} - On failure to get start block or start subscription.
     */
    subscribe(observer, startBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.lastFinalizedBlock = this.blockDelay > 0
                    ? (yield this.eth.getBlock("latest")).number - this.blockDelay
                    : (yield this.eth.getBlock("finalized")).number;
                // Clear any previously existing queue
                this.clear();
                this.observer = observer;
                this.fatalError = false;
                this.nextBlock = startBlock;
                this.lastBlockHash = "";
                this.lastReceivedBlockNumber = startBlock - 1;
                // Number 50 is added to allow block producer to create log subscription even and catch up after backfilling. 
                if (this.lastFinalizedBlock - 50 > startBlock) {
                    this.backFillBlocks();
                    return;
                }
                this.checkIfLive(this.lastBlockHash);
                this.subscription = this.eth.subscribe("logs", { fromBlock: this.nextBlock })
                    .on("data", (log) => {
                    try {
                        logger_js_1.Logger.debug({
                            location: "eth_subscribe",
                            blockHash: log.blockHash,
                            blockNumber: log.blockNumber,
                            logIndex: log.logIndex
                        });
                        if (this.lastBlockHash == log.blockHash) {
                            return;
                        }
                        //Adding below logic to get empty blocks details which have not been added to queue.
                        if (this.hasMissedBlocks(log.blockNumber)) {
                            this.enqueueMissedBlocks(log.blockNumber);
                        }
                        this.lastBlockHash = log.blockHash;
                        this.lastReceivedBlockNumber = log.blockNumber;
                        this.enqueue(this.getBlockFromWorker(log.blockNumber));
                        if (!this.processingQueue) {
                            this.processQueue();
                        }
                    }
                    catch (error) {
                        observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
                    }
                })
                    .on("error", (error) => {
                    observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
                });
            }
            catch (error) {
                throw block_producer_error_js_1.BlockProducerError.createUnknown(error);
            }
        });
    }
    /**
     * Unsubscribes from block subscription and resolves on success
     *
     * @returns {Promise<boolean>} - Resolves true on graceful unsubscription.
     *
     * @throws {BlockProducerError} - Throws block producer error on failure to unsubscribe gracefully.
     */
    unsubscribe() {
        return new Promise((resolve, reject) => {
            this.activeBackFillingId = null;
            this.clear();
            clearTimeout(this.checkIfLiveTimeout);
            if (!this.subscription) {
                resolve(true);
                return;
            }
            this.subscription.unsubscribe((error, success) => {
                if (success) {
                    this.subscription = null;
                    resolve(true);
                    return;
                }
                reject(block_producer_error_js_1.BlockProducerError.createUnknown(error));
            });
        });
    }
    /**
     * @async
     * Private method, process queued promises of getBlock, and calls observer.next when resolved.
     *
     * @returns {Promise<void>}
     */
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processingQueue = true;
            while (!this.isEmpty() && !this.fatalError && this.observer) {
                try {
                    const promiseResult = yield (this.shift());
                    if (promiseResult === null || promiseResult === void 0 ? void 0 : promiseResult.error) {
                        throw promiseResult.error;
                    }
                    const blockNumber = long_1.default.fromValue(promiseResult.block.number);
                    this.nextBlock = parseInt(blockNumber.toString()) + 1;
                    //If the block number is greater than last emitted block, check if there was a re org not detected. 
                    if (this.isReOrgedMissed(promiseResult.block)) {
                        throw new Error("Chain re org not handled.");
                    }
                    this.observer.next(promiseResult.block);
                    this.lastEmittedBlock = {
                        number: blockNumber.toNumber(),
                        hash: promiseResult.block.hash
                    };
                }
                catch (error) {
                    this.fatalError = true;
                    this.observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
                    break;
                }
            }
            this.processingQueue = false;
        });
    }
    /**
     * @private
     *
     * Method to check if there are empty or missed blocks between last produced block and current event received.
     *
     * @param {number} blockNumber - The block number of the received event log.
     *
     * @returns {boolean}
     */
    hasMissedBlocks(blockNumber) {
        return blockNumber - this.lastReceivedBlockNumber > 1;
    }
    /**
     * @private
     *
     * Private method to check if a re org has been missed by the subscription.
     *
     * @param {IBlock} block - Latest block being emitted.
     *
     * @returns {boolean}
     */
    isReOrgedMissed(block) {
        const blockNumber = long_1.default.fromValue(block.number);
        return this.lastEmittedBlock &&
            blockNumber.toNumber() > this.lastEmittedBlock.number &&
            this.lastEmittedBlock.hash !== block.parentHash ?
            true :
            false;
    }
    /**
     * @private
     *
     * Method to enqueue missed or empty blocks between last produced blocks and currently received event.
     *
     * @param {number} currentBlockNumber - Block number for which current event was received.
     *
     * @returns {void}
     */
    enqueueMissedBlocks(currentBlockNumber) {
        for (let i = 1; i < currentBlockNumber - this.lastReceivedBlockNumber; i++) {
            this.enqueue(this.getBlockFromWorker(this.lastReceivedBlockNumber + i));
        }
    }
    checkIfLive(lastBlockHash) {
        this.checkIfLiveTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            //Check if the block hash has changed since the timeout. 
            if (this.lastBlockHash === lastBlockHash) {
                try {
                    yield this.unsubscribe();
                    yield this.subscribe(this.observer, this.nextBlock);
                }
                catch (error) {
                    this.observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(`Error when restarting producer: ${error}`));
                }
                return;
            }
            this.checkIfLive(this.lastBlockHash);
        }), this.timeout);
    }
}
exports.AbstractBlockSubscription = AbstractBlockSubscription;
//# sourceMappingURL=abstract_block_subscription.js.map