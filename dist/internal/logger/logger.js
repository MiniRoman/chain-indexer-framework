"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_transport_sentry_node_1 = __importDefault(require("winston-transport-sentry-node"));
const Sentry = winston_transport_sentry_node_1.default;
let logger = null;
/**
 * LoggerClass that maintains a singleton, and has straightforward methods to log any application events.
 *
 * @author - Vibhu Rajeev, Keshav Gupta - Polygon Technology
 */
class Logger {
    /**
     * @static
     * Create method must first be called before using the logger. It creates a singleton, which will then
     * be referred to throughout the application.
     *
     * @param {LoggerConfig} config - Logger configuration to overwrite winston configs and define sentry + datadog endpoints.
     */
    static create(config) {
        var _a, _b, _c, _d, _e, _f;
        if (!logger) {
            logger = winston_1.default.createLogger(Object.assign({
                format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.colorize({
                    all: true,
                    colors: {
                        error: "red",
                        warn: "yellow",
                        info: "green",
                        debug: "white",
                    }
                }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
                transports: [
                    new winston_1.default.transports.Console({
                        level: ((_a = config.console) === null || _a === void 0 ? void 0 : _a.level) || "info"
                    }),
                    new Sentry({
                        sentry: {
                            dsn: (_b = config.sentry) === null || _b === void 0 ? void 0 : _b.dsn,
                            environment: ((_c = config.sentry) === null || _c === void 0 ? void 0 : _c.environment) || "development"
                        },
                        level: ((_d = config.sentry) === null || _d === void 0 ? void 0 : _d.level) || "error",
                    }),
                    new winston_1.default.transports.Http({
                        host: "http-intake.logs.datadoghq.com",
                        path: "/api/v2/logs?dd-api-key=" + ((_e = config.datadog) === null || _e === void 0 ? void 0 : _e.api_key) + "&ddsource=nodejs&service=" + ((_f = config.datadog) === null || _f === void 0 ? void 0 : _f.service_name),
                        ssl: true
                    }),
                ]
            }, config.winston));
        }
    }
    /**
     * @static
     * Method to log for level - "info", this should not be called if it has been custom levels are
     * set which does not include "info"
     *
     * @param {string|object} message - String or object to log.
     */
    static info(message) {
        if (typeof message === "string") {
            logger === null || logger === void 0 ? void 0 : logger.info(message);
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.info(JSON.stringify(message));
        }
    }
    /**
     * @static
     * Method to log for level - "debug", this should not be called if it has been custom levels are
     * set which does not include "debug"
     *
     * @param {string|object} message - String or object to log.
     */
    static debug(message) {
        if (typeof message === "string") {
            logger === null || logger === void 0 ? void 0 : logger.debug(message);
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.debug(JSON.stringify(message));
        }
    }
    /**
     * @static
     * Method to log for level - "error", this should not be called if it has been custom levels are
     * set which does not include "error"
     *
     * @param {string|object} error - String or object to log.
     */
    static error(error) {
        if (typeof error === "string") {
            logger === null || logger === void 0 ? void 0 : logger.error(error);
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.error(`${error.message ? `${error.message} : ` : ""}${JSON.stringify(error)}`);
        }
    }
    /**
     * @static
     * Method to log for level - "warn", this should not be called if it has been custom levels are
     * set which does not include "warn"
     *
     * @param {string|object} message - String or object to log.
     */
    static warn(message) {
        if (typeof message === "string") {
            logger === null || logger === void 0 ? void 0 : logger.warn(message);
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.warn(JSON.stringify(message));
        }
    }
    /**
     * @static
     * Method to log for any level, which should be used to log all custom levels that may be added.
     *
     * @param {string|object} message - String or object to log.
     */
    static log(level, message) {
        if (typeof message === "string") {
            logger === null || logger === void 0 ? void 0 : logger.log(level, message);
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.log(level, JSON.stringify(message));
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map