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
var validVaultEntry = joi_1.default.object({
    id: joi_1.default.number().min(1).required(),
    passwordHash: joi_1.default.string().required(),
    salt: joi_1.default.string().required()
});
var validVaultFile = joi_1.default.object().pattern(joi_1.default.number().min(1), validVaultEntry);
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
        if (error)
            throw error;
        return value;
    };
    FileVault.prototype.saveFile = function () {
        var fileName = path_1.default.basename(this._filePath);
        var pathName = this._filePath.replace(fileName, '');
        if (!fs_1.default.existsSync(pathName))
            throw new Error('Specified file path does not exist. Cannot write file.');
        else
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
                        error = validVaultEntry.validate(entry).error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.createPasswordHash(entry.id, password, entry.salt)];
                    case 1:
                        testEntry = _a.sent();
                        return [2 /*return*/, testEntry.passwordHash === entry.passwordHash];
                }
            });
        });
    };
    FileVault.prototype.create = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var nextIndex, newEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextIndex = this.nextIndex;
                        return [4 /*yield*/, this.createPasswordHash(nextIndex, password)];
                    case 1:
                        newEntry = _a.sent();
                        chai_1.expect(newEntry.id).to.equal(nextIndex);
                        chai_1.expect(newEntry.passwordHash).to.be.a('string').lengthOf.greaterThan(32);
                        chai_1.expect(newEntry.salt).to.be.a('string').lengthOf.greaterThan(32);
                        this._data[nextIndex] = newEntry;
                        this.saveFile();
                        return [2 /*return*/, nextIndex];
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
                        if (!entry) return [3 /*break*/, 2];
                        error = validVaultEntry.validate(entry).error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.createPasswordHash(entry.id, password)];
                    case 1:
                        newEntry = _a.sent();
                        this._data[entry.id] = newEntry;
                        this.saveFile();
                        return [2 /*return*/, true];
                    case 2: throw new Error("User id does not exist. Cannot update password hash.");
                }
            });
        });
    };
    FileVault.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._data[id]) {
                    delete this._data[id];
                    this.saveFile();
                    return [2 /*return*/, true];
                }
                else
                    throw new Error("User id does not exist. Cannot delete entry.");
                return [2 /*return*/];
            });
        });
    };
    return FileVault;
}(Vault_class_1.default));
exports.FileVault = FileVault;
exports.default = FileVault;
