"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABICoder = void 0;
const web3_eth_abi_1 = __importDefault(require("web3-eth-abi"));
/**
 * web3 helper class to access any web3 js related functionalities, use this to define any web3 helper functions
 */
class ABICoder {
    /**
     * @param type {any} - RLP type as eg address
     * @param hex {string} - The bytes string given
     *
     * @returns {any} - Can return arrays, numbers, objects, etc. depends on the RLP type
     */
    static decodeParameter(type, hex) {
        return web3_eth_abi_1.default.decodeParameter(type, hex);
    }
    /**
     * @param types {any[]} - RLP types
     * @param hex {string} - The bytes string given
     *
     * @returns {any} - Can return an object of arrays, numbers, objects, etc. depends on the RLP type
     */
    static decodeParameters(types, hex) {
        return web3_eth_abi_1.default.decodeParameters(types, hex);
    }
    /**
     * @param types {any[]} - RLP types
     * @param values {string[]} - The array of values
     *
     * @returns {any} - return hex string
     */
    static encodeParameters(types, values) {
        return web3_eth_abi_1.default.encodeParameters(types, values);
    }
    /**
     * // TODO: Overtake private type from web3.js or submit PR
     *
     * @param inputs {AbiInput[]} - ABI objects
     * @param hex {string} - bytes given from log.data
     * @param topics {string[]} - Indexed topics
     *
     * @returns
     */
    static decodeLog(inputs, hex, topics) {
        return web3_eth_abi_1.default.decodeLog(inputs, hex, topics);
    }
    /**
     * decode method
     *
     * @param {any[]} types - function name
     * @param {string} data - input Data
     *
     * @returns {{ [key: string]: any }}
     */
    static decodeMethod(types, data) {
        return ABICoder.decodeParameters(types, "0x" + data.slice(10));
    }
}
exports.ABICoder = ABICoder;
//# sourceMappingURL=abi_coder.js.map