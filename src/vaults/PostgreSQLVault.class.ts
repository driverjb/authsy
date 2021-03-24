import { expect } from 'chai';
import Vault from './Vault.class';
import { Pool } from 'pg';
import commonErrors from '../util/errors.module';

interface PostgreSQLVaultOptions {
  pool: Pool;
  iterations: number;
  schemaName: string;
  tableName: string;
}

const getSqlQueries = (schemaName: string, tableName: string) => {
  return {
    create: {
      schema: `create schema if not exists ${schemaName}`,
      table: `create table if not exists ${schemaName}.${tableName} (id bigserial primary key, "passwordHash" text, salt text)`,
      entry: `insert into ${schemaName}.${tableName} ("passwordHash", salt) values ($1, $2) returning id`
    },
    delete: `delete from ${schemaName}.${tableName} where id=$1`,
    update: `update ${schemaName}.${tableName} set "passwordHash"=$1, salt=$2 where id=$3`,
    authenticate: `select 1 from ${schemaName}.${tableName} where "passwordHash"=$1 and id=$2`,
    userExists: `select salt from ${schemaName}.${tableName} where id=$1`
  };
};

export class PostgreSQLVault extends Vault {
  private _pool: Pool;
  private _queries;
  constructor(opt: PostgreSQLVaultOptions) {
    super('pgsql', opt.iterations);
    this._pool = opt.pool;
    this._queries = getSqlQueries(opt.schemaName, opt.tableName);
    this._pool
      .query(this._queries.create.schema)
      .then(() => this._pool.query(this._queries.create.table));
  }
  public async authenticate(id: number, password: string): Promise<boolean> {
    let result = await this._pool.query(this._queries.userExists, [id]);
    if (result.rows.length !== 1) return false;
    let salt = result.rows[0].salt;
    let testHash = await this.createPasswordHash(password, salt);
    result = await this._pool.query(this._queries.authenticate, [testHash.passwordHash, id]);
    if (result.rows.length !== 1) return false;
    return true;
  }
  public async create(password: string): Promise<number> {
    let result = await this.createPasswordHash(password);
    return this._pool
      .query(this._queries.create.entry, [result.passwordHash, result.salt])
      .then((result) => Number(result.rows[0].id));
  }
  public async update(id: number, password: string): Promise<boolean> {
    let newHash = await this.createPasswordHash(password);
    let result = await this._pool.query(this._queries.update, [
      newHash.passwordHash,
      newHash.salt,
      id
    ]);
    expect(result.rowCount, commonErrors.cannotUpdate.message).to.equal(1);
    return true;
  }
  public async delete(id: number): Promise<boolean> {
    let result = await this._pool.query(this._queries.delete, [id]);
    expect(result.rowCount, commonErrors.cannotDelete.message).to.equal(1);
    return true;
  }
}

export default PostgreSQLVault;
