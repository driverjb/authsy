import { expect } from 'chai';
import 'mocha';
import { PostgreSQLVault } from '../src/index';
import common from './common.module';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import Joi from 'joi';

const validConfig = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().default(5432),
  user: Joi.string().required(),
  password: Joi.string().required(),
  database: Joi.string().required()
});

export default function () {
  let pgConfigPath = path.resolve('pgtest.json');
  if (!fs.existsSync(pgConfigPath))
    return console.log(`Configuration file ${pgConfigPath} is required for PostgreSQLVault tests.`);
  const config: pg.PoolConfig = JSON.parse(fs.readFileSync(path.resolve('pgtest.json')).toString());
  let { error } = validConfig.validate(config);
  if (error)
    console.log(
      `Cannot run PostgreSQL tests. Invalid pg configuration in file: ${pgConfigPath}. ${error.message}`
    );
  else {
    describe('PostgreSQLVault', () => {
      let pool = new pg.Pool(config);
      let iterations = 5;
      let schemaName = 'testauth';
      let tableName = 'authsy';
      let v: PostgreSQLVault = new PostgreSQLVault({ pool, iterations, schemaName, tableName });
      after(async function () {
        await pool.query(`drop table ${schemaName}.${tableName}`);
        await pool.query(`drop schema ${schemaName}`);
        await pool.end();
      });
      it('Should report its type as pgsql', async function () {
        expect(v.type).to.equal('pgsql');
      });
      it('Should create new entries', async function () {
        let newId = await v.create(common.passwords.test);
        let anotherId = await v.create(common.passwords.test2);
        expect(newId).to.equal(1);
        expect(anotherId).to.equal(2);
      });
      it('Should authenticate the new entry', async function () {
        let authSuccess = await v.authenticate(1, common.passwords.test);
        let authFail = await v.authenticate(1, common.passwords.test + 'FAIL');
        let authFail2 = await v.authenticate(10, common.passwords.test);
        expect(authSuccess).to.be.true;
        expect(authFail).to.be.false;
        expect(authFail2).to.be.false;
      });
      it('Should update the password and allow authentication', async function () {
        let updateSuccess = await v.update(1, common.passwords.test2);
        let authSuccess = await v.authenticate(1, common.passwords.test2);
        let authFail = await v.authenticate(1, common.passwords.test2 + 'FAIL');
        expect(updateSuccess).to.be.true;
        expect(authSuccess).to.be.true;
        expect(authFail).to.be.false;
      });
      it('Should throw an error when updating a user who does not exist', async function () {
        expect(async () => await v.update(10, common.passwords.test2)).to.throw;
      });
      it('Should delete an existing user', async function () {
        let deleteSuccess = await v.delete(1);
        expect(deleteSuccess).to.be.true;
      });
      it('Should throw an error when deleting a user who does not exist', async function () {
        expect(async () => await v.delete(10)).to.throw;
      });
    });
  }
}
