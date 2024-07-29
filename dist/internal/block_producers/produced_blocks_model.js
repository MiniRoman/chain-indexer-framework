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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducedBlocksModel = void 0;
const mongoose_1 = require("mongoose");
exports.ProducedBlocksModel = new mongoose_1.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true
    },
}, {
    versionKey: false,
    statics: {
        get(blockNumber) {
            return __awaiter(this, void 0, void 0, function* () {
                const query = blockNumber ? { number: blockNumber } : {};
                return (yield this.find(query, null).sort({ number: -1 }).limit(1).exec())[0];
            });
        },
        add(block, maxReOrgDepth = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.create(block);
                yield this.deleteMany({
                    $or: [
                        { number: { $lt: block.number - maxReOrgDepth } },
                        { number: { $gt: block.number } }
                    ]
                });
            });
        }
    }
});
//# sourceMappingURL=produced_blocks_model.js.map