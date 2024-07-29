import { IBlockSubscription } from "../interfaces/block_subscription.js";
import { BlockGetter } from "../block_getters/block_getter.js";
import { IObserver } from "../interfaces/observer.js";
import { IBlock } from "../interfaces/block.js";
/**
 * A class to produce blocks based on polling
 *
 * @class {BlockPoller}
 */
export declare class BlockPoller implements IBlockSubscription<IBlock, Error> {
    private blockGetter;
    private blockPollingTimeout;
    private pollingId?;
    /**
     * @constructor
     *
     * @param {BlockGetter} blockGetter - BlockGetter module from web3.js
     * @param {number} blockPollingTimeout - The interval we have to poll for new blocks
     */
    constructor(blockGetter: BlockGetter, blockPollingTimeout: number);
    /**
     * The method to start polling for blocks from the start block to finalized block
     *
     * @param {IObserver} observer - The observer object with his functions
     * @param {number} startBlock - Block number to start subscribing from.
     *
     * @returns {Promise<void>}
     */
    subscribe(observer: IObserver<IBlock, Error>, startBlock: number): Promise<void>;
    /**
     * Stops the block polling process and kills the active interval from setInterval.
     *
     * @returns {Promise<boolean>}
     */
    unsubscribe(): Promise<boolean>;
    private startBlockPolling;
}
