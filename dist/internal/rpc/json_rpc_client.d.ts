import { IRPCPayload } from "../interfaces/rpc_payload.js";
/**
 * A utility class to make RPC calls to the given node URL.
 */
export declare class JSONRPCClient {
    private url;
    /**
     * @constructor
     *
     * @param {string} url - The url of the node to make RPC call.
     */
    constructor(url: string);
    /**
     * Method to make an rpc call
     *
     * @param {IRPCPayload} payload
     *
     * @returns {Promise<any>}
     */
    call<T>(payload: IRPCPayload): Promise<T>;
}
