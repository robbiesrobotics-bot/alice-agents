/**
 * Tests for lib/prompter.mjs
 * Tests the pure utility functions (not the interactive prompt functions).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { detectTimezone, detectUserName } from '../lib/prompter.mjs';

describe('detectTimezone', () => {
  test('returns a non-empty string', () => {
    const tz = detectTimezone();
    assert.equal(typeof tz, 'string', 'timezone should be a string');
    assert.ok(tz.length > 0, 'timezone should not be empty');
  });

  test('returns a valid IANA timezone or UTC fallback', () => {
    const tz = detectTimezone();
    // Should contain either a "/" (e.g. America/New_York) or be "UTC"
    assert.ok(
      tz.includes('/') || tz === 'UTC',
      `expected IANA timezone or UTC, got: ${tz}`
    );
  });
});

describe('detectUserName', () => {
  test('returns a non-empty string', () => {
    const name = detectUserName();
    assert.equal(typeof name, 'string', 'username should be a string');
    assert.ok(name.length > 0, 'username should not be empty');
  });

  test('returns User as fallback when env vars are cleared', () => {
    const saved = {
      USER: process.env.USER,
      USERNAME: process.env.USERNAME,
      LOGNAME: process.env.LOGNAME,
    };
    delete process.env.USER;
    delete process.env.USERNAME;
    delete process.env.LOGNAME;

    const name = detectUserName();
    assert.equal(name, 'User', 'should fall back to "User" when no env vars set');

    // Restore
    if (saved.USER !== undefined) process.env.USER = saved.USER;
    if (saved.USERNAME !== undefined) process.env.USERNAME = saved.USERNAME;
    if (saved.LOGNAME !== undefined) process.env.LOGNAME = saved.LOGNAME;
  });
});
