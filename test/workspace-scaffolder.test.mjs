/**
 * Tests for lib/workspace-scaffolder.mjs
 *
 * OPENCLAW_DIR is a module-level constant computed from homedir() at import time.
 * We point HOME at a temp dir before importing so scaffoldWorkspace writes there.
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---- Set up a controlled HOME before importing the module ----
const TEMP_HOME = join(tmpdir(), `quinn-scaffold-test-${Date.now()}`);
const TEMP_OPENCLAW = join(TEMP_HOME, '.openclaw');
mkdirSync(TEMP_OPENCLAW, { recursive: true });

const originalHome = process.env.HOME;
process.env.HOME = TEMP_HOME;

const { scaffoldWorkspace, scaffoldSkills } = await import('../lib/workspace-scaffolder.mjs');

process.env.HOME = originalHome;

after(() => {
  rmSync(TEMP_HOME, { recursive: true, force: true });
});

// ---- Mock agent matching agents-starter.json shape ----
const mockAgent = {
  id: 'test-agent',
  name: 'TestAgent',
  domain: 'Testing',
  theme: 'test specialist',
  emoji: '✅',
  description: 'Writes and runs tests',
  tier: 'starter',
  coding: true,
  isOrchestrator: false,
  sandbox: { mode: 'off' },
  tools: { profile: 'coding' },
};

const mockUserInfo = {
  name: 'Alice',
  timezone: 'America/New_York',
  notes: '',
};

describe('scaffoldWorkspace', () => {
  let workspaceDir;

  test('creates the workspace directory', () => {
    const result = scaffoldWorkspace(mockAgent, mockUserInfo, 1);
    workspaceDir = result.workspaceDir;

    assert.ok(existsSync(workspaceDir), `workspace dir should exist at ${workspaceDir}`);
  });

  test('creates the memory subdirectory', () => {
    if (!workspaceDir) {
      const result = scaffoldWorkspace(mockAgent, mockUserInfo, 1);
      workspaceDir = result.workspaceDir;
    }
    const memoryDir = join(workspaceDir, 'memory');
    assert.ok(existsSync(memoryDir), 'memory/ subdirectory should be created');
  });

  test('writes SOUL.md, AGENTS.md, IDENTITY.md, TOOLS.md (product files)', () => {
    const result = scaffoldWorkspace(mockAgent, mockUserInfo, 1);
    workspaceDir = result.workspaceDir;

    for (const filename of ['SOUL.md', 'AGENTS.md', 'IDENTITY.md', 'TOOLS.md']) {
      assert.ok(
        existsSync(join(workspaceDir, filename)),
        `${filename} should exist in workspace`
      );
    }
  });

  test('returns written array containing product file names', () => {
    const result = scaffoldWorkspace(mockAgent, mockUserInfo, 1);
    assert.ok(Array.isArray(result.written), 'result.written should be an array');
    for (const filename of ['SOUL.md', 'AGENTS.md', 'IDENTITY.md', 'TOOLS.md']) {
      assert.ok(
        result.written.includes(filename),
        `written array should include ${filename}`
      );
    }
  });

  test('returns workspaceDir pointing inside our temp .openclaw dir', () => {
    const result = scaffoldWorkspace(mockAgent, mockUserInfo, 1);
    assert.ok(
      result.workspaceDir.startsWith(TEMP_OPENCLAW),
      `workspaceDir ${result.workspaceDir} should be inside ${TEMP_OPENCLAW}`
    );
  });

  test('does not throw on second invocation (idempotent for product files)', () => {
    assert.doesNotThrow(() => {
      scaffoldWorkspace(mockAgent, mockUserInfo, 1);
      scaffoldWorkspace(mockAgent, mockUserInfo, 1);
    });
  });
});

describe('scaffoldSkills', () => {
  test('writes a provider-aware coding-agent skill', () => {
    const preference = scaffoldSkills({
      skillId: 'coding-agent',
      skillPath: '~/.openclaw/skills/coding-agent/SKILL.md',
      preferredTool: 'codex',
      fallbackTool: 'claude',
      preferred: {
        id: 'codex',
        name: 'Codex',
        cli: 'codex',
        skillHeading: 'Codex',
        primaryExample: `codex exec --full-auto -C /path/to/project 'Task'`,
        reviewExample: `codex review --base main 'Review'`,
      },
      fallback: {
        id: 'claude',
        name: 'Claude Code',
        cli: 'claude',
        skillHeading: 'Claude Code',
        primaryExample: `claude --permission-mode bypassPermissions --print 'Task'`,
        reviewExample: `claude --permission-mode bypassPermissions --print 'Review'`,
      },
      available: { codex: true, claude: false },
      selectionReason: 'detected openai as the default OpenClaw provider',
      provider: 'openai',
      override: 'auto',
    });

    const skillPath = join(TEMP_OPENCLAW, 'skills', 'coding-agent', 'SKILL.md');
    assert.equal(preference.preferred.name, 'Codex');
    assert.ok(existsSync(skillPath), 'coding-agent skill should be written');
  });
});
