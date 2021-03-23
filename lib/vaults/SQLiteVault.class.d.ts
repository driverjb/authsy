import Vault from './Vault.class';
export declare class SQLiteVault extends Vault {
    private _database;
    private _statements;
    /**
     * @class
     * @constructor
     * @param filePath The path where the JSON vault file will be stored
     * @param iterations The number of iterations to be used during hash creation
     */
    constructor(filePath: string, iterations: number);
    private userExists;
    authenticate(id: number, password: string): Promise<boolean>;
    create(password: string): Promise<number>;
    update(id: number, password: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
export default SQLiteVault;
