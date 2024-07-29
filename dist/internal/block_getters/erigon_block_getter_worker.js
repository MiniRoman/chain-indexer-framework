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
const worker_threads_1 = require("worker_threads");
const erigon_block_getter_js_1 = require("./erigon_block_getter.js");
const web3_eth_1 = __importDefault(require("web3-eth"));
if (!worker_threads_1.workerData || !worker_threads_1.parentPort) {
    process.exit(1);
}
const blockGetter = new erigon_block_getter_js_1.ErigonBlockGetter(
//@ts-ignore
new web3_eth_1.default(
//@ts-ignore
new web3_eth_1.default.providers.WebsocketProvider(worker_threads_1.workerData.endpoint, {
    reconnect: {
        auto: true
    },
    clientConfig: {
        maxReceivedFrameSize: 1000000000,
        maxReceivedMessageSize: 1000000000,
    },
    timeout: 45000
})), worker_threads_1.workerData.maxRetries);
worker_threads_1.parentPort.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
            callBackId: message.callBackId,
            error: null,
            block: yield blockGetter.getBlockWithTransactionReceipts(message.blockNumber)
        });
    }
    catch (error) {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
            callBackId: message.callBackId,
            error: error
        });
    }
}));
//# sourceMappingURL=erigon_block_getter_worker.js.map