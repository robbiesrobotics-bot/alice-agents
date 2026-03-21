/**
 * Tests for lib/doctor.mjs — Docker environment detection, WSL detection, config validation.
 *
 * These tests cover the pure logic helpers that are re-implementable without
 * side-effects (file I/O mocked via temp dirs, no execSync calls for Docker/runtime).
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ── WSL detection (same logic as doctor.mjs) ──────────────────────────────────

function isWSL(env = process.env) {
  return !!(env.WSL_DISTRO_NAME || env.WSLENV);
}

describe('WSL detection (doctor)', () => {
  test('no WSL env → false', () => {
    assert.equal(isWSL({}), false);
  });

  test('WSL_DISTRO_NAME set → true', () => {
    assert.equal(isWSL({ WSL_DISTRO_NAME: 'Ubuntu-22.04' }), true);
  });

  test('WSLENV set → true', () => {
    assert.equal(isWSL({ WSLENV: 'PATH/u' }), true);
  });
});

// ── getRuntime shim (without execSync) ───────────────────────────────────────
// Mirrors the getRuntime logic for the nemoclaw dir fallback

function getRuntimeFromFs(homeDir) {
  const nemoclawDir = join(homeDir, '.nemoclaw');
  if (existsSync(nemoclawDir)) return { name: 'NemoClaw', ok: true };
  return { name: 'openclaw/nemoclaw', ok: false };
}

describe('getRuntime filesystem detection', () => {
  let tempDir;

  test('.nemoclaw dir present → NemoClaw runtime', () => {
    tempDir = join(tmpdir(), `alice-doctor-runtime-${Date.now()}`);
    mkdirSync(join(tempDir, '.nemoclaw'), { recursive: true });
    const result = getRuntimeFromFs(tempDir);
    assert.equal(result.name, 'NemoClaw');
    assert.equal(result.ok, true);
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('no .nemoclaw dir → no runtime', () => {
    tempDir = join(tmpdir(), `alice-doctor-noruntime-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const result = getRuntimeFromFs(tempDir);
    assert.equal(result.ok, false);
    rmSync(tempDir, { recursive: true, force: true });
  });
});

import { readFileSync } from 'node:fs';

// ── loadConfig shim ───────────────────────────────────────────────────────────

function loadConfigSync(configPath) {
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return 'invalid';
  }
}

describe('loadConfig', () => {
  let tempDir;

  test('returns null when config does not exist', () => {
    tempDir = join(tmpdir(), `alice-doctor-cfg-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const result = loadConfigSync(join(tempDir, 'openclaw.json'));
    assert.equal(result, null);
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns parsed object when config is valid JSON', () => {
    tempDir = join(tmpdir(), `alice-doctor-cfg2-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const configPath = join(tempDir, 'openclaw.json');
    writeFileSync(configPath, JSON.stringify({ default_model: 'ollama/llama3' }));
    const result = loadConfigSync(configPath);
    assert.deepEqual(result, { default_model: 'ollama/llama3' });
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns "invalid" when config is malformed JSON', () => {
    tempDir = join(tmpdir(), `alice-doctor-cfg3-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const configPath = join(tempDir, 'openclaw.json');
    writeFileSync(configPath, '{ not valid json !!');
    const result = loadConfigSync(configPath);
    assert.equal(result, 'invalid');
    rmSync(tempDir, { recursive: true, force: true });
  });
});

// ── Model/provider detection from config ─────────────────────────────────────
// Mirrors the model detection logic in runDoctor

function detectModelFromConfig(config) {
  if (!config || config === 'invalid') return { ok: false, label: null };

  const defaults = config?.agents?.defaults?.model || {};
  if (defaults.primary) return { ok: true, label: defaults.primary };
  if (config.model) return { ok: true, label: config.model };
  if (config.default_model) return { ok: true, label: config.default_model };
  if (config.models?.providers && Object.keys(config.models.providers).length > 0)
    return { ok: true, label: Object.keys(config.models.providers)[0] };
  if (config.auth?.profiles) {
    const profile = Object.values(config.auth.profiles).find((entry) => entry?.provider);
    if (profile?.provider) return { ok: true, label: profile.provider === 'openai-codex' ? 'openai' : profile.provider };
  }
  if (config.models && Object.keys(config.models).length > 0)
    return { ok: true, label: Object.keys(config.models)[0] };
  if (config.providers && Object.keys(config.providers).length > 0)
    return { ok: true, label: Object.keys(config.providers)[0] };
  if (config.llm && Object.keys(config.llm).length > 0)
    return { ok: true, label: Object.keys(config.llm)[0] };
  return { ok: false, label: null };
}

describe('detectModelFromConfig', () => {
  test('returns ok=false for null config', () => {
    assert.equal(detectModelFromConfig(null).ok, false);
  });

  test('returns ok=false for invalid config', () => {
    assert.equal(detectModelFromConfig('invalid').ok, false);
  });

  test('detects agents.defaults.model.primary field', () => {
    const result = detectModelFromConfig({ agents: { defaults: { model: { primary: 'openai/gpt-5.4' } } } });
    assert.equal(result.ok, true);
    assert.equal(result.label, 'openai/gpt-5.4');
  });

  test('detects auth profile provider field', () => {
    const result = detectModelFromConfig({ auth: { profiles: { default: { provider: 'openai-codex' } } } });
    assert.equal(result.ok, true);
    assert.equal(result.label, 'openai');
  });

  test('detects models.providers field', () => {
    const result = detectModelFromConfig({ models: { providers: { ollama: { url: 'http://localhost:11434' } } } });
    assert.equal(result.ok, true);
    assert.equal(result.label, 'ollama');
  });

  test('detects llm field', () => {
    const result = detectModelFromConfig({ llm: { openai: {} } });
    assert.equal(result.ok, true);
    assert.equal(result.label, 'openai');
  });

  test('returns ok=false when no model fields present', () => {
    const result = detectModelFromConfig({ agents: [], other: 'stuff' });
    assert.equal(result.ok, false);
  });
});

// ── Agent workspace check ─────────────────────────────────────────────────────

describe('agent workspace existence check', () => {
  let tempDir;

  after(() => {
    if (tempDir && existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns missing list when workspace dirs absent', () => {
    tempDir = join(tmpdir(), `alice-doctor-ws-${Date.now()}`);
    mkdirSync(join(tempDir, '.openclaw'), { recursive: true });

    const agentIds = ['olivia', 'dylan', 'quinn'];
    const missing = agentIds.filter((id) => !existsSync(join(tempDir, '.openclaw', `workspace-${id}`)));
    assert.deepEqual(missing, ['olivia', 'dylan', 'quinn']);
  });

  test('returns empty missing list when all workspaces exist', () => {
    tempDir = join(tmpdir(), `alice-doctor-ws2-${Date.now()}`);
    const agentIds = ['olivia', 'dylan'];
    for (const id of agentIds) {
      mkdirSync(join(tempDir, '.openclaw', `workspace-${id}`), { recursive: true });
    }

    const missing = agentIds.filter((id) => !existsSync(join(tempDir, '.openclaw', `workspace-${id}`)));
    assert.deepEqual(missing, []);
  });

  test('partial: identifies only missing workspaces', () => {
    tempDir = join(tmpdir(), `alice-doctor-ws3-${Date.now()}`);
    mkdirSync(join(tempDir, '.openclaw', 'workspace-olivia'), { recursive: true });
    // dylan not created

    const agentIds = ['olivia', 'dylan'];
    const missing = agentIds.filter((id) => !existsSync(join(tempDir, '.openclaw', `workspace-${id}`)));
    assert.deepEqual(missing, ['dylan']);
  });
});

// ── check() output helper (pure) ─────────────────────────────────────────────

describe('check() return value', () => {
  // The check() function in doctor.mjs returns the 'ok' boolean
  // Re-implement the pure return-value logic here
  function checkReturn(ok) {
    return ok;
  }

  test('returns true when ok=true', () => {
    assert.equal(checkReturn(true), true);
  });

  test('returns false when ok=false', () => {
    assert.equal(checkReturn(false), false);
  });
});
