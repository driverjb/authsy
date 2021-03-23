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
exports.SQLiteVault = void 0;
var Vault_class_1 = __importDefault(require("./Vault.class"));
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var errors_module_1 = __importDefault(require("../util/errors.module"));
var validators_module_1 = __importDefault(require("../util/validators.module"));
var sql = {
    createTable: "create table if not exists authsy (id integer primary key autoincrement, passwordHash text, salt text)",
    createEntry: "insert into authsy (passwordHash, salt) values (@passwordHash, @salt)",
    getEntry: 'select * from authsy where id = @id',
    updateEntry: "update authsy set passwordHash = @passwordHash, salt = @salt where id = @id",
    userExists: "select 1 from authsy where id = @id limit 1",
    deleteEntry: "delete from authsy where id = @id"
};
var SQLiteVault = /** @class */ (function (_super) {
    __extends(SQLiteVault, _super);
    /**
     * @class
     * @constructor
     * @param filePath The path where the JSON vault file will be stored
     * @param iterations The number of iterations to be used during hash creation
     */
    function SQLiteVault(filePath, iterations) {
        var _this = _super.call(this, 'sqlite', iterations) || this;
        _this._database = better_sqlite3_1.default(filePath);
        _this._database.prepare(sql.createTable).run();
        _this._statements = {
            createEntry: _this._database.prepare(sql.createEntry),
            deleteEntry: _this._database.prepare(sql.deleteEntry),
            getEntry: _this._database.prepare(sql.getEntry),
            updateEntry: _this._database.prepare(sql.updateEntry),
            userExists: _this._database.prepare(sql.userExists)
        };
        return _this;
    }
    SQLiteVault.prototype.userExists = function (id) {
        return !!this._statements['userExists'].get({ id: id });
    };
    SQLiteVault.prototype.authenticate = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error, testHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entry = this._statements['getEntry'].get({ id: id });
                        error = validators_module_1.default.vaultEntry.validate(entry).error;
                        if (error)
                            throw error;
                        if (!entry) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createPasswordHash(password, entry.salt)];
                    case 1:
                        testHash = _a.sent();
                        return [2 /*return*/, testHash.passwordHash === entry.passwordHash];
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    SQLiteVault.prototype.create = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        hash = _a.sent();
                        id = this._statements['createEntry'].run(hash).lastInsertRowid;
                        return [2 /*return*/, id];
                }
            });
        });
    };
    SQLiteVault.prototype.update = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var newHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.userExists(id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        newHash = _a.sent();
                        return [2 /*return*/, this._statements['updateEntry'].run(__assign({ id: id }, newHash)).changes > 0];
                    case 2: throw errors_module_1.default.cannotUpdate;
                }
            });
        });
    };
    SQLiteVault.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.userExists(id)) {
                    return [2 /*return*/, this._statements['deleteEntry'].run({ id: id }).changes > 0];
                }
                else
                    throw errors_module_1.default.cannotDelete;
                return [2 /*return*/];
            });
        });
    };
    return SQLiteVault;
}(Vault_class_1.default));
exports.SQLiteVault = SQLiteVault;
exports.default = SQLiteVault;
