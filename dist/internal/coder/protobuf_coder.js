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
exports.Coder = void 0;
const get_error_message_js_1 = require("../errors/get_error_message.js");
const coder_error_js_1 = require("../errors/coder_error.js");
const protobufjs_1 = __importDefault(require("protobufjs"));
const module_1 = require("module");
const logger_js_1 = require("../logger/logger.js");
const url_1 = __importDefault(require("url"));
const { load } = protobufjs_1.default;
/**
 * The deserialiser class provides simple and straighforward methods to load and deserialise a buffer based on
 * protobuf schemas.
 *
 * @author - Vibhu Rajeev
 */
class Coder {
    /**
     * @param {string} fileName - The file for finding the protobuf type.
     * @param {string} packageName - The default package where the protobuf type is defined.
     * @param {string} messageType - The default protobuf message type to be used for deserialising.
     * @param {string} [fileDirectory] - Optional: The custom path for loading the protobuf type.
     */
    constructor(fileName, packageName, messageType, fileDirectory = "@maticnetwork/chain-indexer-framework/schemas") {
        this.fileName = fileName;
        this.packageName = packageName;
        this.messageType = messageType;
        this.fileDirectory = fileDirectory;
    }
    /**
     * Public method to load the proto message type from file.
     * This method must always be called before calling the deserialize or serialize method.
     *
     * @returns {Promise<Type>} - Returns "true" if the load was successfull.
     *
     * @throws {CoderError} - Throws an error if the load failed.
     */
    loadType() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.loadPromise) {
                    this.loadPromise = load(
                    // https://nodejs.org/api/esm.html#no-requireresolve - Alternative for require.resolve
                    // @ts-ignore
                    (0, module_1.createRequire)(url_1.default.pathToFileURL(__filename).toString()).resolve(`${this.fileDirectory}/${this.fileName}.proto`)).then((root) => {
                        return root.lookupType(`${this.packageName}.${this.messageType}`);
                    });
                }
                return yield this.loadPromise;
            }
            catch (error) {
                const message = (0, get_error_message_js_1.getErrorMessage)(error);
                throw new coder_error_js_1.CoderError("Coder error", coder_error_js_1.CoderError.codes.INVALID_PATH_PROTO, true, message);
            }
        });
    }
    /**
     * This is the main method of the class, to deserialise a given
     * buffer value. If the package name and protobuf type is not passed, default values are used.
     *
     * @param {Buffer} buffer - Buffer to be deserialised.
     *
     * @returns {Promise<object>} - Decoded object of the buffer passed.
     *
     * @throws {CoderError} - Throws error on failure to find protobuf type definition at the path specified.
     */
    deserialize(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.protobufType) {
                this.protobufType = yield this.loadType();
            }
            try {
                if (this.messageType === "L1StateBlock") {
                    logger_js_1.Logger.info({
                        message: "In coder deserialize - for L1StateBlock", data: {
                            base64: buffer.toString("base64"),
                            stringData: buffer.toString(),
                            buffer
                        }
                    });
                }
                return this.protobufType.decode(buffer);
            }
            catch (error) {
                throw new coder_error_js_1.CoderError("Decoding error", coder_error_js_1.CoderError.codes.DECODING_ERROR, true, (0, get_error_message_js_1.getErrorMessage)(error));
            }
        });
    }
    /**
    * This is the main method of the class, to deserialise a given
    * buffer value. If the package name and protobuf type is not passed, default values are used.
    *
    * @param {object} messageObject - Message object to be serialised.
    *
    * @returns {Promise<Uint8Array | CoderError>} - Serialised buffer of the passed object.
    *
    * @throws {CoderError} - Throws error object on verification failure or if failure in finding protobuf type definition.
    */
    serialize(messageObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.protobufType) {
                this.protobufType = yield this.loadType();
            }
            const verificationError = this.protobufType.verify(messageObject);
            if (verificationError) {
                throw new coder_error_js_1.CoderError("Message verification failed", coder_error_js_1.CoderError.codes.ENCODING_VERIFICATION_FAILED, false, verificationError);
            }
            return this.protobufType.encode(messageObject).finish();
        });
    }
}
exports.Coder = Coder;
//# sourceMappingURL=protobuf_coder.js.map