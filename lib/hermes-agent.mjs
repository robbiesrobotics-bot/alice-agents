// lib/hermes-agent.mjs
// HermesAgentManager — creates, spawns, and manages Hermes agents as A.L.I.C.E. team members

import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HERMES_DIR = join(homedir(), '.hermes');
const OPENCLAW_DIR = join(homedir(), '.openclaw');
const SKILLS_PARENT = join(HERMES_DIR, 'skills'); // skills live at ~/.hermes/skills/<category>/<id>/SKILL.md
const HERMES_AGENTS_JSON = join(OPENCLAW_DIR, 'hermes-agents.json');
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'workspaces', '_shared');

// ── Hermes CLI detection ──────────────────────────────────────────────────────

function findHermesBinary() {
  const candidates = [
    join(HERMES_DIR, 'bin', 'hermes'),
    join(homedir(), '.local', 'bin', 'hermes'),
    'hermes', // PATH
  ];
  for (const candidate of candidates) {
    try {
      execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${candidate.replace(/\\/g, '')}`, { stdio: 'pipe' });
      return candidate;
    } catch {
      // try next
    }
  }
  // Fallback: trust `hermes` is in PATH
  return 'hermes';
}

const HERMES_BIN = findHermesBinary();

// ── HermesAgentManager ─────────────────────────────────────────────────────────

export class HermesAgentManager {
  /**
   * @param {Object} options
   * @param {string} [options.skillsCategory='alice'] — Hermes skill category for A.L.I.C.E. Hermes agents
   * @param {string} [options.defaultToolsets='terminal,file,web'] — default toolsets for spawned agents
   */
  constructor({ skillsCategory = 'alice', defaultToolsets = 'terminal,file,web' } = {}) {
    this.skillsCategory = skillsCategory;
    this.defaultToolsets = defaultToolsets;
  }

  // ── Registry ─────────────────────────────────────────────────────────────

  _readRegistry() {
    if (!existsSync(HERMES_AGENTS_JSON)) return { hermesAgents: [] };
    try {
      return JSON.parse(readFileSync(HERMES_AGENTS_JSON, 'utf8'));
    } catch {
      return { hermesAgents: [] };
    }
  }

  _writeRegistry(registry) {
    mkdirSync(dirname(HERMES_AGENTS_JSON), { recursive: true });
    writeFileSync(HERMES_AGENTS_JSON, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  }

  /**
   * List all registered Hermes agents.
   * @returns {{ id: string, agentId: string, domain: string, description: string, createdAt: string }[]}
   */
  listAgents() {
    return this._readRegistry().hermesAgents || [];
  }

  /**
   * Check if a Hermes agent is registered.
   * @param {string} agentId
   * @returns {boolean}
   */
  hasAgent(agentId) {
    return this.listAgents().some(a => a.agentId === agentId);
  }

  // ── Skill directory helpers ───────────────────────────────────────────────

  /**
   * Path to the SKILL.md for a given agent.
   * @param {string} agentId
   * @returns {string}
   */
  _skillPath(agentId) {
    return join(SKILLS_PARENT, this.skillsCategory, agentId, 'SKILL.md');
  }

  /**
   * Ensure the Hermes skills directory exists for an agent.
   * @param {string} agentId
   */
  _ensureSkillDir(agentId) {
    const dir = join(SKILLS_PARENT, this.skillsCategory, agentId);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  // ── Model / provider detection ────────────────────────────────────────────

  /**
   * Detect the default model and provider from OpenClaw config.
   * Returns null if OpenClaw config can't be read.
   *
   * @returns {{ primary: string, provider: string, model: string } | null}
   */
  static detectOpenClawModel() {
    const configPath = join(OPENCLAW_DIR, 'openclaw.json');
    if (!existsSync(configPath)) return null;
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      const agentDefaults = config?.agents?.defaults?.model || {};
      const globalModel = config?.model;
      const primary = agentDefaults.primary || globalModel || null;
      if (!primary || typeof primary !== 'string') return null;
      const [provider, ...rest] = primary.split('/');
      const model = rest.join('/'); // handles models with slashes like 'anthropic/claude-sonnet-4-6'
      return { primary, provider, model };
    } catch {
      return null;
    }
  }

  /**
   * Build the hermes CLI args for model/provider from OpenClaw detected config.
   * Returns [] if nothing detected.
   *
   * @param {string} [fallbackProvider='minimax']
   * @param {string} [fallbackModel]
   * @returns {string[]}
   */
  buildHermesModelArgs(fallbackProvider = 'minimax', fallbackModel = '') {
    const detected = HermesAgentManager.detectOpenClawModel();
    if (detected?.provider && detected?.model) {
      return ['--provider', detected.provider, '--model', detected.model];
    }
    // Fallback: use minimax (common default)
    const args = ['--provider', fallbackProvider];
    if (fallbackModel) args.push('--model', fallbackModel);
    return args;
  }

  // ── Create ───────────────────────────────────────────────────────────────

  /**
   * Create a new Hermes agent for the A.L.I.C.E. team.
   *
   * Creates:
   *   - ~/.hermes/skills/<category>/<agentId>/SKILL.md
   *   - Registers in ~/.openclaw/hermes-agents.json
   *
   * @param {string} agentId    — unique ID, e.g. 'researcher' or 'analyst'
   * @param {string} domain    — domain label, e.g. 'Research' or 'Data Analysis'
   * @param {string} description — one-line description of what this agent does
   * @param {string} [persona]  — optional custom persona instructions override
   * @param {string[]} [skills] — list of hermes skill names to preload (e.g. ['web-search', 'codex'])
   * @param {string} [toolsets] — comma-separated toolsets to enable (default: 'terminal,file,web')
   * @returns {{ status: 'created' | 'exists', agentId: string, skillPath: string }}
   */
  createAgent(agentId, domain, description, persona = '', skills = [], toolsets = null) {
    // Check if already exists
    if (this.hasAgent(agentId)) {
      return { status: 'exists', agentId, skillPath: this._skillPath(agentId) };
    }

    // Ensure skill directory
    const skillDir = this._ensureSkillDir(agentId);
    const skillPath = join(skillDir, 'SKILL.md');

    // Build skill content
    const skillContent = this._buildSkillContent(agentId, domain, description, persona, skills);
    writeFileSync(skillPath, skillContent, 'utf8');

    // Register
    const registry = this._readRegistry();
    registry.hermesAgents.push({
      id: `hermes-${Date.now()}`,
      agentId,
      domain,
      description,
      skillsCategory: this.skillsCategory,
      toolsets: toolsets || this.defaultToolsets,
      preloadSkills: skills,
      createdAt: new Date().toISOString(),
    });
    this._writeRegistry(registry);

    return { status: 'created', agentId, skillPath };
  }

  /**
   * Build SKILL.md content for a Hermes agent.
   * @private
   */
  _buildSkillContent(agentId, domain, description, persona, skills) {
    const skillLines = [
      '---',
      `name: ${agentId}`,
      `description: ${description} — managed by A.L.I.C.E. on OpenClaw`,
      '---',
      '',
      `# ${agentId} (${domain})`,
      '',
      `> Managed by A.L.I.C.E. team — do not edit manually.`,
      '',
      `**Domain:** ${domain}`,
      '',
      `**Role:** ${description}`,
      '',
      '## Persona',
      '',
    ];

    if (persona) {
      skillLines.push(persona, '');
    } else {
      skillLines.push(
        `You are ${agentId}, a ${domain} specialist working on the A.L.I.C.E. team.`,
        `A.L.I.C.E. (orchestrated by OpenClaw) assigns you tasks via this skill interface.`,
        `Your role is ${description}.`,
        '',
        '## Working with A.L.I.C.E.',
        '',
        '- A.L.I.C.E. will send you a task description',
        '- Complete the task using your tools and skills',
        '- Return your findings/results clearly and concisely',
        '- Do not add unnecessary commentary',
        '',
      );
    }

    if (skills.length > 0) {
      skillLines.push(
        '## Preloaded Skills',
        '',
        `This agent has the following skills available:`,
        ...skills.map(s => `  - \`${s}\``),
        '',
      );
    }

    skillLines.push(
      '## Notes',
      '',
      '- Skills are managed by A.L.I.C.E. — see `~/.openclaw/hermes-agents.json` for configuration',
      '- Model is inherited from OpenClaw default config',
    );

    return skillLines.join('\n');
  }

  // ── Remove ───────────────────────────────────────────────────────────────

  /**
   * Remove a Hermes agent (deletes skill dir + unregisters).
   *
   * @param {string} agentId
   * @returns {{ status: 'removed' | 'not_found' }}
   */
  removeAgent(agentId) {
    const registry = this._readRegistry();
    const before = registry.hermesAgents.length;
    registry.hermesAgents = registry.hermesAgents.filter(a => a.agentId !== agentId);

    if (registry.hermesAgents.length === before) {
      return { status: 'not_found' };
    }

    this._writeRegistry(registry);

    // Remove skill directory
    const skillDir = join(SKILLS_PARENT, this.skillsCategory, agentId);
    if (existsSync(skillDir)) {
      rmSync(skillDir, { recursive: true, force: true });
    }

    return { status: 'removed' };
  }

  // ── Spawn ───────────────────────────────────────────────────────────────

  /**
   * Spawn a Hermes agent to execute a single task.
   * Uses `hermes chat -q "<task>"` in quiet mode.
   *
   * @param {string} agentId   — registered Hermes agent ID
   * @param {string} task      — task description (will be wrapped in persona context)
   * @param {{ timeout?: number, toolsets?: string, skills?: string[], context?: string }} [options]
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
   */
  spawnAgent(agentId, task, options = {}) {
    const { timeout = 300, toolsets: overrideToolsets, skills: overrideSkills, context = '' } = options;

    const registry = this._readRegistry();
    const agent = registry.hermesAgents.find(a => a.agentId === agentId);

    const toolsets = overrideToolsets || agent?.toolsets || this.defaultToolsets;
    const preloadSkills = overrideSkills || agent?.preloadSkills || [];

    // Build the prompt — wrap task in agent context
    const prompt = this._buildPrompt(agentId, task, context);

    // Build CLI args
    const args = [
      'chat', '-q', prompt,
      '-s', preloadSkills.join(','),
      '-t', toolsets,
      '-Q', // quiet mode — programmatic output only
    ];

    // Add model/provider from OpenClaw config
    const modelArgs = this.buildHermesModelArgs();
    args.push(...modelArgs);

    return new Promise((resolve, reject) => {
      const child = spawn(HERMES_BIN, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: timeout * 1000,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('error', reject);

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code ?? 0 });
      });

      // Handle timeout
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Hermes agent "${agentId}" timed out after ${timeout}s`));
      }, timeout * 1000);

      child.on('close', () => clearTimeout(timer));
    });
  }

  /**
   * Build the prompt passed to hermes chat -q.
   * Wraps the task in agent context so Hermes knows who it is.
   * @private
   */
  _buildPrompt(agentId, task, context) {
    const lines = [
      `[A.L.I.C.E. Team — ${agentId}]`,
      '',
      context ? `${context}\n` : '',
      `Task: ${task}`,
      '',
      'Instructions: You are a specialist on the A.L.I.C.E. team. Complete the task above.',
      'Return your results clearly. Do not add meta-commentary about being an AI.',
    ];
    return lines.join('\n');
  }

  // ── Quick spawn (one-off, no registration required) ────────────────────

  /**
   * Spawn a quick one-off Hermes agent without registering it.
   * Useful for tasks that don't need persistent memory.
   *
   * @param {string} task
   * @param {{ domain?: string, skills?: string[], toolsets?: string, timeout?: number }} [options]
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
   */
  quickSpawn(task, options = {}) {
    const {
      domain = 'Specialist',
      skills = [],
      toolsets = 'terminal,file,web',
      timeout = 300,
    } = options;

    return this.spawnAgent(`__quick__-${Date.now()}`, task, {
      ...options,
      // For quick spawn, we pass skills/toolsets directly but don't register
      toolsets,
      skills,
    });
  }

  // ── OpenClaw bridge setup ───────────────────────────────────────────────

  /**
   * Register the A.L.I.C.E. OpenClaw bridge — sets up the hermes-agents.json
   * and verifies Hermes is reachable.
   *
   * @returns {{ status: 'ok', hermesVersion: string } | { status: 'error', reason: string }}
   */
  setupBridge() {
    try {
      // Verify Hermes is installed
      const version = execSync(`${HERMES_BIN} version 2>&1`, { encoding: 'utf8', stdio: 'pipe' }).trim();

      // Ensure registry exists
      if (!existsSync(HERMES_AGENTS_JSON)) {
        this._writeRegistry({ hermesAgents: [] });
      }

      return { status: 'ok', hermesVersion: version };
    } catch (err) {
      return { status: 'error', reason: `Hermes not found or not working: ${err.message}` };
    }
  }

  // ── Inspect ─────────────────────────────────────────────────────────────

  /**
   * Get full details for a registered Hermes agent.
   * @param {string} agentId
   * @returns {Object | null}
   */
  getAgent(agentId) {
    return this.listAgents().find(a => a.agentId === agentId) || null;
  }

  /**
   * Get the path to an agent's SKILL.md.
   * @param {string} agentId
   * @returns {string | null}
   */
  getSkillPath(agentId) {
    const p = this._skillPath(agentId);
    return existsSync(p) ? p : null;
  }
}

// ── Export singleton factory ───────────────────────────────────────────────────

let _manager = null;

export function getHermesAgentManager(options) {
  if (!_manager) {
    _manager = new HermesAgentManager(options);
  }
  return _manager;
}
