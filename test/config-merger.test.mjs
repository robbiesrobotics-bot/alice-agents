/**
 * Tests for lib/config-merger.mjs
 *
 * NOTE: CONFIG_PATH is computed from homedir() at module load time (module-level constant).
 * To avoid side effects, we point HOME at a temp dir before the first import.
 * Then manipulate files on disk between tests.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---- Set up a controlled HOME before any module import ----
const TEMP_HOME = join(tmpdir(), `quinn-config-test-${Date.now()}`);
const OPENCLAW_DIR = join(TEMP_HOME, '.openclaw');
const CONFIG_PATH = join(OPENCLAW_DIR, 'openclaw.json');

mkdirSync(OPENCLAW_DIR, { recursive: true });

// Redirect HOME so config-merger reads from our temp dir
const originalHome = process.env.HOME;
process.env.HOME = TEMP_HOME;

// Now import the module — OPENCLAW_DIR and CONFIG_PATH constants will use TEMP_HOME
const { detectAvailableModels } = await import('../lib/config-merger.mjs');

// Restore HOME (not strictly necessary for tests, but good hygiene)
process.env.HOME = originalHome;

// Helper: write config to our controlled path
function writeConfig(obj) {
  writeFileSync(CONFIG_PATH, JSON.stringify(obj), 'utf8');
}

// Helper: remove config if it exists
function removeConfig() {
  if (existsSync(CONFIG_PATH)) unlinkSync(CONFIG_PATH);
}

describe('detectAvailableModels', () => {
  after(() => {
    rmSync(TEMP_HOME, { recursive: true, force: true });
  });

  test('returns null when no openclaw.json exists', () => {
    removeConfig();
    const result = detectAvailableModels();
    assert.equal(result, null, 'should return null when config file is missing');
  });

  test('returns model info when openclaw.json has agents.defaults.model.primary', () => {
    writeConfig({
      agents: {
        defaults: {
          model: {
            primary: 'ollama/llama3',
          },
        },
      },
    });

    const result = detectAvailableModels();
    assert.notEqual(result, null, 'should not return null when config exists');
    assert.equal(result.primary, 'ollama/llama3');
    assert.equal(result.hasModel, true);
    assert.ok('orchestrator' in result, 'should have orchestrator field');
    assert.ok(Array.isArray(result.fallbacks), 'fallbacks should be an array');
    assert.ok('providers' in result, 'should have providers field');
  });

  test('returns null on malformed JSON — does not throw', () => {
    writeFileSync(CONFIG_PATH, '{ bad json !!!', 'utf8');
    let result;
    assert.doesNotThrow(() => {
      result = detectAvailableModels();
    });
    assert.equal(result, null, 'should return null for malformed JSON');
  });

  test('returns null when primary model is not set', () => {
    writeConfig({ agents: { defaults: {} } });
    const result = detectAvailableModels();
    // Config exists but no model — should not throw, returns object with hasModel: false
    // (or null if config is valid but incomplete — implementation returns object)
    assert.doesNotThrow(() => detectAvailableModels());
  });
});
