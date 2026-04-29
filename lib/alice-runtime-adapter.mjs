import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const ALICE_RUNTIME_HOME = join(homedir(), '.alice');

export function getAliceRuntimeAgentDir(agentId) {
  return join(ALICE_RUNTIME_HOME, 'agents', agentId);
}

export function getAliceRuntimeWorkspaceDir(agentId) {
  return join(getAliceRuntimeAgentDir(agentId), 'workspace');
}

export function isAliceRuntimeInstalled({ commandExists = null } = {}) {
  if (commandExists?.('alice-runtime')) return true;
  return existsSync(join(ALICE_RUNTIME_HOME, 'config', 'alice-runtime.json'));
}

export function toAliceRuntimeDefinition(agent) {
  const extra = agent.extraConfig || {};
  return {
    id: agent.id,
    name: agent.name,
    domain: agent.domain,
    description: agent.description,
    tier: agent.tier,
    ...(agent.isOrchestrator ? { isOrchestrator: true } : {}),
    workspacePath: getAliceRuntimeWorkspaceDir(agent.id),
    personaFiles: {
      soul: 'SOUL.md',
      agents: 'AGENTS.md',
      user: 'USER.md',
      playbook: 'PLAYBOOK.md',
      feedback: 'FEEDBACK.md',
      learnings: 'LEARNINGS.md',
    },
    tools: agent.tools || { profile: 'minimal' },
    sandbox: agent.sandbox || { mode: 'strict' },
    ...(extra.subagents ? { subagents: extra.subagents } : {}),
    ...(extra.groupChat ? { groupChat: extra.groupChat } : {}),
    ...(agent.model ? { model: agent.model } : {}),
  };
}

export function writeAliceRuntimeDefinition(agent) {
  const definitionPath = join(getAliceRuntimeAgentDir(agent.id), 'definition.json');
  writeFileSync(definitionPath, JSON.stringify(toAliceRuntimeDefinition(agent), null, 2) + '\n', 'utf8');
  return definitionPath;
}
