/// <reference types="node" />
import { CoderError } from "../errors/coder_error.js";
import { ICoder } from "../interfaces/coder.js";
/**
 * The deserialiser class provides simple and straighforward methods to load and deserialise a buffer based on
 * protobuf schemas.
 *
 * @author - Vibhu Rajeev
 */
export declare class Coder implements ICoder {
    private fileName;
    private packageName;
    private messageType;
    private fileDirectory;
    private protobufType?;
    private loadPromise?;
    /**
     * @param {string} fileName - The file for finding the protobuf type.
     * @param {string} packageName - The default package where the protobuf type is defined.
     * @param {string} messageType - The default protobuf message type to be used for deserialising.
     * @param {string} [fileDirectory] - Optional: The custom path for loading the protobuf type.
     */
    constructor(fileName: string, packageName: string, messageType: string, fileDirectory?: string);
    /**
     * Public method to load the proto message type from file.
     * This method must always be called before calling the deserialize or serialize method.
     *
     * @returns {Promise<Type>} - Returns "true" if the load was successfull.
     *
     * @throws {CoderError} - Throws an error if the load failed.
     */
    private loadType;
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
    deserialize(buffer: Buffer): Promise<object>;
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
    serialize(messageObject: object): Promise<Uint8Array | CoderError>;
}
