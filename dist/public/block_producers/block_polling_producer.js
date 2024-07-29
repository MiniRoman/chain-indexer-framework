"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockPollerProducer = void 0;
const produced_blocks_model_js_1 = require("../../internal/block_producers/produced_blocks_model.js");
const block_getter_js_1 = require("../../internal/block_getters/block_getter.js");
const protobuf_coder_js_1 = require("../../internal/coder/protobuf_coder.js");
const block_polling_js_1 = require("../../internal/block_subscription/block_polling.js");
const database_js_1 = require("../../internal/mongo/database.js");
const block_producer_js_1 = require("../../internal/block_producers/block_producer.js");
const web3_eth_1 = __importDefault(require("web3-eth"));
/**
 * Block Poller producer class which retrieves block from polling every block
 * for producing to kafka.
 *
 */
class BlockPollerProducer extends block_producer_js_1.BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {BlockPollerProducer}
     */
    constructor(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const endpoint = (_b = (_a = config.rpcWsEndpoints) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "";
        const startBlock = (_c = config.startBlock) !== null && _c !== void 0 ? _c : 0;
        const mongoUrl = (_d = config.mongoUrl) !== null && _d !== void 0 ? _d : "mongodb://localhost:27017/chain-indexer";
        const dbCollection = (_e = config.dbCollection) !== null && _e !== void 0 ? _e : "producedblocks";
        const blockPollingTimeout = (_f = config.blockPollingTimeout) !== null && _f !== void 0 ? _f : 2000;
        const maxRetries = (_g = config.maxRetries) !== null && _g !== void 0 ? _g : 0;
        const maxReOrgDepth = (_h = config.maxReOrgDepth) !== null && _h !== void 0 ? _h : 0;
        delete config.rpcWsEndpoints;
        delete config.startBlock;
        delete config.mongoUrl;
        delete config.dbCollection;
        delete config.maxReOrgDepth;
        delete config.maxRetries;
        delete config.blockPollingTimeout;
        const database = new database_js_1.Database(mongoUrl);
        const blockGetter = new block_getter_js_1.BlockGetter(
        //@ts-ignore
        new web3_eth_1.default(endpoint), maxRetries);
        super(new protobuf_coder_js_1.Coder("block", "blockpackage", "Block"), config, new block_polling_js_1.BlockPoller(blockGetter, blockPollingTimeout), blockGetter, database, database.model("ProducedBlocks", produced_blocks_model_js_1.ProducedBlocksModel, dbCollection), startBlock, maxReOrgDepth);
    }
}
exports.BlockPollerProducer = BlockPollerProducer;
//# sourceMappingURL=block_polling_producer.js.map