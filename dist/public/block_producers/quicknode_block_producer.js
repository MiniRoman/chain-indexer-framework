"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickNodeBlockProducer = void 0;
const block_producer_js_1 = require("../../internal/block_producers/block_producer.js");
const produced_blocks_model_js_1 = require("../../internal/block_producers/produced_blocks_model.js");
const block_subscription_js_1 = require("../../internal/block_subscription/block_subscription.js");
const quicknode_block_getter_js_1 = require("../../internal/block_getters/quicknode_block_getter.js");
const protobuf_coder_js_1 = require("../../internal/coder/protobuf_coder.js");
const database_js_1 = require("../../internal/mongo/database.js");
const web3_eth_1 = __importDefault(require("web3-eth"));
/**
 * Quicknode block producer class which retrieves block from quick node
 * for producing to kafka.
 *
 */
class QuickNodeBlockProducer extends block_producer_js_1.BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {QuickNodeBlockProducer}
     */
    constructor(config) {
        var _a, _b, _c, _d, _e, _f, _g;
        const endpoints = (_a = config.rpcWsEndpoints) !== null && _a !== void 0 ? _a : [];
        const startBlock = (_b = config.startBlock) !== null && _b !== void 0 ? _b : 0;
        const mongoUrl = (_c = config.mongoUrl) !== null && _c !== void 0 ? _c : "mongodb://localhost:27017/chain-indexer";
        const dbCollection = (_d = config.dbCollection) !== null && _d !== void 0 ? _d : "producedblocks";
        const maxReOrgDepth = (_e = config.maxReOrgDepth) !== null && _e !== void 0 ? _e : 0;
        const maxRetries = (_f = config.maxRetries) !== null && _f !== void 0 ? _f : 0;
        const blockSubscriptionTimeout = config.blockSubscriptionTimeout;
        const blockDelay = (_g = config.blockDelay) !== null && _g !== void 0 ? _g : 0;
        const alternateEndpoint = config.alternateEndpoint;
        const rpcTimeout = config.rpcTimeout;
        // Has to be done or Kafka complains later
        delete config.rpcWsEndpoints;
        delete config.startBlock;
        delete config.mongoUrl;
        delete config.dbCollection;
        delete config.maxReOrgDepth;
        delete config.maxRetries;
        delete config.blockDelay;
        delete config.blockSubscriptionTimeout;
        delete config.blockDelay;
        delete config.alternateEndpoint;
        delete config.rpcTimeout;
        //@ts-ignore
        const eth = new web3_eth_1.default(
        //@ts-ignore
        new web3_eth_1.default.providers.WebsocketProvider(endpoints[0], {
            reconnect: {
                auto: true
            },
            clientConfig: {
                maxReceivedFrameSize: 1000000000,
                maxReceivedMessageSize: 1000000000,
            }
        }));
        const database = new database_js_1.Database(mongoUrl);
        super(new protobuf_coder_js_1.Coder("block", "blockpackage", "Block"), config, new block_subscription_js_1.BlockSubscription(
        //@ts-ignore
        eth, endpoints, maxRetries, "quicknode_block_getter", blockSubscriptionTimeout, blockDelay, alternateEndpoint, rpcTimeout), new quicknode_block_getter_js_1.QuickNodeBlockGetter(eth, maxRetries), database, database.model("ProducedBlocks", produced_blocks_model_js_1.ProducedBlocksModel, dbCollection), startBlock, maxReOrgDepth);
    }
}
exports.QuickNodeBlockProducer = QuickNodeBlockProducer;
//# sourceMappingURL=quicknode_block_producer.js.map