import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes } from 'node:crypto';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const CONFIG_PATH = join(OPENCLAW_DIR, 'openclaw.json');

export function configExists() {
  return existsSync(CONFIG_PATH);
}

export function readConfig() {
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

/**
 * Inspect the existing OpenClaw/NemoClaw config and return what models
 * and providers the user already has set up. This is used to avoid
 * forcing Anthropic/Claude on users who haven't configured those keys.
 *
 * Returns null if config can't be read.
 */
export function detectAvailableModels() {
  if (!configExists()) return null;
  try {
    const config = readConfig();

    // Current agents.defaults.model (set by a prior install or manually)
    const agentDefaults = config?.agents?.defaults?.model || {};

    // Top-level model override (some users set this)
    const globalModel = config?.model;

    // Configured provider keys (e.g. ['anthropic', 'openai', 'ollama'])
    const providers = Object.keys(config?.models?.providers || {});

    const primary = agentDefaults.primary || globalModel || null;
    const orchestrator = agentDefaults.orchestrator || primary;
    const fallbacks = agentDefaults.fallbacks || [];

    return {
      primary,
      orchestrator,
      fallbacks,
      providers,
      hasModel: !!primary,
    };
  } catch {
    return null;
  }
}

function backupConfig() {
  const ts = Date.now();
  const backupPath = join(OPENCLAW_DIR, `openclaw.json.bak.alice-${ts}`);
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  writeFileSync(backupPath, raw, 'utf8');
  return backupPath;
}

function writeConfigAtomic(config) {
  const tmpPath = join(OPENCLAW_DIR, `.openclaw.json.tmp.${randomBytes(4).toString('hex')}`);
  writeFileSync(tmpPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  renameSync(tmpPath, CONFIG_PATH);
}

function getModelConfig(preset, customModels, detectedModels) {
  switch (preset) {
    case 'detected':
      // Use whatever the user already has configured — don't touch model settings at all
      return {
        primary: detectedModels?.primary || null,
        orchestrator: detectedModels?.orchestrator || detectedModels?.primary || null,
        fallbacks: detectedModels?.fallbacks || [],
        models: {},
        preserve: true, // signal: don't overwrite model defaults
      };
    case 'sonnet':
      return {
        primary: 'anthropic/claude-sonnet-4-6',
        orchestrator: 'anthropic/claude-sonnet-4-6',
        fallbacks: ['anthropic/claude-sonnet-4-6', 'anthropic/claude-haiku-4-5'],
        models: {
          'anthropic/claude-sonnet-4-6': {},
          'anthropic/claude-haiku-4-5': {},
        },
      };
    case 'opus-sonnet':
      return {
        primary: 'anthropic/claude-sonnet-4-6',
        orchestrator: 'anthropic/claude-opus-4-6',
        fallbacks: ['anthropic/claude-opus-4-6', 'anthropic/claude-sonnet-4-6', 'anthropic/claude-haiku-4-5'],
        models: {
          'anthropic/claude-opus-4-6': {},
          'anthropic/claude-sonnet-4-6': {},
          'anthropic/claude-haiku-4-5': {},
        },
      };
    case 'openai':
      return {
        primary: 'openai/gpt-5.4-mini',
        orchestrator: 'openai/gpt-5.4',
        fallbacks: ['openai/gpt-5.4', 'openai/gpt-5.4-mini'],
        models: {
          'openai/gpt-5.4': {},
          'openai/gpt-5.4-mini': {},
        },
      };
    case 'local':
      return {
        primary: 'ollama/qwen3.5:27b',
        orchestrator: 'ollama/qwen3.5:27b',
        fallbacks: [],
        models: {},
      };
    case 'custom':
      return {
        primary: customModels?.primary || null,
        orchestrator: customModels?.orchestrator || customModels?.primary || null,
        fallbacks: [],
        models: {},
      };
    default:
      return getModelConfig('sonnet');
  }
}

function buildAgentEntry(agent, modelCfg) {
  const entry = {
    id: agent.id,
    name: agent.name,
    workspace: join(OPENCLAW_DIR, `workspace-${agent.id}`),
    identity: {
      name: agent.name,
      theme: agent.theme,
      emoji: agent.emoji,
    },
    sandbox: agent.sandbox,
    tools: agent.tools,
  };

  // Orchestrator gets special model + extra config
  if (agent.isOrchestrator) {
    entry.default = true;
    entry.model = modelCfg.orchestrator;
    if (agent.extraConfig) {
      Object.assign(entry, agent.extraConfig);
    }
  }

  return entry;
}

export function mergeConfig({ agents, mode, preset, customModels }) {
  const backupPath = backupConfig();
  const config = readConfig();
  const detectedModels = detectAvailableModels();
  const modelCfg = getModelConfig(preset, customModels, detectedModels);

  // Build agent entries
  const aliceEntries = agents.map((a) => buildAgentEntry(a, modelCfg));
  const aliceIds = new Set(agents.map((a) => a.id));

  if (mode === 'fresh') {
    // Replace agents entirely
    config.agents = config.agents || {};
    config.agents.list = aliceEntries;
  } else if (mode === 'merge') {
    // Preserve non-ALICE agents, add/replace ALICE ones
    config.agents = config.agents || {};
    const existing = (config.agents.list || []).filter((a) => !aliceIds.has(a.id));
    config.agents.list = [...aliceEntries, ...existing];
  } else if (mode === 'upgrade') {
    // Only update existing ALICE agents, don't add new ones
    config.agents = config.agents || {};
    const list = config.agents.list || [];
    config.agents.list = list.map((existing) => {
      if (aliceIds.has(existing.id)) {
        const updated = aliceEntries.find((a) => a.id === existing.id);
        return { ...updated, workspace: existing.workspace };
      }
      return existing;
    });
  }

  // Set defaults
  config.agents.defaults = config.agents.defaults || {};

  if (modelCfg.preserve) {
    // User's existing model config is intact — don't overwrite it.
    // Only initialize the key if it doesn't exist at all (safety net).
    config.agents.defaults.model = config.agents.defaults.model || {};
  } else if (modelCfg.primary) {
    config.agents.defaults.model = {
      primary: modelCfg.primary,
      fallbacks: modelCfg.fallbacks,
    };
    if (modelCfg.orchestrator && modelCfg.orchestrator !== modelCfg.primary) {
      config.agents.defaults.model.orchestrator = modelCfg.orchestrator;
    }
    if (Object.keys(modelCfg.models).length > 0) {
      config.agents.defaults.models = modelCfg.models;
    }
  }
  // If modelCfg.primary is null (custom/detected with nothing set), leave existing model config alone
  config.agents.defaults.workspace = join(OPENCLAW_DIR, 'workspace-olivia');
  config.agents.defaults.compaction = config.agents.defaults.compaction || { mode: 'safeguard' };
  config.agents.defaults.maxConcurrent = config.agents.defaults.maxConcurrent || 4;
  config.agents.defaults.subagents = config.agents.defaults.subagents || {
    maxConcurrent: 4,
    archiveAfterMinutes: 120,
    runTimeoutSeconds: 900,
  };

  // Agent-to-agent communication
  config.tools = config.tools || {};
  config.tools.agentToAgent = config.tools.agentToAgent || {};
  config.tools.agentToAgent.enabled = true;
  config.tools.agentToAgent.allow = [...aliceIds];

  writeConfigAtomic(config);
  return { backupPath, agentCount: aliceEntries.length };
}

export function removeAliceAgents(agentIds) {
  const backupPath = backupConfig();
  const config = readConfig();
  const idsToRemove = new Set(agentIds);

  if (config.agents?.list) {
    config.agents.list = config.agents.list.filter((a) => !idsToRemove.has(a.id));
  }

  // Clean up agentToAgent allow list
  if (config.tools?.agentToAgent?.allow) {
    config.tools.agentToAgent.allow = config.tools.agentToAgent.allow.filter((id) => !idsToRemove.has(id));
  }

  writeConfigAtomic(config);
  return { backupPath };
}
