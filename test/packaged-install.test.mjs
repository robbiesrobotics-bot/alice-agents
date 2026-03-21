import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = '/Users/aliceclaw/.openclaw/workspace-olivia/alice-agents';
const TEMP_ROOT = join(tmpdir(), `alice-packaged-test-${Date.now()}`);
const PACK_DIR = join(TEMP_ROOT, 'pack');
const STARTER_HOME = join(TEMP_ROOT, 'starter-home');
const PRO_HOME = join(TEMP_ROOT, 'pro-home');
const BIN_DIR = join(TEMP_ROOT, 'bin');

mkdirSync(PACK_DIR, { recursive: true });
mkdirSync(BIN_DIR, { recursive: true });

const packJson = JSON.parse(execFileSync('npm', ['pack', ROOT, '--json', '--silent'], {
  cwd: PACK_DIR,
  encoding: 'utf8',
}))[0];
const tarballPath = join(PACK_DIR, packJson.filename);
execFileSync('tar', ['-xzf', tarballPath], { cwd: PACK_DIR });

const PACKAGE_ROOT = join(PACK_DIR, 'package');
const CLI_PATH = join(PACKAGE_ROOT, 'bin', 'alice-install.mjs');
const OPENCLAW_STUB = join(BIN_DIR, 'openclaw');
const NPM_STUB = join(BIN_DIR, 'npm');

writeFileSync(
  OPENCLAW_STUB,
  '#!/bin/sh\nif [ "$1" = "--version" ]; then\n  echo "OpenClaw 2026.3.13"\n  exit 0\nfi\necho "openclaw stub"\n',
  { mode: 0o755 }
);
writeFileSync(
  NPM_STUB,
  '#!/bin/sh\nexit 1\n',
  { mode: 0o755 }
);

function writeBaseConfig(homeDir, primaryModel = 'openai/gpt-5.4') {
  const openclawDir = join(homeDir, '.openclaw');
  mkdirSync(openclawDir, { recursive: true });
  writeFileSync(join(openclawDir, 'openclaw.json'), JSON.stringify({
    agents: {
      defaults: {
        model: { primary: primaryModel },
      },
      list: [],
    },
    tools: {
      agentToAgent: {
        enabled: true,
        allow: ['custom-agent'],
      },
    },
  }, null, 2));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function runCli(args, homeDir) {
  return execFileSync(process.execPath, [CLI_PATH, ...args], {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: homeDir,
      PATH: `${BIN_DIR}:/usr/bin:/bin`,
    },
  });
}

after(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe('packaged installer flows', () => {
  test('tarball ships starter, pro, and full agent registries', () => {
    assert.equal(existsSync(join(PACKAGE_ROOT, 'templates', 'agents-starter.json')), true);
    assert.equal(existsSync(join(PACKAGE_ROOT, 'templates', 'agents-pro.json')), true);
    assert.equal(existsSync(join(PACKAGE_ROOT, 'templates', 'agents.json')), false);
  });

  test('fresh starter install works from the packed artifact', () => {
    writeBaseConfig(STARTER_HOME, 'openai/gpt-5.4');
    runCli(['--yes', '--no-cloud', '--coding-tool', 'codex'], STARTER_HOME);

    const manifest = readJson(join(STARTER_HOME, '.openclaw', '.alice-manifest.json'));
    const config = readJson(join(STARTER_HOME, '.openclaw', 'openclaw.json'));
    const codingSkill = readFileSync(join(STARTER_HOME, '.openclaw', 'skills', 'coding-agent', 'SKILL.md'), 'utf8');

    assert.equal(manifest.tier, 'starter');
    assert.equal(manifest.agents.length, 10);
    assert.match(codingSkill, /Preferred tool: \*\*Codex\*\*/);
    assert.ok(config.tools.agentToAgent.allow.includes('custom-agent'));
  });

  test('upgrade flow rewrites the coding-agent preference', () => {
    runCli(['--update', '--no-cloud', '--coding-tool', 'claude'], STARTER_HOME);
    const codingSkill = readFileSync(join(STARTER_HOME, '.openclaw', 'skills', 'coding-agent', 'SKILL.md'), 'utf8');
    assert.match(codingSkill, /Preferred tool: \*\*Claude Code\*\*/);
  });

  test('fresh Pro install works from the packed artifact when a valid license is already stored', () => {
    writeBaseConfig(PRO_HOME, 'anthropic/claude-sonnet-4-6');
    mkdirSync(join(PRO_HOME, '.alice'), { recursive: true });
    writeFileSync(join(PRO_HOME, '.alice', 'license'), JSON.stringify({
      key: 'ALICE-PRO1-2345-ABCD',
      plan: 'pro',
      status: 'validated',
      validatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'test',
    }, null, 2));

    runCli(['--yes', '--tier', 'pro', '--no-cloud'], PRO_HOME);

    const manifest = readJson(join(PRO_HOME, '.openclaw', '.alice-manifest.json'));
    const config = readJson(join(PRO_HOME, '.openclaw', 'openclaw.json'));

    assert.equal(manifest.tier, 'pro');
    assert.equal(manifest.agents.length, 28);
    assert.equal(config.agents.list.length, 28);
  });

  test('doctor reports healthy on a packaged starter install', () => {
    const output = runCli(['--doctor'], STARTER_HOME);
    assert.match(output, /A\.L\.I\.C\.E\. is healthy!/);
  });
});
