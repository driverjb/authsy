import { HashResult } from './../interfaces/HashResult.interface';
import { expect } from 'chai';
import Vault from './Vault.class';
import { Database, Statement } from 'better-sqlite3';
import errorsModule from '../util/errors.module';

const sql = {
  createTable: `create table if not exists authsy (id integer primary key autoincrement, passwordHash text, salt text)`,
  createEntry: `insert into authsy (passwordHash, salt) values (@passwordHash, @salt)`,
  getSalt: 'select salt from authsy where id = @id',
  authenticate: 'select 1 from authsy where id = @id and passwordHash = @passwordHash',
  updateEntry: `update authsy set passwordHash = @passwordHash, salt = @salt where id = @id`,
  deleteEntry: `delete from authsy where id = @id`
};

export class SQLiteVault extends Vault {
  private _database: Database;
  private _statements: { [key: string]: Statement };
  /**
   * @class
   * @constructor
   * @param filePath The path where the JSON vault file will be stored
   * @param iterations The number of iterations to be used during hash creation
   */
  constructor(database: Database, iterations: number) {
    super('sqlite', iterations);
    this._database = database;
    this._database.prepare(sql.createTable).run();
    this._statements = {
      createEntry: this._database.prepare(sql.createEntry),
      deleteEntry: this._database.prepare(sql.deleteEntry),
      getSalt: this._database.prepare(sql.getSalt),
      updateEntry: this._database.prepare(sql.updateEntry),
      authenticate: this._database.prepare(sql.authenticate)
    };
  }
  public async authenticate(id: number, password: string): Promise<boolean> {
    let salt: string = this._statements['getSalt'].get({ id }).salt;
    let testHash = await this.createPasswordHash(password, salt);
    let result = this._statements['authenticate'].get({ id, passwordHash: testHash.passwordHash });
    return !!result;
  }
  public async create(password: string): Promise<number> {
    let hash: HashResult = await this.createPasswordHash(password);
    let id = this._statements['createEntry'].run(hash).lastInsertRowid as number;
    expect(id, errorsModule.failedCreate).to.be.greaterThan(0);
    return id;
  }
  public async update(id: number, password: string): Promise<boolean> {
    let newHash = await this.createPasswordHash(password);
    let result = this._statements['updateEntry'].run({ id, ...newHash });
    expect(result.changes, errorsModule.cannotUpdate).to.be.greaterThan(0);
    expect(result.changes, errorsModule.multiChangeError(result.changes, 'update')).to.be.equal(1);
    return true;
  }
  public async delete(id: number): Promise<boolean> {
    let result = this._statements['deleteEntry'].run({ id });
    expect(result.changes, errorsModule.cannotDelete).to.be.greaterThan(0);
    expect(result.changes, errorsModule.multiChangeError(result.changes, 'delete')).to.be.equal(1);
    return true;
  }
}

export default SQLiteVault;
