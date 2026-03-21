import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const TEMP_HOME = join(tmpdir(), `alice-license-test-${Date.now()}`);
mkdirSync(join(TEMP_HOME, '.alice'), { recursive: true });

const originalHome = process.env.HOME;
const originalFetch = global.fetch;
process.env.HOME = TEMP_HOME;

const {
  checkProLicense,
  isValidFormat,
  readStoredLicense,
  storeLicense,
  validateLicenseRemote,
} = await import('../lib/license.mjs');

after(() => {
  process.env.HOME = originalHome;
  global.fetch = originalFetch;
  rmSync(TEMP_HOME, { recursive: true, force: true });
});

describe('license handling', () => {
  test('accepts valid key format', () => {
    assert.equal(isValidFormat('ALICE-ABCD-1234-WXYZ'), true);
  });

  test('stores validated licenses as structured records', () => {
    const record = storeLicense('ALICE-ABCD-1234-WXYZ', { status: 'validated', plan: 'pro', source: 'remote' });
    assert.equal(record.status, 'validated');
    assert.equal(readStoredLicense().key, 'ALICE-ABCD-1234-WXYZ');
  });

  test('grace licenses remain active until expiration', async () => {
    storeLicense('ALICE-GRCE-1234-WXYZ', {
      status: 'grace',
      plan: 'pro',
      graceUntil: '2099-01-01T00:00:00.000Z',
      source: 'grace',
    });

    const result = await checkProLicense();
    assert.equal(result.licensed, true);
    assert.equal(result.provisional, true);
  });

  test('network failures are not treated as permanent validation success', async () => {
    global.fetch = async () => {
      throw new Error('offline');
    };

    const result = await validateLicenseRemote('ALICE-OFFL-1234-WXYZ');
    assert.equal(result.valid, false);
    assert.equal(result.graceEligible, true);
    assert.equal(result.transient, true);
  });

  test('revalidation updates a stored license when the service responds', async () => {
    storeLicense('ALICE-REVA-1234-WXYZ', {
      status: 'validated',
      plan: 'pro',
      validatedAt: '2000-01-01T00:00:00.000Z',
      source: 'remote',
    });
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ valid: true, plan: 'pro' }),
    });

    const result = await checkProLicense({ revalidate: true });
    assert.equal(result.licensed, true);
    assert.equal(result.source, 'revalidated');
  });
});
