import { pbkdf2, createHash } from 'crypto';
import { VaultEntry } from '../interfaces/VaultEntry.interface';

export abstract class Vault {
  private _type: string;
  private _iterations: number;
  constructor(type: string, iterations: number) {
    this._type = type;
    this._iterations = iterations;
  }
  /** The type of the vault */
  public get type() {
    return this._type;
  }
  /** The number of iterations being performed during hash creation */
  public get iterations() {
    return this._iterations;
  }
  /**
   * Asynchronusly create a vault entry record to be stored in a vault
   * @param id The numerical id for the new user
   * @param password The password to be hashed
   * @returns A vault entry
   */
  protected createPasswordHash(id: number, password: string, salt?: string): Promise<VaultEntry> {
    let randomNumberString = Math.floor(Math.random() * 1000000000000000000).toString();
    let theSalt = salt ?? createHash('sha512').update(randomNumberString).digest('hex');
    return new Promise((resolve, reject) => {
      pbkdf2(password, theSalt, this.iterations, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        else {
          let entry: VaultEntry = { id, passwordHash: key.toString('hex'), salt: theSalt };
          resolve(entry);
        }
      });
    });
  }
  /**
   * Authenticate a user
   * @param id The numerical identifier for the given user being authenticated
   * @param password The password attempt for authentication
   * @returns True if successfully authenticated
   */
  public abstract authenticate(id: number, password: string): Promise<boolean>;
  /**
   * Create a new user entry
   * @param password The password to be created for the user
   * @returns The numerical identifier for the newly created user entry
   */
  public abstract create(password: string): Promise<number>;
  /**
   * Update a user entry's password
   * @param id The numerical identifier for the user being updated
   * @param password The new password to be changed
   * @returns True when successfully updated
   */
  public abstract update(id: number, password: string): Promise<boolean>;
  /**
   * Delete a user
   * @param id Numerical identifier for the user to be deleted
   * @returns True when successfully deleted
   */
  public abstract delete(id: number): Promise<boolean>;
}

export default Vault;
