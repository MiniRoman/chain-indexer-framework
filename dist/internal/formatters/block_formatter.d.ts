import { ITransactionReceipt } from "../interfaces/transaction_receipt.js";
import { ITransaction } from "../interfaces/transaction.js";
import { BlockTransactionObject } from "web3-eth";
import { IBlock } from "../interfaces/block.js";
import { IRawBlock } from "../interfaces/raw_block.js";
import { IRawTransaction } from "../interfaces/raw_transaction.js";
import { IRawReceipt } from "../interfaces/raw_receipt.js";
import { IWeb3Transaction } from "../interfaces/web3_transaction.js";
import { IWeb3TransactionReceipt } from "../interfaces/web3_transaction_receipt.js";
export declare class BlockFormatter {
    /**
     * @protected
     *
     * Formats a raw transaction receipt response from a JSON RPC request to EVM Client.
     *
     * @param {IRawReceipt} receipt - The transaction receipt to format.
     *
     * @returns { ITransactionReceipt | void } - The formatted transaction receipt object.
     */
    protected formatRawReceipt(receipt?: IRawReceipt): ITransactionReceipt | void;
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
    protected formatRawTransactionObject(transaction: IRawTransaction, receipt: ITransactionReceipt): ITransaction;
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
    protected formatRawBlock(block: IRawBlock, transactions: ITransaction[]): IBlock;
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
    protected formatBlockWithTransactions(block: BlockTransactionObject, transactions: ITransaction[]): IBlock;
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
    protected formatTransactionObject(transactionObject: IWeb3Transaction, receipt: ITransactionReceipt): ITransaction;
    /**
     * @protected
     *
     * Formats transaction receipt object returned or formatted by 'web3.js'.
     *
     * @param {IRawReceipt} transactionReceipt - The transaction receipt to format.
     *
     * @returns { ITransactionReceipt | void } - The formatted transaction receipt object.
     */
    protected formatTransactionReceipt(transactionReceipt: IWeb3TransactionReceipt): ITransactionReceipt;
}
