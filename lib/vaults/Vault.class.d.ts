import { HashResult } from '../interfaces/HashResult.interface';
export declare abstract class Vault {
    private _type;
    private _iterations;
    constructor(type: string, iterations: number);
    /** The type of the vault */
    get type(): string;
    /** The number of iterations being performed during hash creation */
    get iterations(): number;
    /**
     * Asynchronusly create a vault entry record to be stored in a vault
     * @param id The numerical id for the new user
     * @param password The password to be hashed
     * @returns A vault entry
     */
    protected createPasswordHash(password: string, salt?: string): Promise<HashResult>;
    /**
     * Authenticate a user
     * @param id The numerical identifier for the given user being authenticated
     * @param password The password attempt for authentication
     * @returns True if successfully authenticated
     */
    abstract authenticate(id: number, password: string): Promise<boolean>;
    /**
     * Create a new user entry
     * @param password The password to be created for the user
     * @returns The numerical identifier for the newly created user entry
     */
    abstract create(password: string): Promise<number>;
    /**
     * Update a user entry's password
     * @param id The numerical identifier for the user being updated
     * @param password The new password to be changed
     * @returns True when successfully updated
     */
    abstract update(id: number, password: string): Promise<boolean>;
    /**
     * Delete a user
     * @param id Numerical identifier for the user to be deleted
     * @returns True when successfully deleted
     */
    abstract delete(id: number): Promise<boolean>;
}
export default Vault;
