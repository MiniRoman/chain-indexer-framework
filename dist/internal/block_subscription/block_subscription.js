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
exports.BlockSubscription = void 0;
const abstract_block_subscription_js_1 = require("./abstract_block_subscription.js");
const block_producer_error_js_1 = require("../errors/block_producer_error.js");
const worker_threads_1 = require("worker_threads");
const module_1 = require("module");
const url_1 = __importDefault(require("url"));
/**
 * Block subscription class which emits full block data whenever added to chain.
 * The subscription takes care internally to backfill if historical blocks are requested.
 *
 * @author - Vibhu Rajeev
 */
class BlockSubscription extends abstract_block_subscription_js_1.AbstractBlockSubscription {
    /**
     * @constructor
     *
     * @param {Eth} eth - Eth module from web3.js
     * @param {string} rpcWsEndpoints - Array of websocket urls to nodes.
     * @param {number} maxRetries - Number of times to retry on failure before emitting an error.
     * @param {"quicknode_block_getter" | "erigon_block_getter" | "block_getter"} blockGetterType - The type of block getter to be used for this subscription.
     * @param {number} timeout - Timeout for which if there has been no event, connection must be restarted.
     * @param {number} blockDelay - Block delay for chains not having safe blocks
     * @param {number} alternateEndpoint - alternate endpoint which will be used when the logic to fetch transactions fails
     * @param {number} rpcTimeout - time to wait before retrying again
     */
    constructor(eth, rpcWsEndpoints = [], maxRetries = 0, blockGetterType = "block_getter", timeout, blockDelay, alternateEndpoint, rpcTimeout) {
        super(eth, timeout, blockDelay);
        this.rpcWsEndpoints = rpcWsEndpoints;
        this.maxRetries = maxRetries;
        this.blockGetterType = blockGetterType;
        this.alternateEndpoint = alternateEndpoint;
        this.rpcTimeout = rpcTimeout;
        this.workers = [];
        this.setWorkers();
    }
    /**
     * Private method to set workers as per the rpc urls passed.
     *
     * @returns {void}
     */
    setWorkers() {
        const workers = [];
        const workerPath = (0, module_1.createRequire)(url_1.default.pathToFileURL(__filename).toString()).resolve(`../block_getters/${this.blockGetterType}_worker`);
        if (!this.rpcWsEndpoints.length) {
            //TODO - throw error if no rpc
            return;
        }
        for (let i = 0; i < this.rpcWsEndpoints.length; i++) {
            const workerData = {
                endpoint: this.rpcWsEndpoints[i],
                maxRetries: this.maxRetries,
                alternateEndpoint: this.alternateEndpoint ? this.alternateEndpoint : undefined,
                rpcTimeout: this.rpcTimeout
            };
            const worker = new worker_threads_1.Worker(workerPath, {
                workerData
            });
            worker.setMaxListeners(1000);
            worker.on("exit", () => {
                this.workers[i] = new worker_threads_1.Worker(workerPath, {
                    workerData
                });
                this.workers[i].setMaxListeners(1000);
            });
            workers.push(worker);
        }
        this.workers = workers;
    }
    /**
     * Private method to emit blocks upto current finalized block.
     *
     * @returns {Promise<void>}
     */
    backFillBlocks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const backFillingId = Date.now();
                this.activeBackFillingId = backFillingId;
                for (let i = 0; i < this.workers.length; i++) {
                    this.addWorkerJobToQueue(this.nextBlock + i, i, backFillingId);
                }
                while (this.nextBlock <= this.lastFinalizedBlock && !this.isEmpty()) {
                    const promiseResult = yield this.shift();
                    if (promiseResult === null || promiseResult === void 0 ? void 0 : promiseResult.error) {
                        throw promiseResult.error;
                    }
                    if (this.activeBackFillingId !== backFillingId || this.fatalError) {
                        return;
                    }
                    this.observer.next(promiseResult === null || promiseResult === void 0 ? void 0 : promiseResult.block);
                    this.nextBlock = this.nextBlock + 1;
                }
                this.activeBackFillingId = null;
                yield this.subscribe(this.observer, this.nextBlock);
            }
            catch (error) {
                this.activeBackFillingId = null;
                this.fatalError = true;
                if (!this.observer) {
                    throw block_producer_error_js_1.BlockProducerError.createUnknown(error);
                }
                this.observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
            }
        });
    }
    /**
     * @protected
     *
     * Protected method that gets the block from a specific worker.
     *
     * @param {number} blockNumber - Block number to get the block details for
     * @param {number} workerId - worker Id to which the job must be assigned.
     *
     * @returns {Promise<IBlock>} - Resolves to give formatted full block.
     */
    getBlockFromWorker(blockNumber, workerId = 0) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            //Setting callback id to track callbacks replies.
            const callBackId = Date.now() + blockNumber;
            const worker = this.workers[workerId];
            const onMessage = function (value) {
                if (value.callBackId !== callBackId) {
                    return;
                }
                if (value.error) {
                    worker.removeListener("error", onError);
                    worker.removeListener("message", onMessage);
                    return resolve({
                        block: value.block,
                        error: value.error
                    });
                }
                worker.removeListener("error", onError);
                worker.removeListener("message", onMessage);
                return resolve({
                    block: value.block,
                    error: null
                });
            };
            const onError = function (error) {
                worker.removeListener("error", onError);
                worker.removeListener("message", onMessage);
                return resolve({
                    block: {},
                    error: error
                });
            };
            worker.on("message", onMessage);
            worker.on("error", onError);
            worker.postMessage({
                blockNumber,
                callBackId
            });
        }));
    }
    /**
     * @private
     *
     * Private method to be only called by backfilling process. This method adds a block promise to queue,
     * and when a worker fulfills the promise, automatically assigns it to retrieve the next block.
     *
     * @param {number} blockNumber - Block number to get block details for.
     * @param {number} workerId - Worker to which the job must be assigned.
     * @param {number} backFillingId - Backfilling Id to identify if the backfilling process is active.
     *
     * @returns {Promise<void>}
     */
    addWorkerJobToQueue(blockNumber, workerId, backFillingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockPromise = this.getBlockFromWorker(blockNumber, workerId);
            this.enqueue(blockPromise);
            // this part limit the queue length to 2500 and keep on waiting 5 seconds if
            // the length is more than 2500
            if (this.getLength() >= 2500) {
                for (let i = 0; i < 1;) {
                    yield new Promise(r => setTimeout(r, 5000));
                    if (this.getLength() < 2500) {
                        break;
                    }
                }
            }
            try {
                yield blockPromise;
            }
            catch (_a) {
                // Do nothing as is handled by queue
            }
            if (backFillingId === this.activeBackFillingId && (this.nextBlock + this.getLength() < this.lastFinalizedBlock)) {
                this.addWorkerJobToQueue(this.nextBlock + this.getLength() + 1, workerId, backFillingId);
            }
        });
    }
}
exports.BlockSubscription = BlockSubscription;
//# sourceMappingURL=block_subscription.js.map