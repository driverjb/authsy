"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vault = void 0;
var crypto_1 = require("crypto");
var Vault = /** @class */ (function () {
    function Vault(type, iterations) {
        this._type = type;
        this._iterations = iterations;
    }
    Object.defineProperty(Vault.prototype, "type", {
        /** The type of the vault */
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vault.prototype, "iterations", {
        /** The number of iterations being performed during hash creation */
        get: function () {
            return this._iterations;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Asynchronusly create a vault entry record to be stored in a vault
     * @param id The numerical id for the new user
     * @param password The password to be hashed
     * @returns A vault entry
     */
    Vault.prototype.createPasswordHash = function (password, salt) {
        var _this = this;
        var randomNumberString = Math.floor(Math.random() * 1000000000000000000).toString();
        var theSalt = salt !== null && salt !== void 0 ? salt : crypto_1.createHash('sha512').update(randomNumberString).digest('hex');
        return new Promise(function (resolve, reject) {
            crypto_1.pbkdf2(password, theSalt, _this.iterations, 64, 'sha512', function (err, key) {
                if (err)
                    reject(err);
                else {
                    var entry = { passwordHash: key.toString('hex'), salt: theSalt };
                    resolve(entry);
                }
            });
        });
    };
    return Vault;
}());
exports.Vault = Vault;
exports.default = Vault;
