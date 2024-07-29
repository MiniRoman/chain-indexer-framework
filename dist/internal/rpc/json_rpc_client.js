"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * A utility class to make RPC calls to the given node URL.
 */
class JSONRPCClient {
    /**
     * @constructor
     *
     * @param {string} url - The url of the node to make RPC call.
     */
    constructor(url) {
        this.url = url;
    }
    /**
     * Method to make an rpc call
     *
     * @param {IRPCPayload} payload
     *
     * @returns {Promise<any>}
     */
    call(payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(this.url, {
                jsonrpc: "2.0",
                id: new Date().getTime(),
                method: payload.method,
                params: (_a = payload.params) !== null && _a !== void 0 ? _a : []
            });
            return response.data.result;
        });
    }
}
exports.JSONRPCClient = JSONRPCClient;
//# sourceMappingURL=json_rpc_client.js.map