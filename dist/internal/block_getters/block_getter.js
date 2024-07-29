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
exports.BlockGetter = void 0;
const block_producer_error_js_1 = require("../errors/block_producer_error.js");
const block_formatter_js_1 = require("../formatters/block_formatter.js");
const logger_js_1 = require("../logger/logger.js");
/**
 * A wrapper class on web3 block related functions
 *
 * @author - Vibhu Rajeev, Nitin Mittal
 */
class BlockGetter extends block_formatter_js_1.BlockFormatter {
    /**
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} maxRetries - The number of times to retry on errors.
     *
     * @constructor
     */
    constructor(eth, maxRetries = 0) {
        super();
        this.eth = eth;
        this.maxRetries = maxRetries;
    }
    /**
     * @async
     * Public method to query block data of a single block
     *
     * @param {number | string} blockNumber - Block number to query the block details for.
     *
     * @returns {Promise<Block>} - Block object
     */
    getBlock(blockNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.eth.getBlock(blockNumber);
        });
    }
    /**
     * @async
     * Public method to query block data including transaction receipts of a single block.
     *
     * @param {number | string} blockNumber - The block number for which block data needs to be retrieved.
     *
     * @returns {Promise<IBlock>} - Block object containing all details including transaction receipts.
     *
     * @throws {Error} - Throws error object on failure.
     */
    getBlockWithTransactionReceipts(blockNumber, errorCount = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const block = yield this.eth.getBlock(blockNumber, true);
                if (!block) {
                    throw new block_producer_error_js_1.BlockProducerError("Block producer error", block_producer_error_js_1.BlockProducerError.codes.RECEIPT_NOT_FOUND, false, `null receipt found for block ${blockNumber}.`, "remote");
                }
                logger_js_1.Logger.debug(`Fetching transaction receipts for the following block ${block.number}`);
                const transactions = [];
                for (const transactionObject of block.transactions) {
                    transactions.push(this.formatTransactionObject(transactionObject, yield this.getTransactionReceipt(transactionObject.hash)));
                }
                return this.formatBlockWithTransactions(block, transactions);
            }
            catch (error) {
                if (errorCount >= this.maxRetries) {
                    throw error;
                }
                return this.getBlockWithTransactionReceipts(blockNumber, errorCount + 1);
            }
        });
    }
    /**
     * @async
     * Public method to query the current block number.
     *
     * @returns {Promise<number>} - the current block.
     *
     * @throws {Error} - Throws error object on failure.
     */
    getLatestBlockNumber() {
        return this.eth.getBlockNumber();
    }
    /**
     * @async
     * This internal method retrieves the transaction receipt of the given transaction hash and retries upto retryLimit on failure.
     *
     * @param {string} transactionHash - The transaction hash for which transaction receipt is to be retrieved.
     * @param {number} errorCount - Parameter for the function to know the number of times query has been retried.
     * This parameter must ideally not be set by an external call.
     *
     * @returns {Promise<ITransactionReceipt>} - The transaction receipt of the given transaction hash. On failure throws error object.
     *
     * @throws {Error} - Throws error object on failure.
     */
    getTransactionReceipt(transactionHash, errorCount = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactionReceipt = yield this.eth.getTransactionReceipt(transactionHash);
                if (transactionReceipt === null) {
                    throw new block_producer_error_js_1.BlockProducerError("Block producer error", block_producer_error_js_1.BlockProducerError.codes.RECEIPT_NOT_FOUND, false, `Transaction receipt not found for ${transactionHash}.`, "remote");
                }
                return this.formatTransactionReceipt(transactionReceipt);
            }
            catch (error) {
                if (errorCount >= this.maxRetries) {
                    throw error;
                }
                return this.getTransactionReceipt(transactionHash, errorCount + 1);
            }
        });
    }
}
exports.BlockGetter = BlockGetter;
//# sourceMappingURL=block_getter.js.map