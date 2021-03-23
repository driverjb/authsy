import { HashResult } from './../interfaces/HashResult.interface';
import { expect } from 'chai';
import Vault from './Vault.class';
import validators from '../util/validators.module';
import sqlite from 'better-sqlite3';
import errorsModule from '../util/errors.module';
import { VaultEntry } from '../interfaces/VaultEntry.interface';
import validatorsModule from '../util/validators.module';

const sql = {
  createTable: `create table if not exists authsy (id integer primary key autoincrement, passwordHash text, salt text)`,
  createEntry: `insert into authsy (passwordHash, salt) values (@passwordHash, @salt)`,
  getEntry: 'select * from authsy where id = @id',
  updateEntry: `update authsy set passwordHash = @passwordHash, salt = @salt where id = @id`,
  userExists: `select 1 from authsy where id = @id limit 1`,
  deleteEntry: `delete from authsy where id = @id`
};

export class SQLiteVault extends Vault {
  private _database: sqlite.Database;
  private _statements: { [key: string]: sqlite.Statement };
  /**
   * @class
   * @constructor
   * @param filePath The path where the JSON vault file will be stored
   * @param iterations The number of iterations to be used during hash creation
   */
  constructor(filePath: string, iterations: number) {
    super('sqlite', iterations);
    this._database = sqlite(filePath);
    this._database.prepare(sql.createTable).run();
    this._statements = {
      createEntry: this._database.prepare(sql.createEntry),
      deleteEntry: this._database.prepare(sql.deleteEntry),
      getEntry: this._database.prepare(sql.getEntry),
      updateEntry: this._database.prepare(sql.updateEntry),
      userExists: this._database.prepare(sql.userExists)
    };
  }
  private userExists(id: number): boolean {
    return !!this._statements['userExists'].get({ id });
  }
  public async authenticate(id: number, password: string): Promise<boolean> {
    let entry: VaultEntry = this._statements['getEntry'].get({ id });
    let { error } = validatorsModule.vaultEntry.validate(entry);
    if (error) throw error;
    if (entry) {
      let testHash = await this.createPasswordHash(password, entry.salt);
      return testHash.passwordHash === entry.passwordHash;
    } else return false;
  }
  public async create(password: string): Promise<number> {
    let hash: HashResult = await this.createPasswordHash(password);
    let id = this._statements['createEntry'].run(hash).lastInsertRowid as number;
    return id;
  }
  public async update(id: number, password: string): Promise<boolean> {
    if (this.userExists(id)) {
      let newHash = await this.createPasswordHash(password);
      return this._statements['updateEntry'].run({ id, ...newHash }).changes > 0;
    } else throw errorsModule.cannotUpdate;
  }
  public async delete(id: number): Promise<boolean> {
    if (this.userExists(id)) {
      return this._statements['deleteEntry'].run({ id }).changes > 0;
    } else throw errorsModule.cannotDelete;
  }
}

export default SQLiteVault;
