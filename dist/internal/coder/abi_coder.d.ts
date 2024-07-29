/**
 * web3 helper class to access any web3 js related functionalities, use this to define any web3 helper functions
 */
export declare class ABICoder {
    /**
     * @param type {any} - RLP type as eg address
     * @param hex {string} - The bytes string given
     *
     * @returns {any} - Can return arrays, numbers, objects, etc. depends on the RLP type
     */
    static decodeParameter(type: any, hex: string): any;
    /**
     * @param types {any[]} - RLP types
     * @param hex {string} - The bytes string given
     *
     * @returns {any} - Can return an object of arrays, numbers, objects, etc. depends on the RLP type
     */
    static decodeParameters(types: any[], hex: string): {
        [key: string]: any;
    };
    /**
     * @param types {any[]} - RLP types
     * @param values {string[]} - The array of values
     *
     * @returns {any} - return hex string
     */
    static encodeParameters(types: any[], values: string[]): string;
    /**
     * // TODO: Overtake private type from web3.js or submit PR
     *
     * @param inputs {AbiInput[]} - ABI objects
     * @param hex {string} - bytes given from log.data
     * @param topics {string[]} - Indexed topics
     *
     * @returns
     */
    static decodeLog(inputs: any[], hex: string, topics: string[]): {
        [key: string]: string;
    };
    /**
     * decode method
     *
     * @param {any[]} types - function name
     * @param {string} data - input Data
     *
     * @returns {{ [key: string]: any }}
     */
    static decodeMethod(types: any[], data: string): {
        [key: string]: any;
    };
}
