import Vault from './Vault.class';
import { Pool } from 'pg';
interface PostgreSQLVaultOptions {
    pool: Pool;
    iterations: number;
    schemaName: string;
    tableName: string;
}
export declare class PostgreSQLVault extends Vault {
    private _pool;
    private _queries;
    constructor(opt: PostgreSQLVaultOptions);
    authenticate(id: number, password: string): Promise<boolean>;
    create(password: string): Promise<number>;
    update(id: number, password: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
export default PostgreSQLVault;
