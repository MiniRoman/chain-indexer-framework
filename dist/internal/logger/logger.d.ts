import { LoggerConfig } from "../interfaces/logger_config.js";
/**
 * LoggerClass that maintains a singleton, and has straightforward methods to log any application events.
 *
 * @author - Vibhu Rajeev, Keshav Gupta - Polygon Technology
 */
export declare class Logger {
    /**
     * @static
     * Create method must first be called before using the logger. It creates a singleton, which will then
     * be referred to throughout the application.
     *
     * @param {LoggerConfig} config - Logger configuration to overwrite winston configs and define sentry + datadog endpoints.
     */
    static create(config: LoggerConfig): void;
    /**
     * @static
     * Method to log for level - "info", this should not be called if it has been custom levels are
     * set which does not include "info"
     *
     * @param {string|object} message - String or object to log.
     */
    static info(message: string | object): void;
    /**
     * @static
     * Method to log for level - "debug", this should not be called if it has been custom levels are
     * set which does not include "debug"
     *
     * @param {string|object} message - String or object to log.
     */
    static debug(message: string | object): void;
    /**
     * @static
     * Method to log for level - "error", this should not be called if it has been custom levels are
     * set which does not include "error"
     *
     * @param {string|object} error - String or object to log.
     */
    static error(error: string | object): void;
    /**
     * @static
     * Method to log for level - "warn", this should not be called if it has been custom levels are
     * set which does not include "warn"
     *
     * @param {string|object} message - String or object to log.
     */
    static warn(message: string | object): void;
    /**
     * @static
     * Method to log for any level, which should be used to log all custom levels that may be added.
     *
     * @param {string|object} message - String or object to log.
     */
    static log(level: string, message: string | object): void;
}
