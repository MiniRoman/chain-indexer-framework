import { IBlock } from "../interfaces/block.js";
import { BlockGetter } from "./block_getter.js";
import { IBlockGetter } from "../interfaces/block_getter.js";
/**
 * A wrapper class on web3 to get blocks from erigon nodes and format them.
 *
 * @author - Vibhu Rajeev
 */
export declare class ErigonBlockGetter extends BlockGetter implements IBlockGetter {
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
    getBlockWithTransactionReceipts(blockNumber: number | string, retryCount?: number): Promise<IBlock>;
    /**
     * @private
     *
     * Private method to get all transaction receipts for a block.
     *
     * @param {number | string} blockNumber - Block number for which transaction receipts are to be retrieved.
     *
     * @returns {Promise<IRawReceipt[]>} - Array of raw transaction receipts.
     */
    private getTransactionReceipts;
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
    private sendTransactionReceiptsCall;
}
