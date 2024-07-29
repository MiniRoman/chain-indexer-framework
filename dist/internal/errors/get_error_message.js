"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
/**
 * Smaller helper we have added for now.
 *
 * @param error {unkown}
 *
 * @returns {String}
 */
function getErrorMessage(error) {
    if (!error) {
        return "Unknown error";
    }
    if (error instanceof Error)
        return error.message;
    return typeof error === "object" ? JSON.stringify(error) : String(error);
}
exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=get_error_message.js.map