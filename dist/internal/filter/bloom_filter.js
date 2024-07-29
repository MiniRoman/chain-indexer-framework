"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloomFilter = void 0;
const ethereum_bloom_filters_1 = require("ethereum-bloom-filters");
/**
 * Bloomfilter class which extends the Bloom filter package, all methods to be implemented here.
 */
class BloomFilter {
    /**
     * @param {string} bloom - The bloom filter passed
     * @param {string} contractAddress - The address you are looking for
     *
     * @returns {boolean}
     */
    static isContractAddressInBloom(bloom, contractAddress) {
        return (0, ethereum_bloom_filters_1.isContractAddressInBloom)(bloom, contractAddress);
    }
    /**
     * @param {string} bloom - The bloom filter passed
     * @param {string} topic - The topic signature you are looking for
     *
     * @returns {boolean}
     */
    static isTopicInBloom(bloom, topic) {
        return (0, ethereum_bloom_filters_1.isTopicInBloom)(bloom, topic);
    }
}
exports.BloomFilter = BloomFilter;
//# sourceMappingURL=bloom_filter.js.map