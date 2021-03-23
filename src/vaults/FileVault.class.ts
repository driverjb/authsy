import { expect } from 'chai';
import Vault from './Vault.class';
import { VaultEntry } from '../interfaces/VaultEntry.interface';
import fs from 'fs';
import path from 'path';
import Joi from 'joi';

const validVaultEntry = Joi.object({
  id: Joi.number().min(1).required(),
  passwordHash: Joi.string().required(),
  salt: Joi.string().required()
});

const validVaultFile = Joi.object().pattern(Joi.number().min(1), validVaultEntry);

export class FileVault extends Vault {
  private _filePath: string;
  private _data: { [key: string]: VaultEntry };
  /**
   * @class
   * @constructor
   * @param filePath The path where the JSON vault file will be stored
   * @param iterations The number of iterations to be used during hash creation
   */
  constructor(filePath: string, iterations: number) {
    super('file', iterations);
    this._filePath = filePath;
    if (fs.existsSync(this._filePath)) this._data = this.loadFile();
    else {
      this._data = {};
      this.saveFile();
    }
  }
  public get nextIndex() {
    let keys = Object.keys(this._data);
    let next = 0;
    if (keys.length === 0) next = 1;
    else next = Number(keys[keys.length - 1]) + 1;
    expect(next).to.be.a('number').greaterThan(0);
    return next;
  }
  private loadFile(): { [key: string]: VaultEntry } {
    let temp = JSON.parse(fs.readFileSync(this._filePath).toString());
    let { value, error } = validVaultFile.validate(temp);
    if (error) throw error;
    return value;
  }
  private saveFile(): boolean {
    let fileName = path.basename(this._filePath);
    let pathName = this._filePath.replace(fileName, '');
    if (!fs.existsSync(pathName))
      throw new Error('Specified file path does not exist. Cannot write file.');
    else fs.writeFileSync(this._filePath, JSON.stringify(this._data));
    return true;
  }
  public async authenticate(id: number, password: string): Promise<boolean> {
    let entry = this._data[id];
    let { error } = validVaultEntry.validate(entry);
    if (error) throw error;
    let testEntry = await this.createPasswordHash(entry.id, password, entry.salt);
    return testEntry.passwordHash === entry.passwordHash;
  }
  public async create(password: string): Promise<number> {
    let nextIndex = this.nextIndex;
    let newEntry = await this.createPasswordHash(nextIndex, password);
    expect(newEntry.id).to.equal(nextIndex);
    expect(newEntry.passwordHash).to.be.a('string').lengthOf.greaterThan(32);
    expect(newEntry.salt).to.be.a('string').lengthOf.greaterThan(32);
    this._data[nextIndex] = newEntry;
    this.saveFile();
    return nextIndex;
  }
  public async update(id: number, password: string): Promise<boolean> {
    let entry: VaultEntry = this._data[id];
    if (entry) {
      let { error } = validVaultEntry.validate(entry);
      if (error) throw error;
      let newEntry = await this.createPasswordHash(entry.id, password);
      this._data[entry.id] = newEntry;
      this.saveFile();
      return true;
    } else throw new Error(`User id does not exist. Cannot update password hash.`);
  }
  public async delete(id: number): Promise<boolean> {
    if (this._data[id]) {
      delete this._data[id];
      this.saveFile();
      return true;
    } else throw new Error(`User id does not exist. Cannot delete entry.`);
  }
}

export default FileVault;
