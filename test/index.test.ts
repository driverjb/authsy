import { expect } from 'chai';
import 'mocha';
import FileVaultTests from './FileVault.test';
import SQLiteVaultTests from './SQLiteVault.test';

describe('Vault Tests', () => {
  FileVaultTests();
  SQLiteVaultTests();
});
