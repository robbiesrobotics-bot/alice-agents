import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const HERMES_ORCHESTRATOR_ID = 'alice';

const STARTER_TEMPLATE = 'agents-starter.json';
const PRO_ADDONS_TEMPLATE = 'agents-pro.json';

export function normalizeTier(tier) {
  return tier === 'pro' ? 'pro' : 'starter';
}

function loadRegistryFile(filename) {
  const raw = readFileSync(join(TEMPLATES_DIR, filename), 'utf8');
  return JSON.parse(raw);
}

function mapAgentForRuntime(agent, runtime = 'openclaw') {
  if (runtime !== 'hermes' || !agent.isOrchestrator) {
    return { ...agent };
  }

  return {
    ...agent,
    id: HERMES_ORCHESTRATOR_ID,
    runtimeAgentId: HERMES_ORCHESTRATOR_ID,
    sourceAgentId: agent.id,
  };
}

function pruneDanglingAllowAgents(roster, { warn = console.warn } = {}) {
  const ids = new Set(roster.map((a) => a.id));
  return roster.map((agent) => {
    const allow = agent?.extraConfig?.subagents?.allowAgents
      ?? agent?.subagents?.allowAgents;
    if (!Array.isArray(allow)) return agent;
    const kept = allow.filter((id) => id === '*' || ids.has(id));
    const dropped = allow.filter((id) => id !== '*' && !ids.has(id));
    if (dropped.length === 0) return agent;
    warn(
      `[alice-agents] ${agent.id}: dropping unknown allowAgents references `
      + `[${dropped.join(', ')}] (not present in current tier roster)`
    );
    const next = { ...agent };
    if (next.extraConfig?.subagents) {
      next.extraConfig = {
        ...next.extraConfig,
        subagents: { ...next.extraConfig.subagents, allowAgents: kept },
      };
    }
    if (next.subagents) {
      next.subagents = { ...next.subagents, allowAgents: kept };
    }
    return next;
  });
}

export function loadAgentRegistry(tier = 'starter', options = {}) {
  const runtime = options.runtime || 'openclaw';
  const normalizedTier = normalizeTier(tier);
  const starterAgents = loadRegistryFile(STARTER_TEMPLATE);
  const roster = normalizedTier === 'starter'
    ? starterAgents
    : [...starterAgents, ...loadRegistryFile(PRO_ADDONS_TEMPLATE)];
  const pruned = pruneDanglingAllowAgents(roster, { warn: options.warn });
  return pruned.map((agent) => mapAgentForRuntime(agent, runtime));
}

export function getAgentIdsForTier(tier = 'starter', options = {}) {
  return loadAgentRegistry(tier, options).map((agent) => agent.id);
}
