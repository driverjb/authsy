import { expect } from 'chai';
import 'mocha';
import { FileVault } from '../src/index';
import path from 'path';
import fs from 'fs';
import common from './common.module';

export default function () {
  const filePath = path.resolve('test1.json');
  const filePath2 = path.resolve('test2.json');
  const badPath = path.join('this', 'is', 'not', 'a', 'real', 'path');
  let v = new FileVault(filePath, 5);
  let v2 = new FileVault(filePath2, 10);
  describe('FileVault', () => {
    before(async function () {
      if (v2.nextIndex === 1) {
        await v2.create(common.passwords.test);
        await v2.create(common.passwords.test2);
      }
    });
    after(function () {
      fs.unlinkSync(filePath);
    });
    it('Should report its type as file', async function () {
      expect(v.type).to.equal('file');
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
    it('Should load an existing file', async function () {
      expect(await v2.authenticate(1, common.passwords.test)).to.be.true;
      expect(await v2.authenticate(2, common.passwords.test2)).to.be.true;
    });
    it('Should fail to save to a bad path', async function () {
      expect(() => new FileVault(badPath, 10)).to.throw;
    });
  });
}
