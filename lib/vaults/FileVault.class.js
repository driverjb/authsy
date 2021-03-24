"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileVault = void 0;
var chai_1 = require("chai");
var Vault_class_1 = __importDefault(require("./Vault.class"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var joi_1 = __importDefault(require("joi"));
var validators_module_1 = __importDefault(require("../util/validators.module"));
var errors_module_1 = __importDefault(require("../util/errors.module"));
var validVaultFile = joi_1.default.object().pattern(joi_1.default.number().min(1), validators_module_1.default.vaultEntry);
var FileVault = /** @class */ (function (_super) {
    __extends(FileVault, _super);
    /**
     * @class
     * @constructor
     * @param filePath The path where the JSON vault file will be stored
     * @param iterations The number of iterations to be used during hash creation
     */
    function FileVault(filePath, iterations) {
        var _this = _super.call(this, 'file', iterations) || this;
        _this._filePath = filePath;
        if (fs_1.default.existsSync(_this._filePath))
            _this._data = _this.loadFile();
        else {
            _this._data = {};
            _this.saveFile();
        }
        return _this;
    }
    Object.defineProperty(FileVault.prototype, "nextIndex", {
        get: function () {
            var keys = Object.keys(this._data);
            var next = 0;
            if (keys.length === 0)
                next = 1;
            else
                next = Number(keys[keys.length - 1]) + 1;
            chai_1.expect(next).to.be.a('number').greaterThan(0);
            return next;
        },
        enumerable: false,
        configurable: true
    });
    FileVault.prototype.loadFile = function () {
        var temp = JSON.parse(fs_1.default.readFileSync(this._filePath).toString());
        var _a = validVaultFile.validate(temp), value = _a.value, error = _a.error;
        chai_1.expect(error, error === null || error === void 0 ? void 0 : error.message).to.be.undefined;
        return value;
    };
    FileVault.prototype.saveFile = function () {
        var fileName = path_1.default.basename(this._filePath);
        var pathName = this._filePath.replace(fileName, '');
        var errorMessage = 'Specified file path does not exist. Cannot write file.';
        chai_1.expect(fs_1.default.existsSync(pathName), errorMessage).to.be.true;
        fs_1.default.writeFileSync(this._filePath, JSON.stringify(this._data));
        return true;
    };
    FileVault.prototype.authenticate = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error, testEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entry = this._data[id];
                        error = validators_module_1.default.vaultEntry.validate(entry).error;
                        chai_1.expect(error, error === null || error === void 0 ? void 0 : error.message).to.be.undefined;
                        return [4 /*yield*/, this.createPasswordHash(password, entry.salt)];
                    case 1:
                        testEntry = _a.sent();
                        return [2 /*return*/, testEntry.passwordHash === entry.passwordHash];
                }
            });
        });
    };
    FileVault.prototype.create = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var id, newEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.nextIndex;
                        return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        newEntry = _a.sent();
                        chai_1.expect(newEntry.passwordHash).to.be.a('string').lengthOf.greaterThan(32);
                        chai_1.expect(newEntry.salt).to.be.a('string').lengthOf.greaterThan(32);
                        this._data[id] = __assign({ id: id }, newEntry);
                        this.saveFile();
                        return [2 /*return*/, id];
                }
            });
        });
    };
    FileVault.prototype.update = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error, newEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entry = this._data[id];
                        chai_1.expect(entry, errors_module_1.default.cannotUpdate).to.not.be.undefined;
                        error = validators_module_1.default.vaultEntry.validate(entry).error;
                        chai_1.expect(error, error === null || error === void 0 ? void 0 : error.message).to.be.undefined;
                        return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        newEntry = _a.sent();
                        this._data[entry.id] = __assign({ id: entry.id }, newEntry);
                        return [2 /*return*/, this.saveFile()];
                }
            });
        });
    };
    FileVault.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                chai_1.expect(this._data[id], errors_module_1.default.cannotDelete).to.not.be.undefined;
                delete this._data[id];
                return [2 /*return*/, this.saveFile()];
            });
        });
    };
    return FileVault;
}(Vault_class_1.default));
exports.FileVault = FileVault;
exports.default = FileVault;
