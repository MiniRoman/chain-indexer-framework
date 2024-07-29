/**
 * A simple class that offers methods to create internal buffers and maintain them.
 */
export declare class Queue<T> {
    private items;
    private head;
    private tail;
    /**
     * Public method to add an item to the queue. This class only maintains one queue and hence it is important to be careful
     * while queueing different entities on the same instance un intentionally.
     *
     * @param {Promise<T> | T} item - Item to be added to the queue
     *
     * @returns {void}
     */
    enqueue(item: Promise<T> | T): void;
    /**
     * Returns an item from the beginning(added first) of the queue and removes it from the queue. Returns null if the queue is empty.
     *
     * @returns {Promise<T> | T | null} - The removed the item.
     */
    shift(): Promise<T> | T | null;
    /**
     * Returns an item from the beginning(added first) + nth - 1 of the queue and removes it along
     * with all other in front of it from the queue. Returns null if the queue is empty or less than the position.
     *
     * @returns {Promise<T> | T | null} - The removed the item.
     */
    shiftByN(position: number): Promise<T> | T | null;
    /**
     * Returns the first item from the queue without removing it.
     *
     * @returns {Promise<T> | T | null} - The first item in the queue or null if empty.
     */
    front(): Promise<T> | T | null;
    /**
     * Method to check if the queue is empty
     *
     * @returns {boolean} - Returns true if empty and false otherwise.
     */
    isEmpty(): boolean;
    /**
     * Method to find the length of the queue.
     *
     * @returns {number} - The length of the queue.
     */
    getLength(): number;
    /**
     * Removes all the items from the queue.
     *
     * @returns {number} - The queue length after clearing.
     */
    clear(): number;
}
