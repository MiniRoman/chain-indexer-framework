import { IBlock } from "../interfaces/block.js";
import { IBlockGetter } from "../interfaces/block_getter.js";
import { BlockGetter } from "./block_getter.js";
import { Eth } from "web3-eth";
/**
 * A wrapper class on web3 to get blocks from quicknode and format them.
 *
 * @author - Vibhu Rajeev
 */
export declare class QuickNodeBlockGetter extends BlockGetter implements IBlockGetter {
    private alternateEth?;
    private rpcTimeout?;
    /**
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} maxRetries - The number of times to retry on errors.
     *
     * @constructor
     */
    constructor(eth: Eth, maxRetries?: number, alternateEth?: Eth | undefined, rpcTimeout?: number | undefined);
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
    getBlockWithTransactionReceipts(blockNumber: number | string, retryCount?: number): Promise<IBlock>;
}
