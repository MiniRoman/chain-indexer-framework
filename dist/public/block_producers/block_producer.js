"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockProducer = void 0;
const produced_blocks_model_js_1 = require("../../internal/block_producers/produced_blocks_model.js");
const block_producer_js_1 = require("../../internal/block_producers/block_producer.js");
const block_subscription_js_1 = require("../../internal/block_subscription/block_subscription.js");
const block_getter_js_1 = require("../../internal/block_getters/block_getter.js");
const protobuf_coder_js_1 = require("../../internal/coder/protobuf_coder.js");
const database_js_1 = require("../../internal/mongo/database.js");
const web3_eth_1 = __importDefault(require("web3-eth"));
/**
 * Common lock producer class which contains the common logic to retrieve
 * raw block data from the configurable "startblock" number, and produce it to
 * a kafka cluster while detecting re orgs and handling them.
 * The block data source, and kafka modules is provided the user of this class.
 *
 * @author - Nitin Mittal
 */
class BlockProducer extends block_producer_js_1.BlockProducer {
    /**
     * @constructor
     *
     * @param {IBlockProducerConfig} config
     *
     * @returns {BlockProducer}
     */
    constructor(config) {
        var _a, _b, _c, _d, _e, _f;
        const endpoints = (_a = config.rpcWsEndpoints) !== null && _a !== void 0 ? _a : [];
        const startBlock = (_b = config.startBlock) !== null && _b !== void 0 ? _b : 0;
        const mongoUrl = (_c = config.mongoUrl) !== null && _c !== void 0 ? _c : "mongodb://localhost:27017/chain-indexer";
        const dbCollection = (_d = config.dbCollection) !== null && _d !== void 0 ? _d : "producedblocks";
        const maxReOrgDepth = (_e = config.maxReOrgDepth) !== null && _e !== void 0 ? _e : 0;
        const maxRetries = (_f = config.maxRetries) !== null && _f !== void 0 ? _f : 0;
        const blockSubscriptionTimeout = config.blockSubscriptionTimeout;
        // Has to be done or Kafka complains later
        delete config.rpcWsEndpoints;
        delete config.startBlock;
        delete config.mongoUrl;
        delete config.dbCollection;
        delete config.maxReOrgDepth;
        delete config.maxRetries;
        delete config.blockSubscriptionTimeout;
        const database = new database_js_1.Database(mongoUrl);
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
        super(new protobuf_coder_js_1.Coder("block", "blockpackage", "Block"), config, new block_subscription_js_1.BlockSubscription(
        //@ts-ignore
        eth, endpoints, maxRetries, "block_getter", blockSubscriptionTimeout), new block_getter_js_1.BlockGetter(eth, maxRetries), database, database.model("ProducedBlocks", produced_blocks_model_js_1.ProducedBlocksModel, dbCollection), startBlock, maxReOrgDepth);
    }
}
exports.BlockProducer = BlockProducer;
//# sourceMappingURL=block_producer.js.map