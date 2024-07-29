import { IBlockGetterWorkerPromise } from "../interfaces/block_getter_worker_promise.js";
import { AbstractBlockSubscription } from "./abstract_block_subscription.js";
import { Eth } from "web3-eth";
/**
 * Block subscription class which emits full block data whenever added to chain.
 * The subscription takes care internally to backfill if historical blocks are requested.
 *
 * @author - Vibhu Rajeev
 */
export declare class BlockSubscription extends AbstractBlockSubscription {
    protected rpcWsEndpoints: string[];
    protected maxRetries: number;
    private blockGetterType;
    protected alternateEndpoint?: string | undefined;
    protected rpcTimeout?: number | undefined;
    private workers;
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
    constructor(eth: Eth, rpcWsEndpoints?: string[], maxRetries?: number, blockGetterType?: "quicknode_block_getter" | "erigon_block_getter" | "block_getter", timeout?: number, blockDelay?: number, alternateEndpoint?: string | undefined, rpcTimeout?: number | undefined);
    /**
     * Private method to set workers as per the rpc urls passed.
     *
     * @returns {void}
     */
    private setWorkers;
    /**
     * Private method to emit blocks upto current finalized block.
     *
     * @returns {Promise<void>}
     */
    protected backFillBlocks(): Promise<void>;
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
    protected getBlockFromWorker(blockNumber: number, workerId?: number): Promise<IBlockGetterWorkerPromise>;
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
    private addWorkerJobToQueue;
}
