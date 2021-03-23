import Vault from './Vault.class';
export declare class FileVault extends Vault {
    private _filePath;
    private _data;
    /**
     * @class
     * @constructor
     * @param filePath The path where the JSON vault file will be stored
     * @param iterations The number of iterations to be used during hash creation
     */
    constructor(filePath: string, iterations: number);
    get nextIndex(): number;
    private loadFile;
    private saveFile;
    authenticate(id: number, password: string): Promise<boolean>;
    create(password: string): Promise<number>;
    update(id: number, password: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
export default FileVault;
