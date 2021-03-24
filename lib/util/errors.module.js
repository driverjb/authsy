"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failedCreate = exports.multiChangeError = exports.cannotUpdate = exports.cannotDelete = void 0;
exports.cannotDelete = "User id does not exist. Cannot delete entry.";
exports.cannotUpdate = "User id does not exist. Cannot update password hash.";
var multiChangeError = function (total, action) {
    return "Expected to " + action + " 1 user, but detected " + total + " changes.";
};
exports.multiChangeError = multiChangeError;
exports.failedCreate = "Failed to create new user entry";
exports.default = { cannotDelete: exports.cannotDelete, cannotUpdate: exports.cannotUpdate, multiChangeError: exports.multiChangeError, failedCreate: exports.failedCreate };
