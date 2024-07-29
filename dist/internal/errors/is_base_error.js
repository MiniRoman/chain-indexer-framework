"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBaseError = void 0;
const base_error_js_1 = require("./base_error.js");
/**
 * Check if the given error is BaseError. Small helper we might will remove later on.
 *
 * @param error {unknown}
 *
 * @returns {boolean}
 */
function isBaseError(error) {
    return (
    //@ts-ignore
    typeof error === "object" && error !== null && "identifier" in error && error.identifier === base_error_js_1.BaseError.codes.BASE_ERROR);
}
exports.isBaseError = isBaseError;
//# sourceMappingURL=is_base_error.js.map