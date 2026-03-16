import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'workspaces');
const OPENCLAW_DIR = join(homedir(), '.openclaw');
const SKILLS_DIR = join(OPENCLAW_DIR, 'skills');

// Product files — always overwritten on install/upgrade
const PRODUCT_FILES = ['SOUL.md', 'AGENTS.md', 'IDENTITY.md', 'TOOLS.md'];

// User files — only created if missing
const USER_FILES = ['PLAYBOOK.md', 'LEARNINGS.md', 'FEEDBACK.md', 'USER.md'];

function renderTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function loadTemplate(filename) {
  const sharedPath = join(TEMPLATES_DIR, '_shared', filename);
  if (existsSync(sharedPath)) {
    return readFileSync(sharedPath, 'utf8');
  }
  return null;
}

function getTemplateVariant(baseName, agent) {
  // Check for agent-specific override first
  const agentOverridePath = join(TEMPLATES_DIR, agent.id, baseName);
  if (existsSync(agentOverridePath)) {
    return readFileSync(agentOverridePath, 'utf8');
  }

  // Use variant-based naming
  if (agent.isOrchestrator) {
    const orchestratorTemplate = loadTemplate(`${baseName.replace('.md', '')}-orchestrator.md`);
    if (orchestratorTemplate) return orchestratorTemplate;
  }

  if (agent.coding) {
    const codingTemplate = loadTemplate(`${baseName.replace('.md', '')}-coding.md`);
    if (codingTemplate) return codingTemplate;
  }

  // Fallback to default
  return loadTemplate(baseName);
}

export function scaffoldWorkspace(agent, userInfo, agentCount) {
  const workspaceDir = join(OPENCLAW_DIR, `workspace-${agent.id}`);

  // Create workspace + memory dirs
  mkdirSync(join(workspaceDir, 'memory'), { recursive: true });

  const vars = {
    userName: userInfo.name,
    userTimezone: userInfo.timezone,
    userNotes: userInfo.notes ? `- **Notes:** ${userInfo.notes}` : '',
    agentName: agent.name,
    agentDomain: agent.domain,
    agentEmoji: agent.emoji,
    agentDescription: agent.description,
    agentCount: String(agentCount),
  };

  const written = [];
  const skipped = [];

  // Product files — always overwrite
  for (const filename of PRODUCT_FILES) {
    const template = getTemplateVariant(filename, agent);
    if (template) {
      const content = renderTemplate(template, vars);
      writeFileSync(join(workspaceDir, filename), content, 'utf8');
      written.push(filename);
    }
  }

  // User files — only create if missing
  for (const filename of USER_FILES) {
    const filePath = join(workspaceDir, filename);
    if (!existsSync(filePath)) {
      const template = loadTemplate(filename);
      if (template) {
        const content = renderTemplate(template, vars);
        writeFileSync(filePath, content, 'utf8');
        written.push(filename);
      }
    } else {
      skipped.push(filename);
    }
  }

  return { workspaceDir, written, skipped };
}

export function scaffoldSkills() {
  // Install the claude-code skill into ~/.openclaw/skills/
  const claudeCodeSkillDir = join(SKILLS_DIR, 'claude-code');
  mkdirSync(claudeCodeSkillDir, { recursive: true });

  const skillTemplatePath = join(__dirname, '..', 'templates', 'skills', 'claude-code', 'SKILL.md');
  const skillDestPath = join(claudeCodeSkillDir, 'SKILL.md');

  if (existsSync(skillTemplatePath)) {
    const content = readFileSync(skillTemplatePath, 'utf8');
    writeFileSync(skillDestPath, content, 'utf8');
    return true;
  }
  return false;
}

export function scaffoldAll(agents, userInfo) {
  const agentCount = agents.length;
  const results = [];

  for (const agent of agents) {
    const result = scaffoldWorkspace(agent, userInfo, agentCount);
    results.push({ agent: agent.id, ...result });
  }

  // Install skills
  scaffoldSkills();

  return results;
}
