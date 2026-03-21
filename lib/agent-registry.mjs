import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const STARTER_TEMPLATE = 'agents-starter.json';
const PRO_ADDONS_TEMPLATE = 'agents-pro.json';

export function normalizeTier(tier) {
  return tier === 'pro' ? 'pro' : 'starter';
}

function loadRegistryFile(filename) {
  const raw = readFileSync(join(TEMPLATES_DIR, filename), 'utf8');
  return JSON.parse(raw);
}

export function loadAgentRegistry(tier = 'starter') {
  const normalizedTier = normalizeTier(tier);
  const starterAgents = loadRegistryFile(STARTER_TEMPLATE);
  if (normalizedTier === 'starter') {
    return starterAgents;
  }

  const proAddons = loadRegistryFile(PRO_ADDONS_TEMPLATE);
  return [...starterAgents, ...proAddons];
}

export function getAgentIdsForTier(tier = 'starter') {
  return loadAgentRegistry(tier).map((agent) => agent.id);
}
