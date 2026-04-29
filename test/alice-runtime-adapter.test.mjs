import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const TEMP_HOME = join(tmpdir(), `alice-runtime-adapter-test-${Date.now()}`);
mkdirSync(TEMP_HOME, { recursive: true });

const originalHome = process.env.HOME;
process.env.HOME = TEMP_HOME;

const {
  getAliceRuntimeAgentDir,
  getAliceRuntimeWorkspaceDir,
  isAliceRuntimeInstalled,
  toAliceRuntimeDefinition,
} = await import('../lib/alice-runtime-adapter.mjs');

process.env.HOME = originalHome;

after(() => {
  rmSync(TEMP_HOME, { recursive: true, force: true });
});

const agent = {
  id: 'olivia',
  name: 'A.L.I.C.E.',
  domain: 'Orchestration',
  description: 'Routes tasks',
  tier: 'starter',
  isOrchestrator: true,
  sandbox: { mode: 'strict' },
  tools: { profile: 'full', alsoAllow: ['sessions_spawn'] },
  extraConfig: {
    groupChat: { mentionPatterns: ['@alice'] },
    subagents: { allowAgents: ['dylan'] },
  },
};

describe('alice-runtime adapter', () => {
  test('resolves canonical ~/.alice agent paths', () => {
    assert.equal(getAliceRuntimeAgentDir('olivia'), join(TEMP_HOME, '.alice', 'agents', 'olivia'));
    assert.equal(
      getAliceRuntimeWorkspaceDir('olivia'),
      join(TEMP_HOME, '.alice', 'agents', 'olivia', 'workspace')
    );
  });

  test('maps alice-agents registry rows into alice-runtime AgentDefinition shape', () => {
    const definition = toAliceRuntimeDefinition(agent);
    assert.equal(definition.id, 'olivia');
    assert.equal(definition.workspacePath, getAliceRuntimeWorkspaceDir('olivia'));
    assert.equal(definition.personaFiles.playbook, 'PLAYBOOK.md');
    assert.deepEqual(definition.groupChat, { mentionPatterns: ['@alice'] });
    assert.deepEqual(definition.subagents, { allowAgents: ['dylan'] });
  });

  test('detects alice-runtime from command availability', () => {
    assert.equal(isAliceRuntimeInstalled({ commandExists: (cmd) => cmd === 'alice-runtime' }), true);
    assert.equal(isAliceRuntimeInstalled({ commandExists: () => false }), false);
  });
});
