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
exports.ErigonBlockGetter = void 0;
const web3_utils_1 = __importDefault(require("web3-utils"));
const block_getter_js_1 = require("./block_getter.js");
/**
 * A wrapper class on web3 to get blocks from erigon nodes and format them.
 *
 * @author - Vibhu Rajeev
 */
class ErigonBlockGetter extends block_getter_js_1.BlockGetter {
    /**
     * @async
     * Public method to query block data including transaction receipts of a single block.
     *
     * @param {number | string} blockNumber - The block number for which block data needs to be retrieved.
     * @param {number} retryCount - The amount of retries it should. Defaults to 0.
     *
     * @returns {Promise<IBlock>} - Block object containing all details including transaction receipts.
     *
     * @throws {Error} - Throws error object on failure.
     */
    getBlockWithTransactionReceipts(blockNumber, retryCount = 0) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Promise.all([
                    this.eth.getBlock(blockNumber, true),
                    this.getTransactionReceipts(blockNumber)
                ]);
                const transactions = [];
                for (const transactionObject of result[0].transactions) {
                    transactions.push(this.formatTransactionObject(transactionObject, (_b = this.formatRawReceipt((_a = result[1]) === null || _a === void 0 ? void 0 : _a.find((receipt) => receipt.transactionHash === transactionObject.hash))) !== null && _b !== void 0 ? _b : yield this.getTransactionReceipt(transactionObject.hash)));
                }
                return this.formatBlockWithTransactions(result[0], transactions);
            }
            catch (error) {
                if (retryCount < this.maxRetries) {
                    return this.getBlockWithTransactionReceipts(blockNumber, retryCount + 1);
                }
                throw error;
            }
        });
    }
    /**
     * @private
     *
     * Private method to get all transaction receipts for a block.
     *
     * @param {number | string} blockNumber - Block number for which transaction receipts are to be retrieved.
     *
     * @returns {Promise<IRawReceipt[]>} - Array of raw transaction receipts.
     */
    getTransactionReceipts(blockNumber) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Request timed out for block: ${blockNumber}`));
            }, 45000);
            this.sendTransactionReceiptsCall(blockNumber, timeout, resolve, reject);
        });
    }
    /**
     * Private method to make an RPC call through provider, to get transaction receipts for a block.
     *
     * @param {number} blockNumber - Block number for which receipts need to be retrieved.
     * @param {NodeJS.Timeout} timeout - Timeout instance that needs to be cleared on successful query.
     * @param {(value: IRawReceipt[] | PromiseLike<IRawReceipt[]>) => void} resolve -
     * The resolve callback that needs to be called on successful query.
     * @param {(reason?: any) => void} reject - The reject callback that needs to be called
     * on failed query.
     * @param {boolean} [isRetry=false] - Boolean that is not to be set by external calls.
     * Is used by internal recursive calls to identify if this request is a retry.
     *
     * @returns {void}
     */
    sendTransactionReceiptsCall(blockNumber, timeout, resolve, reject, isRetry = false) {
        this.eth.currentProvider.send({
            method: "eth_getBlockReceipts",
            id: Date.now().toString() + blockNumber,
            params: [web3_utils_1.default.numberToHex(blockNumber)],
            jsonrpc: "2.0"
        }, (error, response) => {
            if (error) {
                clearTimeout(timeout);
                reject(error);
                return;
            }
            if (!(response === null || response === void 0 ? void 0 : response.result) && !isRetry) {
                setTimeout(() => {
                    this.sendTransactionReceiptsCall(blockNumber, timeout, resolve, reject, true);
                }, 500);
                return;
            }
            clearTimeout(timeout);
            resolve(response === null || response === void 0 ? void 0 : response.result);
        });
    }
}
exports.ErigonBlockGetter = ErigonBlockGetter;
//# sourceMappingURL=erigon_block_getter.js.map