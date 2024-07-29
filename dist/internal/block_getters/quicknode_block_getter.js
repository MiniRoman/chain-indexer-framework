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
exports.QuickNodeBlockGetter = void 0;
const web3_utils_1 = __importDefault(require("web3-utils"));
const block_getter_js_1 = require("./block_getter.js");
/**
 * A wrapper class on web3 to get blocks from quicknode and format them.
 *
 * @author - Vibhu Rajeev
 */
class QuickNodeBlockGetter extends block_getter_js_1.BlockGetter {
    /**
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} maxRetries - The number of times to retry on errors.
     *
     * @constructor
     */
    constructor(eth, maxRetries = 0, alternateEth, rpcTimeout) {
        super(eth, maxRetries);
        this.alternateEth = alternateEth;
        this.rpcTimeout = rpcTimeout;
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
    getBlockWithTransactionReceipts(blockNumber, retryCount = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var _b;
                    const timeout = setTimeout(() => {
                        reject(new Error(`Request timed out for block: ${blockNumber}`));
                    }, (_b = this.rpcTimeout) !== null && _b !== void 0 ? _b : 4000);
                    let eth = this.eth;
                    if (retryCount > 0 && this.alternateEth) {
                        yield new Promise(r => setTimeout(r, 2000));
                        eth = this.alternateEth;
                    }
                    eth.currentProvider.send({
                        method: "qn_getBlockWithReceipts",
                        id: Date.now().toString() + blockNumber,
                        params: [web3_utils_1.default.numberToHex(blockNumber)],
                        jsonrpc: "2.0"
                    }, (error, response) => {
                        if (error) {
                            clearTimeout(timeout);
                            reject(error);
                        }
                        if (!(response === null || response === void 0 ? void 0 : response.result)) {
                            clearTimeout(timeout);
                            reject(new Error(`null response received for block: ${blockNumber}`));
                        }
                        clearTimeout(timeout);
                        resolve(response === null || response === void 0 ? void 0 : response.result);
                    });
                }));
                const transactions = [];
                for (const transactionObject of response.block.transactions) {
                    transactions.push(this.formatRawTransactionObject(transactionObject, (_a = this.formatRawReceipt(response.receipts.find((receipt) => receipt.transactionHash === transactionObject.hash))) !== null && _a !== void 0 ? _a : yield this.getTransactionReceipt(transactionObject.hash)));
                }
                return this.formatRawBlock(response.block, transactions);
            }
            catch (error) {
                if (retryCount < this.maxRetries) {
                    return this.getBlockWithTransactionReceipts(blockNumber, retryCount + 1);
                }
                throw error;
            }
        });
    }
}
exports.QuickNodeBlockGetter = QuickNodeBlockGetter;
//# sourceMappingURL=quicknode_block_getter.js.map