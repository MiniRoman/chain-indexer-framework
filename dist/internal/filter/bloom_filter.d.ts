/**
 * Bloomfilter class which extends the Bloom filter package, all methods to be implemented here.
 */
export declare class BloomFilter {
    /**
     * @param {string} bloom - The bloom filter passed
     * @param {string} contractAddress - The address you are looking for
     *
     * @returns {boolean}
     */
    static isContractAddressInBloom(bloom: string, contractAddress: string): boolean;
    /**
     * @param {string} bloom - The bloom filter passed
     * @param {string} topic - The topic signature you are looking for
     *
     * @returns {boolean}
     */
    static isTopicInBloom(bloom: string, topic: string): boolean;
}
