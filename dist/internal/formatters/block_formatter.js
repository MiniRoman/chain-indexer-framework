"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockFormatter = void 0;
const web3_core_helpers_1 = require("web3-core-helpers");
const long_1 = __importDefault(require("long"));
const logger_js_1 = require("../logger/logger.js");
const web3_utils_1 = __importDefault(require("web3-utils"));
class BlockFormatter {
    /**
     * @protected
     *
     * Formats a raw transaction receipt response from a JSON RPC request to EVM Client.
     *
     * @param {IRawReceipt} receipt - The transaction receipt to format.
     *
     * @returns { ITransactionReceipt | void } - The formatted transaction receipt object.
     */
    formatRawReceipt(receipt) {
        var _a;
        if (!receipt) {
            return;
        }
        if (typeof receipt !== "object") {
            throw new Error("Received receipt is invalid: " + receipt);
        }
        return this.formatTransactionReceipt(Object.assign(Object.assign({}, receipt), { blockNumber: web3_utils_1.default.hexToNumber(receipt.transactionIndex), cumulativeGasUsed: web3_utils_1.default.hexToNumber(receipt.cumulativeGasUsed), transactionIndex: web3_utils_1.default.hexToNumber(receipt.transactionIndex), gasUsed: web3_utils_1.default.hexToNumber(receipt.gasUsed), logs: ((_a = receipt.logs) === null || _a === void 0 ? void 0 : _a.length) ? receipt.logs.map(log => web3_core_helpers_1.formatters.outputLogFormatter(log)) : [], effectiveGasPrice: receipt.effectiveGasPrice, status: typeof receipt.status !== "undefined" && receipt.status !== null ?
                Boolean(parseInt(receipt.status)) : false }));
    }
    /**
     * @protected
     *
     * Formats a raw transaction object returned by an evm client.
     *
     * @param {IRawTransaction} transaction - The transaction object to format.
     * @param {ITransactionReceipt} receipt - Formatted transaction receipt object to be
     * added to transaction object.
     *
     * @returns {ITransaction} - The formatted transaction object.
     */
    formatRawTransactionObject(transaction, receipt) {
        return this.formatTransactionObject(web3_core_helpers_1.formatters.outputTransactionFormatter(transaction), receipt);
    }
    /**
     * @protected
     *
     * Formats a raw block response returned by a JSON RPC request to evm client.
     *
     * @param {IRawBlock} block - The block object to be formatted.
     * @param {[ITransaction]} transactions - Formatted transactions array that needs to be added
     * to the formatted block object.
     *
     * @returns {IBlock} - Formatted block object with transactions and transaction receipts.
     */
    formatRawBlock(block, transactions) {
        return this.formatBlockWithTransactions(web3_core_helpers_1.formatters.outputBlockFormatter(block), transactions);
    }
    /**
     * @protected
     *
     * Formats a block object that is returned by 'web3.js'.
     *
     * @param {BlockTransactionObject} block - The block object to be formatted returned by 'web3.js'.
     * @param {[ITransaction]} transactions - Formatted transactions array that needs to be added
     * to the formatted block object.
     *
     * @returns {IBlock} - Formatted block object with transactions and transaction receipts.
     */
    formatBlockWithTransactions(block, transactions) {
        logger_js_1.Logger.debug(`formatting block with transactions ${block.number}`);
        return Object.assign(Object.assign({}, block), { nonce: long_1.default.fromValue(web3_utils_1.default.hexToNumberString(block.nonce), true), difficulty: web3_utils_1.default.toHex(block.difficulty), totalDifficulty: web3_utils_1.default.toHex(block.totalDifficulty), timestamp: long_1.default.fromValue(block.timestamp * 1000, true), number: long_1.default.fromValue(block.number, true), baseFeePerGas: block.baseFeePerGas || block.baseFeePerGas === 0
                ? web3_utils_1.default.toHex(block.baseFeePerGas)
                : undefined, size: web3_utils_1.default.toHex(block.size), transactions: transactions, gasLimit: long_1.default.fromValue(block.gasLimit, true), gasUsed: long_1.default.fromValue(block.gasUsed, true) });
    }
    /**
     * @protected
     *
     * Formats a raw transaction object that is returned by the 'web3.js' formatter.
     *
     * @param {IWeb3Transaction} transactionObject - The transaction object to format.
     * @param {ITransactionReceipt} receipt - Formatted transaction receipt object to be
     * added to transaction object.
     *
     * @returns {ITransaction} - The formatted transaction object.
     */
    formatTransactionObject(transactionObject, receipt) {
        return Object.assign(Object.assign({}, transactionObject), { receipt, value: web3_utils_1.default.toHex(transactionObject.value), transactionIndex: transactionObject.transactionIndex ||
                transactionObject.transactionIndex === 0
                ? long_1.default.fromValue(transactionObject.transactionIndex, true)
                : null, gas: long_1.default.fromValue(transactionObject.gas, true), gasPrice: web3_utils_1.default.toHex(transactionObject.gasPrice), nonce: long_1.default.fromValue(transactionObject.nonce, true), maxFeePerGas: transactionObject.maxFeePerGas ||
                transactionObject.maxFeePerGas === 0
                ? web3_utils_1.default.toHex(transactionObject.maxFeePerGas)
                : undefined, maxPriorityFeePerGas: transactionObject.maxPriorityFeePerGas ||
                transactionObject.maxPriorityFeePerGas === 0
                ? web3_utils_1.default.toHex(transactionObject.maxPriorityFeePerGas)
                : undefined, blockNumber: transactionObject.blockNumber ||
                transactionObject.blockNumber === 0
                ? long_1.default.fromValue(transactionObject.blockNumber, true)
                : null });
    }
    /**
     * @protected
     *
     * Formats transaction receipt object returned or formatted by 'web3.js'.
     *
     * @param {IRawReceipt} transactionReceipt - The transaction receipt to format.
     *
     * @returns { ITransactionReceipt | void } - The formatted transaction receipt object.
     */
    formatTransactionReceipt(transactionReceipt) {
        return Object.assign(Object.assign({}, transactionReceipt), { effectiveGasPrice: transactionReceipt.effectiveGasPrice ||
                transactionReceipt.effectiveGasPrice === 0
                ? web3_utils_1.default.toHex(transactionReceipt.effectiveGasPrice)
                : undefined, cumulativeGasUsed: long_1.default.fromValue(transactionReceipt.cumulativeGasUsed, true), transactionIndex: long_1.default.fromValue(transactionReceipt.transactionIndex, true), blockNumber: long_1.default.fromValue(transactionReceipt.blockNumber, true), gasUsed: long_1.default.fromValue(transactionReceipt.gasUsed, true), logs: transactionReceipt.logs.map((log) => {
                return Object.assign(Object.assign({}, log), { transactionIndex: long_1.default.fromValue(log.transactionIndex, true), logIndex: long_1.default.fromValue(log.logIndex, true), blockNumber: long_1.default.fromValue(log.blockNumber, true) });
            }) });
    }
}
exports.BlockFormatter = BlockFormatter;
//# sourceMappingURL=block_formatter.js.map