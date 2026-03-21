import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const TEMP_HOME = join(tmpdir(), `alice-manifest-test-${Date.now()}`);
mkdirSync(join(TEMP_HOME, '.openclaw'), { recursive: true });

const originalHome = process.env.HOME;
process.env.HOME = TEMP_HOME;

const { readManifest, writeManifest } = await import('../lib/manifest.mjs');

after(() => {
  process.env.HOME = originalHome;
  rmSync(TEMP_HOME, { recursive: true, force: true });
});

describe('manifest persistence', () => {
  test('preserves skills and writes package metadata', () => {
    const first = writeManifest({
      tier: 'starter',
      agents: ['olivia'],
      userName: 'Alice',
      userTimezone: 'America/New_York',
      modelPreset: 'detected',
      skills: ['coding-agent'],
      codingTool: 'codex',
      codingSkill: 'coding-agent',
    });
    const second = writeManifest({
      tier: 'starter',
      agents: ['olivia', 'dylan'],
    });

    assert.ok(first.version, 'manifest should include the package version');
    assert.equal(first.schemaVersion, 2);
    assert.equal(first.packageVersion, first.version);
    assert.deepEqual(second.skills, ['coding-agent']);
    assert.equal(second.codingTool, 'codex');
    assert.equal(readManifest().agents.length, 2);
  });
});
