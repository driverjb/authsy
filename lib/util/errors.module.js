"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cannotUpdate = exports.cannotDelete = void 0;
exports.cannotDelete = new Error("User id does not exist. Cannot delete entry.");
exports.cannotUpdate = new Error("User id does not exist. Cannot update password hash.");
exports.default = { cannotDelete: exports.cannotDelete, cannotUpdate: exports.cannotUpdate };
