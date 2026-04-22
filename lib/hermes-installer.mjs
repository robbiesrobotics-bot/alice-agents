// lib/hermes-installer.mjs
// Installs and configures A.L.I.C.E. for Hermes-only runtime

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HERMES_DIR = join(homedir(), '.hermes');
const ALICE_SKILLS_DIR = join(HERMES_DIR, 'skills', 'alice');
const ALICE_MEMORIES_DIR = join(HERMES_DIR, 'memories', 'alice');
const ALICE_CONFIG_JSON = join(HERMES_DIR, '.alice-config.json');
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'workspaces', '_shared');

// ── Runtime detection ─────────────────────────────────────────────────────────

export function isHermesInstalled() {
  if (!existsSync(join(homedir(), '.hermes'))) return false;
  if (!existsSync(join(homedir(), '.hermes', 'config.yaml'))) return false;
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
    const configPath = join(homedir(), '.hermes', 'config.yaml');
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
    // Fallback inline if template not found
    return readFileSync(templatePath, 'utf8');
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

// ── Alice agent registry ─────────────────────────────────────────────────────

const ALICE_AGENTS = [
  // Starter agents
  { id: 'alice', name: 'A.L.I.C.E.', domain: 'Orchestration', isOrchestrator: true, tier: 'core' },
  { id: 'dylan', name: 'Dylan', domain: 'Development', description: 'Full-stack code, APIs, debugging, architecture, database design', tier: 'starter' },
  { id: 'selena', name: 'Selena', domain: 'Security', description: 'Security audits, hardening, access controls, incident response, vulnerability assessment', tier: 'starter' },
  { id: 'devon', name: 'Devon', domain: 'DevOps', description: 'CI/CD pipelines, infrastructure, deployment, Docker, Kubernetes, monitoring', tier: 'starter' },
  { id: 'quinn', name: 'Quinn', domain: 'QA', description: 'Test design, automation, bug verification, quality assurance, test coverage', tier: 'starter' },
  { id: 'felix', name: 'Felix', domain: 'Frontend', description: 'UI implementation, React, responsive design, component libraries, CSS', tier: 'starter' },
  { id: 'daphne', name: 'Daphne', domain: 'Documentation', description: 'API docs, guides, runbooks, READMEs, technical writing', tier: 'starter' },
  { id: 'rowan', name: 'Rowan', domain: 'Research', description: 'Web research, competitive analysis, fact-finding, technology landscape', tier: 'starter' },
  { id: 'darius', name: 'Darius', domain: 'Data', description: 'Data pipelines, SQL, analytics, warehousing, ETL processes', tier: 'starter' },
  { id: 'sophie', name: 'Sophie', domain: 'Support', description: 'Customer support, triage, drafting responses, FAQ creation', tier: 'starter' },
  // Pro agents
  { id: 'hannah', name: 'Hannah', domain: 'HR', description: 'Onboarding, HR policy, organizational structure, people operations', tier: 'pro' },
  { id: 'aiden', name: 'Aiden', domain: 'Analytics', description: 'Dashboards, KPI tracking, business intelligence, analytics models', tier: 'pro' },
  { id: 'clara', name: 'Clara', domain: 'Communications', description: 'Writing, email sequences, press releases, messaging frameworks', tier: 'pro' },
  { id: 'avery', name: 'Avery', domain: 'Automation', description: 'Workflow automation, no-code automation, process engineering', tier: 'pro' },
  { id: 'owen', name: 'Owen', domain: 'Operations', description: 'Vendor management, process efficiency, day-to-day operations', tier: 'pro' },
  { id: 'isaac', name: 'Isaac', domain: 'Integrations', description: 'API integrations, webhook configurations, third-party connections', tier: 'pro' },
  { id: 'tommy', name: 'Tommy', domain: 'Travel', description: 'Travel booking, itineraries, logistics, trip planning', tier: 'pro' },
  { id: 'sloane', name: 'Sloane', domain: 'Sales', description: 'Sales pipeline, outreach, deal management, revenue strategy', tier: 'pro' },
  { id: 'nadia', name: 'Nadia', domain: 'UI/UX Design', description: 'UX wireframes, visual systems, prototypes, design reviews', tier: 'pro' },
  { id: 'morgan', name: 'Morgan', domain: 'Marketing', description: 'Content marketing, campaigns, SEO, social media, positioning', tier: 'pro' },
  { id: 'alex', name: 'Alex', domain: 'API Crawling', description: 'Web scraping, API data extraction, large-scale crawling', tier: 'pro' },
  { id: 'uma', name: 'Uma', domain: 'UX Research', description: 'User interviews, usability studies, qualitative research, personas', tier: 'pro' },
  { id: 'caleb', name: 'Caleb', domain: 'CRM', description: 'CRM administration, pipeline management, contact lifecycle', tier: 'pro' },
  { id: 'elena', name: 'Elena', domain: 'Estimation', description: 'Project estimation, effort scoping, technical planning', tier: 'pro' },
  { id: 'audrey', name: 'Audrey', domain: 'Accounting', description: 'Financial tracking, budgets, expense management, reconciliation', tier: 'pro' },
  { id: 'logan', name: 'Logan', domain: 'Legal', description: 'Contract review, terms of service, NDAs, regulatory compliance', tier: 'pro' },
  { id: 'eva', name: 'Eva', domain: 'Executive Assistant', description: 'Scheduling, meeting preparation, executive briefs, follow-ups', tier: 'pro' },
  { id: 'parker', name: 'Parker', domain: 'Project Management', description: 'Project milestones, tracking, cross-functional coordination', tier: 'pro' },
  { id: 'nate', name: 'Nate', domain: 'n8n Automation', description: 'n8n workflow building, node-based automation, workflow design', tier: 'pro' },
  { id: 'aria', name: 'Aria', domain: 'Autonomous Research', description: 'Deep investigative research, longitudinal studies, synthesis', tier: 'pro' },
  { id: 'maxxipro', name: 'MaxxiPro', domain: 'Roof Maxx Expert', description: 'Roofing estimation, contracting, roof inspection workflows', tier: 'pro' },
  { id: 'accuscope', name: 'AccuScope', domain: 'AccuLynx CRM Auditor', description: 'AccuLynx CRM data quality, auditing, pipeline health', tier: 'pro' },
  { id: 'smoketestagent', name: 'SmokeTestAgent', domain: 'QA Specialist', description: 'Smoke testing, regression testing, automated test suites', tier: 'pro' },
];

export function getAliceAgents(tier = 'both') {
  if (tier === 'starter') return ALICE_AGENTS.filter(a => a.tier === 'starter' || a.isOrchestrator);
  if (tier === 'pro') return ALICE_AGENTS;
  return ALICE_AGENTS;
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
    const memDir = join(HERMES_DIR, 'memories', agent.id);
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

  // Remove alice memories
  const memoriesBase = join(HERMES_DIR, 'memories', 'alice');
  if (existsSync(memoriesBase)) {
    rmSync(memoriesBase, { recursive: true, force: true });
    result.removed.push('alice memories');
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
