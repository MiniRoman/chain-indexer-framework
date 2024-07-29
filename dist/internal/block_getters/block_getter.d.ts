import { Block, Eth } from "web3-eth";
import { ITransactionReceipt } from "../interfaces/transaction_receipt.js";
import { BlockFormatter } from "../formatters/block_formatter.js";
import { IBlock } from "../interfaces/block.js";
import { IBlockGetter } from "../interfaces/block_getter.js";
/**
 * A wrapper class on web3 block related functions
 *
 * @author - Vibhu Rajeev, Nitin Mittal
 */
export declare class BlockGetter extends BlockFormatter implements IBlockGetter {
    protected eth: Eth;
    protected maxRetries: number;
    /**
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} maxRetries - The number of times to retry on errors.
     *
     * @constructor
     */
    constructor(eth: Eth, maxRetries?: number);
    /**
     * @async
     * Public method to query block data of a single block
     *
     * @param {number | string} blockNumber - Block number to query the block details for.
     *
     * @returns {Promise<Block>} - Block object
     */
    getBlock(blockNumber: number | string): Promise<Block>;
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
    getBlockWithTransactionReceipts(blockNumber: number | string, errorCount?: number): Promise<IBlock>;
    /**
     * @async
     * Public method to query the current block number.
     *
     * @returns {Promise<number>} - the current block.
     *
     * @throws {Error} - Throws error object on failure.
     */
    getLatestBlockNumber(): Promise<number>;
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
    protected getTransactionReceipt(transactionHash: string, errorCount?: number): Promise<ITransactionReceipt>;
}
