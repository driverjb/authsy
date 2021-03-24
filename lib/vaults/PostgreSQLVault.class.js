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
exports.PostgreSQLVault = void 0;
var chai_1 = require("chai");
var Vault_class_1 = __importDefault(require("./Vault.class"));
var errors_module_1 = __importDefault(require("../util/errors.module"));
var getSqlQueries = function (schemaName, tableName) {
    return {
        create: {
            schema: "create schema if not exists " + schemaName,
            table: "create table if not exists " + schemaName + "." + tableName + " (id bigserial primary key, \"passwordHash\" text, salt text)",
            entry: "insert into " + schemaName + "." + tableName + " (\"passwordHash\", salt) values ($1, $2) returning id"
        },
        delete: "delete from " + schemaName + "." + tableName + " where id=$1",
        update: "update " + schemaName + "." + tableName + " set \"passwordHash\"=$1, salt=$2 where id=$3",
        authenticate: "select 1 from " + schemaName + "." + tableName + " where \"passwordHash\"=$1 and id=$2",
        userExists: "select salt from " + schemaName + "." + tableName + " where id=$1"
    };
};
var PostgreSQLVault = /** @class */ (function (_super) {
    __extends(PostgreSQLVault, _super);
    function PostgreSQLVault(opt) {
        var _this = _super.call(this, 'pgsql', opt.iterations) || this;
        _this._pool = opt.pool;
        _this._queries = getSqlQueries(opt.schemaName, opt.tableName);
        _this._pool
            .query(_this._queries.create.schema)
            .then(function () { return _this._pool.query(_this._queries.create.table); });
        return _this;
    }
    PostgreSQLVault.prototype.authenticate = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var result, salt, testHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pool.query(this._queries.userExists, [id])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length !== 1)
                            return [2 /*return*/, false];
                        salt = result.rows[0].salt;
                        return [4 /*yield*/, this.createPasswordHash(password, salt)];
                    case 2:
                        testHash = _a.sent();
                        return [4 /*yield*/, this._pool.query(this._queries.authenticate, [testHash.passwordHash, id])];
                    case 3:
                        result = _a.sent();
                        if (result.rows.length !== 1)
                            return [2 /*return*/, false];
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PostgreSQLVault.prototype.create = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, passwordHash, salt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        _a = _b.sent(), passwordHash = _a.passwordHash, salt = _a.salt;
                        return [2 /*return*/, this._pool
                                .query(this._queries.create.entry, [passwordHash, salt])
                                .then(function (result) { return Number(result.rows[0].id); })];
                }
            });
        });
    };
    PostgreSQLVault.prototype.update = function (id, password) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, passwordHash, salt, rowCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.createPasswordHash(password)];
                    case 1:
                        _a = _b.sent(), passwordHash = _a.passwordHash, salt = _a.salt;
                        return [4 /*yield*/, this._pool.query(this._queries.update, [passwordHash, salt, id])];
                    case 2:
                        rowCount = (_b.sent()).rowCount;
                        chai_1.expect(rowCount, errors_module_1.default.cannotUpdate).to.equal(1);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PostgreSQLVault.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rowCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pool.query(this._queries.delete, [id])];
                    case 1:
                        rowCount = (_a.sent()).rowCount;
                        chai_1.expect(rowCount, errors_module_1.default.cannotDelete).to.equal(1);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return PostgreSQLVault;
}(Vault_class_1.default));
exports.PostgreSQLVault = PostgreSQLVault;
exports.default = PostgreSQLVault;
