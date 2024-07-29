import { IBlockGetterWorkerPromise } from "../interfaces/block_getter_worker_promise.js";
import { IBlockSubscription } from "../interfaces/block_subscription.js";
import { BlockProducerError } from "../errors/block_producer_error.js";
import { IObserver } from "../interfaces/observer.js";
import { IBlock } from "../interfaces/block.js";
import { Queue } from "../queue/queue.js";
import { Eth } from "web3-eth";
/**
 * @abstract
 *
 * Block subscription class which emits full block data whenever added to chain and
 * takes care to backfill historical blocks requested. The backfilling strategy needs to be implemented by
 * class extending from this.
 *
 * @author - Vibhu Rajeev
 */
export declare abstract class AbstractBlockSubscription extends Queue<IBlockGetterWorkerPromise> implements IBlockSubscription<IBlock, BlockProducerError> {
    private eth;
    private timeout;
    private blockDelay;
    private subscription;
    protected observer: IObserver<IBlock, BlockProducerError>;
    private lastBlockHash;
    private processingQueue;
    protected fatalError: boolean;
    protected lastFinalizedBlock: number;
    protected nextBlock: number;
    protected activeBackFillingId: number | null;
    private checkIfLiveTimeout?;
    private lastReceivedBlockNumber;
    private lastEmittedBlock?;
    /**
     * @constructor
     *
     * @param {Eth} eth - Eth module from web3.js
     * @param {number} timeout - Timeout for which if there has been no event, connection must be restarted.
     */
    constructor(eth: Eth, timeout?: number, blockDelay?: number);
    /**
     * The subscribe method starts the subscription from last produced block, and calls observer.next for
     * each new block.
     *
     * @param {IObserver} observer - The observer object with its functions which will be called on events.
     * @param {number} startBlock - The block number to start subscribing from.
     *
     * @returns {Promise<void>}
     *
     * @throws {BlockProducerError} - On failure to get start block or start subscription.
     */
    subscribe(observer: IObserver<IBlock, BlockProducerError>, startBlock: number): Promise<void>;
    /**
     * Unsubscribes from block subscription and resolves on success
     *
     * @returns {Promise<boolean>} - Resolves true on graceful unsubscription.
     *
     * @throws {BlockProducerError} - Throws block producer error on failure to unsubscribe gracefully.
     */
    unsubscribe(): Promise<boolean>;
    /**
     * Private method to emit blocks upto current finalized block.
     *
     * @returns {Promise<void>}
     */
    protected abstract backFillBlocks(): Promise<void>;
    /**
     * Does get the block from the defined worker (workerId).
     *
     * @param {number} blockNumber
     * @param {number} workerId
     *
     * @returns {Promise<IBlockGetterWorkerPromise>}
     */
    protected abstract getBlockFromWorker(blockNumber: number, workerId?: number): Promise<IBlockGetterWorkerPromise>;
    /**
     * @async
     * Private method, process queued promises of getBlock, and calls observer.next when resolved.
     *
     * @returns {Promise<void>}
     */
    private processQueue;
    /**
     * @private
     *
     * Method to check if there are empty or missed blocks between last produced block and current event received.
     *
     * @param {number} blockNumber - The block number of the received event log.
     *
     * @returns {boolean}
     */
    private hasMissedBlocks;
    /**
     * @private
     *
     * Private method to check if a re org has been missed by the subscription.
     *
     * @param {IBlock} block - Latest block being emitted.
     *
     * @returns {boolean}
     */
    private isReOrgedMissed;
    /**
     * @private
     *
     * Method to enqueue missed or empty blocks between last produced blocks and currently received event.
     *
     * @param {number} currentBlockNumber - Block number for which current event was received.
     *
     * @returns {void}
     */
    private enqueueMissedBlocks;
    private checkIfLive;
}
