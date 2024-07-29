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
exports.Database = void 0;
const mongoose_1 = require("mongoose");
let database = null;
/**
 * Database class is a singleton class that provides simple straightforward method to connect and disconnect to database
 * with a particular collection. it has one inconsistency on not extending this class from mongoose due to mongoose implementation.
 * that is why mongoose is initialized in the constructor.
 */
class Database {
    /**
     * @param {string} url - The url for database that needs to be connected
     * this constructor will create instance of database and initialize it with database URL
    */
    constructor(url) {
        this.url = url;
        if (!database) {
            this.database = new mongoose_1.Mongoose();
            database = this;
        }
        return database;
    }
    /**
     * The method connect will connect to database and will return if already connnected to db. It is an async function
     * to handle errors in better ways. It has a void return type. this function should only be called once when
     * the class is initialized. there is no harm in calling the function again as it will return if its already
     * connected to database
     *
     * @returns {Promis<boolean>}
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.database.connection.readyState === 1 || this.database.connection.readyState === 2)) {
                yield this.database.connect(this.url);
            }
            return true;
        });
    }
    /**
    * it will disconnect from database if database is connected. and has a void return type. It is internally
    * calling disconnect function of Mongoose. this function should only be called when database needs to be disconnected.
    *
    * @returns {Promise<boolean>}
    */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.database.connection.readyState === 0 || this.database.connection.readyState === 3)) {
                yield this.database.disconnect();
            }
            return true;
        });
    }
    /**
     * Defines a model or retrieves it.
     * Models defined on this mongoose instance are available to all connection created by the same mongoose instance.
     *
     * @param {string} name - Name of the model.
     * @param {Schema} schema - Schema for which model is to be created.
     * @param {string} collection - Collection name of the model.
     * @param {CompileModelOptions} options - Optional object for mongoose options while creating the collection.
     *
     * @returns {U} - The mongoose model.
     */
    model(name, schema, collection, options) {
        return this.database.model(name, schema, collection, options);
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map