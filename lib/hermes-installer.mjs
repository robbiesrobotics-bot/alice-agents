// lib/hermes-installer.mjs
// Installs and configures A.L.I.C.E. for Hermes-only runtime

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAgentRegistry } from './agent-registry.mjs';
import {
  getHermesProfileDir,
  getHermesConfigPath,
  getHermesSkillsDir,
  getHermesMemoriesDir,
  getHermesAliceConfigPath,
} from './hermes-paths.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HERMES_DIR = getHermesProfileDir();
const ALICE_SKILLS_DIR = join(getHermesSkillsDir(), 'alice');
const ALICE_CONFIG_JSON = getHermesAliceConfigPath();
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'workspaces', '_shared');

// ── Runtime detection ─────────────────────────────────────────────────────────

export function isHermesInstalled() {
  if (!existsSync(HERMES_DIR)) return false;
  if (!existsSync(getHermesConfigPath())) return false;
  try {
    execSync('hermes version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getHermesVersion() {
  try {
    // Suppress stderr to avoid "Failed to load config" warnings
    return execSync('hermes version 2>/dev/null', { encoding: 'utf8', stdio: 'pipe' })
      .trim()
      .split('\n')[0]; // only first line
  } catch {
    return null;
  }
}

/**
 * Read the default model from ~/.hermes/config.yaml
 * Returns null if no model is configured.
 */
export function getHermesDefaultModel() {
  try {
    const configPath = getHermesConfigPath();
    const content = readFileSync(configPath, 'utf8');
    const lines = content.split('\n');
    let inModel = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === 'model:') { inModel = true; continue; }
      if (inModel) {
        // 'default: <modelname>' at the same or deeper indent
        const match = trimmed.match(/^default:\s*(.+)$/);
        if (match) return match[1].trim();
        // If we hit a new top-level key, stop
        if (trimmed.match(/^[a-z]/) && !trimmed.startsWith('default:')) break;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ── Hermes config helpers ─────────────────────────────────────────────────────
// Uses `hermes config set` for safe updates — Hermes rewrites the file correctly.

const ALICE_PERSONALITY = `You are A.L.I.C.E. — the Chief Orchestration Officer of the A.L.I.C.E. multi-agent AI team. Your role is to receive user requests, route them to the right specialist agents (dylan for development, selena for security, devon for DevOps, etc.), wait for their results, and synthesize one clear response. You delegate ALL specialist work — you do not do it yourself. You are sharp, confident, and efficient. Users may call you Alice, A.L.I.C.E., or Olivia.`;

/**
 * Configure Hermes with alice personality and display settings.
 * Uses `hermes config set` which safely rewrites the YAML.
 */
function configureHermesAlice() {
  // Set display personality to alice
  execSync(`hermes config set display.personality alice`, {
    stdio: 'pipe',
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  // Set alice personality
  execSync(`hermes config set agent.personalities.alice "${ALICE_PERSONALITY.replace(/"/g, '\\"')}"`, {
    stdio: 'pipe',
    env: { ...process.env, TERM: 'xterm-256color' },
  });
}

// ── Alice skill file generation ───────────────────────────────────────────────

function generateOrchestratorSkill() {
  const templatePath = join(TEMPLATES_DIR, 'hermes-orchestrator-skill.md');
  if (!existsSync(templatePath)) {
    return `---
name: alice
description: A.L.I.C.E. orchestrator for the Hermes-based agent team.
---

# A.L.I.C.E. — Hermes Orchestrator

You are A.L.I.C.E., the orchestrator of the A.L.I.C.E. multi-agent team.
Route work to the right specialists, wait for their results, and synthesize one clear response.
`;
  }
  return readFileSync(templatePath, 'utf8');
}

function generateSpecialistSkill(agentId, agentName, domain, domainDescription) {
  let templatePath = join(TEMPLATES_DIR, 'hermes-specialist-skill.md');
  if (!existsSync(templatePath)) {
    // Inline fallback template
    return `---
name: ${agentId}
description: ${domain} specialist on the A.L.I.C.E. team.
---

# ${agentName} — ${domain} Specialist

**${agentName}** is a ${domain} specialist on the A.L.I.C.E. team.
A.L.I.C.E. (orchestrator) assigns you tasks. Complete them and report back.

## Domain
${domainDescription}

## How You Work
1. Receive task from A.L.I.C.E.
2. Use your tools to complete the work
3. Return structured results to A.L.I.C.E.

## Response Format
**Summary:** one-line answer
**Details:** what you did/found
**Next Steps:** recommended actions
**Blockers:** anything blocking progress (or "None")
`;
  }

  let content = readFileSync(templatePath, 'utf8');
  content = content
    .replace(/\{\{agentId\}\}/g, agentId)
    .replace(/\{\{agentName\}\}/g, agentName)
    .replace(/\{\{domain\}\}/g, domain)
    .replace(/\{\{domainDescription\}\}/g, domainDescription || `${domain} specialist work.`);
  return content;
}

export function getAliceAgents(tier = 'both') {
  if (tier === 'both') return loadAgentRegistry('pro', { runtime: 'hermes' });
  return loadAgentRegistry(tier, { runtime: 'hermes' });
}

// ── Install A.L.I.C.E. on Hermes ─────────────────────────────────────────────

export async function installForHermes(options = {}) {
  const { tier = 'starter', auto = false, userInfo = null } = options;
  const agents = getAliceAgents(tier);
  const result = { skills: [], memories: [], config: null, errors: [] };

  console.log('');
  console.log(`  ${'─'.repeat(50)}`);
  console.log(`  ${'🧠'.padStart(15)} ${'A.L.I.C.E. on Hermes'}`);
  console.log(`  ${'─'.repeat(50)}`);
  console.log('');

  // 1. Verify Hermes is installed
  if (!isHermesInstalled()) {
    throw new Error('Hermes is not installed. Run: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash');
  }

  const version = getHermesVersion();
  console.log(`  ${'✓'.padStart(15)} ${version}`);
  console.log('');

  // 2. Ensure alice skill directory
  if (!existsSync(ALICE_SKILLS_DIR)) {
    mkdirSync(ALICE_SKILLS_DIR, { recursive: true });
  }

  // 3. Install orchestrator skill
  console.log(`  ${'─'.repeat(50)}`);
  console.log(`  ${'🤖'.padStart(15)} ${'A.L.I.C.E. orchestrator skill'}`);
  console.log(`  ${'─'.repeat(50)}`);
  const orchestratorDir = join(ALICE_SKILLS_DIR, 'alice');
  mkdirSync(orchestratorDir, { recursive: true });
  const orchestratorContent = generateOrchestratorSkill();
  writeFileSync(join(orchestratorDir, 'SKILL.md'), orchestratorContent, 'utf8');
  console.log(`  ${'✓'.padStart(15)} alice/SKILL.md — orchestrator`);
  result.skills.push('alice');

  // 4. Install specialist skills
  const specialistAgents = agents.filter(a => !a.isOrchestrator);
  console.log('');
  console.log(`  ${'─'.repeat(50)}`);
  console.log(`  ${'👥'.padStart(15)} ${specialistAgents.length} specialist skills`);
  console.log(`  ${'─'.repeat(50)}`);

  for (const agent of specialistAgents) {
    const skillDir = join(ALICE_SKILLS_DIR, agent.id);
    mkdirSync(skillDir, { recursive: true });
    const skillContent = generateSpecialistSkill(agent.id, agent.name, agent.domain, agent.description || '');
    writeFileSync(join(skillDir, 'SKILL.md'), skillContent, 'utf8');
    console.log(`  ${'✓'.padStart(15)} ${agent.id.padEnd(15)} — ${agent.domain}`);
    result.skills.push(agent.id);
  }

  // 5. Create memory directories
  console.log('');
  console.log(`  ${'─'.repeat(50)}`);
  console.log(`  ${'🧠'.padStart(15)} ${'Memory directories'}`);
  console.log(`  ${'─'.repeat(50)}`);

  for (const agent of agents) {
    const memDir = join(getHermesMemoriesDir(), agent.id);
    if (!existsSync(memDir)) {
      mkdirSync(memDir, { recursive: true });
    }
    result.memories.push(agent.id);
  }
  console.log(`  ${'✓'.padStart(15)} ${agents.length} memory dirs created`);

  // 6. Patch Hermes config with alice personality
  console.log('');
  console.log(`  ${'─'.repeat(50)}`);
  console.log(`  ${'⚙️'.padStart(15)} ${'Hermes configuration'}`);
  console.log(`  ${'─'.repeat(50)}`);

  configureHermesAlice();
  result.config = 'config.yaml updated';
  console.log(`  ${'✓'.padStart(15)} personality 'alice' added to config.yaml`);
  console.log(`  ${'✓'.padStart(15)} display.personality set to alice`);

  // 7. Write alice-config.json for installer tracking
  const aliceConfig = {
    runtime: 'hermes',
    version,
    installedAt: new Date().toISOString(),
    agents: agents.map(a => a.id),
    tier,
    userName: userInfo?.name || 'unknown',
  };
  writeFileSync(ALICE_CONFIG_JSON, JSON.stringify(aliceConfig, null, 2), 'utf8');

  console.log('');
  console.log(`  ${'✓'.padStart(15)} alice-config.json written`);
  console.log('');

  return result;
}

// ── Uninstall A.L.I.C.E. from Hermes ────────────────────────────────────────

export function uninstallFromHermes(options = {}) {
  const { auto = false } = options;
  const result = { removed: [], errors: [] };

  // Remove alice skill tree
  if (existsSync(ALICE_SKILLS_DIR)) {
    rmSync(ALICE_SKILLS_DIR, { recursive: true, force: true });
    result.removed.push('alice skills');
  }

  // Remove tracked memory directories for the installed agent roster
  const installedAgentIds = (() => {
    try {
      const raw = JSON.parse(readFileSync(ALICE_CONFIG_JSON, 'utf8'));
      return Array.isArray(raw.agents) ? raw.agents : [];
    } catch {
      return getAliceAgents('pro').map((agent) => agent.id);
    }
  })();

  const removedMemories = [];
  for (const agentId of installedAgentIds) {
    const memoryDir = join(getHermesMemoriesDir(), agentId);
    if (existsSync(memoryDir)) {
      rmSync(memoryDir, { recursive: true, force: true });
      removedMemories.push(agentId);
    }
  }
  if (removedMemories.length > 0) {
    result.removed.push(`memory dirs (${removedMemories.join(', ')})`);
  }

  // Remove config tracking
  if (existsSync(ALICE_CONFIG_JSON)) {
    rmSync(ALICE_CONFIG_JSON, { force: true });
    result.removed.push('alice-config.json');
  }

  // Remove alice personality using hermes config set (deletes by unsetting)
  try {
    // Setting to empty/null effectively removes it
    execSync(`hermes config set display.personality helpful`, {
      stdio: 'pipe',
      env: { ...process.env, TERM: 'xterm-256color' },
    });
    result.removed.push('display.personality reset to helpful');
  } catch (err) {
    result.errors.push(`display.personality reset: ${err.message}`);
  }

  return result;
}

// ── Status ─────────────────────────────────────────────────────────────────────

export function getHermesAliceStatus() {
  const configPath = join(ALICE_CONFIG_JSON);
  if (!existsSync(configPath)) {
    return { installed: false };
  }
  try {
    const data = JSON.parse(readFileSync(configPath, 'utf8'));
    return { installed: true, ...data };
  } catch {
    return { installed: false };
  }
}
