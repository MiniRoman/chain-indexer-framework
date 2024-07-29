"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorObject = void 0;
/**
 * Small helper we have added for now.
 *
 * @param error {unknown}
 *
 * @returns {Error|TypeError}
 */
function createErrorObject(error) {
    if (error instanceof Error || error instanceof TypeError) {
        return error;
    }
    return new Error(String(error));
}
exports.createErrorObject = createErrorObject;
//# sourceMappingURL=create_error_object.js.map