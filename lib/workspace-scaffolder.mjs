import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildCodingAgentSkillContent, resolveCodingAgentPreference } from './coding-agent.mjs';
import {
  ALICE_RUNTIME_HOME,
  getAliceRuntimeWorkspaceDir,
  writeAliceRuntimeDefinition,
} from './alice-runtime-adapter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'workspaces');
const OPENCLAW_DIR = join(homedir(), '.openclaw');
const SKILLS_DIR = join(OPENCLAW_DIR, 'skills');

// Product files — always overwritten on install/upgrade
const PRODUCT_FILES = ['SOUL.md', 'AGENTS.md', 'IDENTITY.md', 'TOOLS.md'];

// User files — only created if missing
const USER_FILES = ['PLAYBOOK.md', 'LEARNINGS.md', 'FEEDBACK.md', 'USER.md', 'MEMORY.md', 'HEARTBEAT.md'];

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

function loadAgentTemplate(agent, filename) {
  const agentPath = join(TEMPLATES_DIR, agent.id, filename);
  if (existsSync(agentPath)) {
    return readFileSync(agentPath, 'utf8');
  }
  return null;
}

function getTemplateVariant(baseName, agent) {
  const agentTemplate = loadAgentTemplate(agent, baseName);
  if (agentTemplate) return agentTemplate;

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

function getUserFileTemplate(filename, agent) {
  return loadTemplate(filename);
}

function normalizeSoulContent(content, agent) {
  if (agent.isOrchestrator) {
    return content
      .replace(
        /\*\*You are A\.L\.I\.C\.E\., orchestrator of a \d+-agent team\.\*\*/,
        '**You are A.L.I.C.E., orchestrator of the A.L.I.C.E. team.**'
      )
      .replace(
        /\*\*Memory recall before answering\.\*\*[\s\S]*?Match scores in the 0\.5\+ range are usually directly relevant; under 0\.3 is noise\./m,
        `**Memory recall before answering.** When a question touches past decisions, projects, people, or technical details, check the team's stored context first.

Start with the most relevant local sources: \`MEMORY.md\`, recent \`LEARNINGS.md\` entries, and files under the owning agent's \`memory/\` directory.

If \`mempalace\` is installed on this machine, you may also run \`mempalace search "<query>"\` via the \`exec\` tool for faster recall, using \`--wing <agentId>\` when one agent clearly owns the topic. Treat \`mempalace\` as optional tooling, not a guaranteed dependency of every install.`
      );
  }

  if (!content.includes('mempalace search "<query>" --wing')) {
    return content;
  }

  return content.replace(
    /## Memory[\s\S]*?Do NOT journal:/m,
    `## Memory

You have a persistent workspace memory. Keep \`MEMORY.md\`, recent \`LEARNINGS.md\` entries, and the \`memory/\` directory useful and current.

**Recall before answering.** When a question touches your past work, decisions, or technical history:

1. Check your local workspace context first: \`MEMORY.md\`, recent \`LEARNINGS.md\` entries, and relevant files under \`memory/\`.
2. If \`mempalace\` is installed on this machine, you may also run \`mempalace search "<query>" --wing ${agent.id}\` via \`exec\` for faster recall.
3. Treat \`mempalace\` as optional tooling, not a guaranteed dependency of every A.L.I.C.E. install.

**Write durable learnings.** When you learn something worth remembering across sessions, append it to \`LEARNINGS.md\` or add a dated file under \`memory/\`. If \`mempalace\` is installed later, those notes can be indexed then.

Do NOT journal:`
  );
}

function normalizeAgentsContent(content, agent) {
  if (!agent.isOrchestrator) {
    return content;
  }

  return content
    .replace(
      /You are \*\*A\.L\.I\.C\.E\.\*\*, the \*\*orchestrator\*\* of the A\.L\.I\.C\.E\. team\. You coordinate \d+ specialist agents to deliver results for Rob\./,
      'You are **A.L.I.C.E.**, the **orchestrator** of the A.L.I.C.E. team. You coordinate the specialist team to deliver results for Rob.'
    )
    .replace(
      /2\. \*\*Memory recall\*\* — .*?\n3\./s,
      '2. **Memory recall** — when a request touches past decisions, projects, people, or technical history, check the most relevant local context first: the owning agent\'s `MEMORY.md`, recent `LEARNINGS.md` entries, and files under `memory/`. If `mempalace` is installed on this machine, you may also search it via `exec`, using `--wing <agentId>` when one specialist clearly owns the topic.\n3.'
    );
}

function normalizeCodingToolContent(filename, content) {
  if (!['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'PLAYBOOK.md'].includes(filename)) {
    return content;
  }

  return content
    .replaceAll('`claude_code`', '`coding-agent`')
    .replaceAll('claude_code "', 'coding-agent "')
    .replaceAll(
      '**For coding tasks, use the `coding-agent` skill** — it runs Claude Code CLI autonomously with full file editing, terminal, and search capabilities',
      '**For coding tasks, use the `coding-agent` skill** — it selects the preferred coding CLI for this machine, preferring Codex for OpenAI defaults and Claude Code for Anthropic defaults'
    )
    .replaceAll(
      'Use `coding-agent` for: writing code, debugging, refactoring, multi-file changes, test creation',
      'Use `coding-agent` for: writing code, debugging, refactoring, multi-file changes, and test creation'
    )
    .replaceAll('## Primary Tool: Claude Code', '## Primary Tool: coding-agent')
    .replaceAll(
      '**For any non-trivial coding task, use the `coding-agent` skill.** It delegates to the Claude Code CLI, which has its own file editing, terminal, and search capabilities. This is your power tool.',
      '**For any non-trivial coding task, use the `coding-agent` skill.** It chooses the preferred coding CLI for this machine, preferring Codex for OpenAI defaults and Claude Code for Anthropic defaults. This is your power tool.'
    )
    .replaceAll(
      '- **Always set workdir** to the project root so Claude Code can navigate the full codebase',
      '- **Always set workdir** to the project root so the coding CLI can navigate the full codebase'
    )
    .replaceAll(
      "- Review Claude Code's output before incorporating into your response",
      "- Review the coding agent's output before incorporating it into your response"
    )
    .replaceAll(
      "- Review Claude Code's output before incorporating it into your response",
      "- Review the coding agent's output before incorporating it into your response"
    )
    .replaceAll(
      '- `read/write/edit` — simple file reads/edits when Claude Code is overkill',
      '- `read/write/edit` — simple file reads/edits when the coding agent is overkill'
    )
    .replaceAll(
      '- **coding-agent** — Full Claude Code CLI for coding tasks',
      '- **coding-agent** — Provider-aware coding CLI skill for coding tasks'
    )
    .replaceAll(
      '- Use `coding-agent` for multi-file changes and complex coding tasks',
      '- Use `coding-agent` for multi-file changes and complex coding tasks'
    )
    .replaceAll(
      '**For multi-file tasks, use Claude Code.** Don\'t hand-edit patches file by file when the coding agent can navigate the full codebase faster and more reliably. Delegate implementation; own the plan and verification.',
      '**For multi-file tasks, use the `coding-agent` skill.** It can pick the best available coding CLI for this machine and navigate the full codebase faster than manual patch-by-patch edits. Delegate implementation; own the plan and verification.'
    )
    .replaceAll(
      'Before spawning Claude Code directly or writing implementation code yourself:',
      'Before spawning the `coding-agent` skill directly or writing implementation code yourself:'
    )
    .replaceAll(
      '3. Only fall back to direct Claude Code if genuinely no specialist covers it',
      '3. Only fall back to direct `coding-agent` use if genuinely no specialist covers it'
    )
    .replaceAll(
      "3. Felix implements using Claude Code with Nadia's spec as the brief",
      "3. Sasha implements using the `coding-agent` skill with Nadia's spec as the brief"
    )
    .replaceAll(
      '**Wrong:** A.L.I.C.E. spawns Claude Code directly for UI without involving Nadia or Felix',
      '**Wrong:** A.L.I.C.E. spawns the `coding-agent` skill directly for UI without involving Nadia or Sasha'
    )
    .replaceAll(
      '**Right:** Nadia → Felix → Claude Code → Quinn → A.L.I.C.E.',
      '**Right:** Nadia → Sasha → coding-agent → Morgan → A.L.I.C.E.'
    )
    .replaceAll(
      '- **Backend/API** → Dylan → Claude Code → Quinn (tests)',
      '- **Backend/API** → Dylan → coding-agent → Morgan (tests)'
    )
    .replaceAll(
      "- Don't spawn Claude Code directly for design work — route through Nadia first",
      "- Don't spawn the `coding-agent` skill directly for design work — route through Nadia first"
    )
    .replaceAll(
      "- Don't iterate on UI without a design spec. Nadia → Felix → Claude Code is the correct chain.",
      "- Don't iterate on UI without a design spec. Nadia → Sasha → coding-agent is the correct chain."
    )
    .replaceAll(
      "3. **Felix** — frontend implementation (spawns Claude Code with Nadia's spec)",
      "3. **Sasha** — frontend implementation (spawns the `coding-agent` skill with Nadia's spec)"
    );
}

function normalizeTemplateContent(filename, content, agent) {
  if (filename === 'SOUL.md') {
    return normalizeCodingToolContent(filename, normalizeSoulContent(content, agent));
  }
  if (filename === 'AGENTS.md') {
    return normalizeCodingToolContent(filename, normalizeAgentsContent(content, agent));
  }
  return normalizeCodingToolContent(filename, content);
}

function resolveWorkspaceDir(agent, runtime) {
  if (runtime === 'alice-runtime') return getAliceRuntimeWorkspaceDir(agent.id);
  return join(OPENCLAW_DIR, `workspace-${agent.id}`);
}

export function scaffoldWorkspace(agent, userInfo, agentCount, options = {}) {
  const runtime = options.runtime || 'openclaw';
  const workspaceDir = resolveWorkspaceDir(agent, runtime);

  // Create workspace + memory dirs
  mkdirSync(join(workspaceDir, 'memory'), { recursive: true });

  const vars = {
    userName: userInfo.name,
    userTimezone: userInfo.timezone,
    userNotes: userInfo.notes ? `- **Notes:** ${userInfo.notes}` : '',
    agentName: agent.name,
    agentId: agent.id,
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
      const content = normalizeTemplateContent(filename, renderTemplate(template, vars), agent);
      writeFileSync(join(workspaceDir, filename), content, 'utf8');
      written.push(filename);
    }
  }

  // User files — only create if missing
  for (const filename of USER_FILES) {
    const filePath = join(workspaceDir, filename);
    if (!existsSync(filePath)) {
      const template = getUserFileTemplate(filename, agent);
      if (template) {
        const content = normalizeTemplateContent(filename, renderTemplate(template, vars), agent);
        writeFileSync(filePath, content, 'utf8');
        written.push(filename);
      }
    } else {
      skipped.push(filename);
    }
  }

  const definitionPath = runtime === 'alice-runtime' ? writeAliceRuntimeDefinition(agent) : null;

  return { workspaceDir, written, skipped, definitionPath };
}

export function scaffoldSkills(preference = null, options = {}) {
  const codingAgentPreference = preference || resolveCodingAgentPreference();
  const skillsDir = options.runtime === 'alice-runtime' ? join(ALICE_RUNTIME_HOME, 'skills') : SKILLS_DIR;
  const codingAgentSkillDir = join(skillsDir, codingAgentPreference.skillId);
  mkdirSync(codingAgentSkillDir, { recursive: true });

  const skillDestPath = join(codingAgentSkillDir, 'SKILL.md');
  writeFileSync(skillDestPath, buildCodingAgentSkillContent(codingAgentPreference), 'utf8');
  return codingAgentPreference;
}

export function scaffoldAll(agents, userInfo, skillPreference = null, options = {}) {
  const agentCount = agents.length;
  const results = [];

  for (const agent of agents) {
    const result = scaffoldWorkspace(agent, userInfo, agentCount, options);
    results.push({ agent: agent.id, ...result });
  }

  // Install skills
  const installedSkill = scaffoldSkills(skillPreference, options);

  return { workspaces: results, installedSkill };
}
