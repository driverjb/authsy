import Vault from './Vault.class';
import { Database } from 'better-sqlite3';
export declare class SQLiteVault extends Vault {
    private _database;
    private _statements;
    /**
     * @class
     * @constructor
     * @param filePath The path where the JSON vault file will be stored
     * @param iterations The number of iterations to be used during hash creation
     */
    constructor(database: Database, iterations: number);
    authenticate(id: number, password: string): Promise<boolean>;
    create(password: string): Promise<number>;
    update(id: number, password: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
export default SQLiteVault;
