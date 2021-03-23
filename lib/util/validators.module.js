"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultEntry = void 0;
var joi_1 = __importDefault(require("joi"));
exports.vaultEntry = joi_1.default.object({
    id: joi_1.default.number().min(1).required(),
    passwordHash: joi_1.default.string().required(),
    salt: joi_1.default.string().required()
});
exports.default = {
    vaultEntry: exports.vaultEntry
};
