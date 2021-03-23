import { expect } from 'chai';
import 'mocha';
import { SQLiteVault } from '../src/index';
import path from 'path';
import fs from 'fs';
import common from './common.module';

export default function () {
  const filePath = path.resolve('test1.db');
  const badPath = path.join('this', 'is', 'not', 'a', 'real', 'path');
  let v = new SQLiteVault(filePath, 5);
  describe('SQLiteVault', () => {
    after(function () {
      fs.unlinkSync(filePath);
    });
    it('Should report its type as sqlite', async function () {
      expect(v.type).to.equal('sqlite');
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
      expect(authSuccess).to.be.true;
      expect(authFail).to.be.false;
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
      expect(async () => await v.delete(2)).to.throw;
    });
    it('Should fail to save to a bad path', async function () {
      expect(() => new SQLiteVault(badPath, 10)).to.throw;
    });
  });
}
