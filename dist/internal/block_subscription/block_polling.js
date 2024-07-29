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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockPoller = void 0;
const block_producer_error_js_1 = require("../errors/block_producer_error.js");
const logger_js_1 = require("../logger/logger.js");
/**
 * A class to produce blocks based on polling
 *
 * @class {BlockPoller}
 */
class BlockPoller {
    /**
     * @constructor
     *
     * @param {BlockGetter} blockGetter - BlockGetter module from web3.js
     * @param {number} blockPollingTimeout - The interval we have to poll for new blocks
     */
    constructor(blockGetter, blockPollingTimeout) {
        this.blockGetter = blockGetter;
        this.blockPollingTimeout = blockPollingTimeout;
    }
    /**
     * The method to start polling for blocks from the start block to finalized block
     *
     * @param {IObserver} observer - The observer object with his functions
     * @param {number} startBlock - Block number to start subscribing from.
     *
     * @returns {Promise<void>}
     */
    subscribe(observer, startBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.pollingId = Date.now();
                //Need to separate the methods, so the subscribe method is not waiting
                //indefinitely for polling to finish.
                this.startBlockPolling(observer, startBlock, this.pollingId);
            }
            catch (error) {
                observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
            }
        });
    }
    /**
     * Stops the block polling process and kills the active interval from setInterval.
     *
     * @returns {Promise<boolean>}
     */
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pollingId = undefined;
            return true;
        });
    }
    startBlockPolling(observer, startBlock, pollingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let lastBlockNumber = startBlock - 1;
                while (this.pollingId === pollingId) {
                    const latestBlockNumber = yield this.blockGetter.getLatestBlockNumber();
                    logger_js_1.Logger.debug(`Starting polling from block number ${lastBlockNumber} and latest block number is ${latestBlockNumber}`);
                    if (latestBlockNumber <= lastBlockNumber) {
                        yield new Promise(r => setTimeout(r, this.blockPollingTimeout));
                    }
                    for (let blockNum = (lastBlockNumber + 1); blockNum <= latestBlockNumber && this.pollingId === pollingId; blockNum++) {
                        const block = yield this.blockGetter.getBlockWithTransactionReceipts(blockNum);
                        //Added below logic as if a new subscription is created before previous 
                        //promise was resolved, then the block is not emitted.
                        if (this.pollingId !== pollingId) {
                            break;
                        }
                        observer.next(block);
                        lastBlockNumber = blockNum;
                    }
                }
            }
            catch (error) {
                observer.error(block_producer_error_js_1.BlockProducerError.createUnknown(error));
            }
        });
    }
}
exports.BlockPoller = BlockPoller;
//# sourceMappingURL=block_polling.js.map