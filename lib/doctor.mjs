import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const OPENCLAW_DIR = join(HOME, '.openclaw');

const STARTER_AGENTS = [
  'olivia', 'dylan', 'selena', 'devon', 'quinn',
  'felix', 'daphne', 'rowan', 'darius', 'sophie',
];

function check(label, ok, hint) {
  const icon = ok ? '✓' : '✗';
  console.log(`  ${icon}  ${label}`);
  if (!ok && hint) console.log(`     → ${hint}`);
  return ok;
}

function getRuntime() {
  try {
    const v = execSync('nemoclaw --version', { stdio: 'pipe', encoding: 'utf8' }).trim();
    return { name: 'NemoClaw', ok: true, version: v };
  } catch {}
  try {
    const v = execSync('openclaw --version', { stdio: 'pipe', encoding: 'utf8' }).trim();
    return { name: 'OpenClaw', ok: true, version: v };
  } catch {}
  return { name: 'openclaw/nemoclaw', ok: false, version: null };
}

function loadConfig() {
  const configPath = join(OPENCLAW_DIR, 'openclaw.json');
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return 'invalid';
  }
}

export async function runDoctor() {
  console.log('\n  🩺 A.L.I.C.E. Doctor — Diagnostic Report\n');
  let allOk = true;

  // 1. Runtime check
  const runtime = getRuntime();
  const runtimeOk = check(
    runtime.ok
      ? `${runtime.name} installed (${runtime.version})`
      : `${runtime.name} not found`,
    runtime.ok,
    'Install OpenClaw: npm install -g openclaw'
  );
  allOk = allOk && runtimeOk;

  // 2. Config exists and valid JSON
  const configPath = join(OPENCLAW_DIR, 'openclaw.json');
  const configExists = existsSync(configPath);
  check('openclaw.json exists', configExists, 'Run: openclaw configure');

  if (!configExists) {
    allOk = false;
    console.log('\n  ⚠️  Cannot continue checks — openclaw.json missing.\n');
    return false;
  }

  const config = loadConfig();
  const configValid = config !== null && config !== 'invalid';
  check(
    'openclaw.json is valid JSON',
    configValid,
    `Fix JSON syntax in ${configPath}`
  );
  if (!configValid) {
    allOk = false;
    console.log('\n  ⚠️  Cannot continue checks — config is invalid JSON.\n');
    return false;
  }

  // 3. A.L.I.C.E. agents in config
  const configAgents = Array.isArray(config.agents) ? config.agents : [];
  const agentsInConfig = configAgents
    .filter((a) => a && STARTER_AGENTS.includes(a.id))
    .map((a) => a.id);

  const agentsOk = agentsInConfig.length > 0;
  check(
    agentsOk
      ? `A.L.I.C.E. agents in config: ${agentsInConfig.join(', ')}`
      : 'No A.L.I.C.E. agents found in config',
    agentsOk,
    'Run: npx @robbiesrobotics/alice-agents to install'
  );
  allOk = allOk && agentsOk;

  // Check for missing agents from full starter set
  if (agentsInConfig.length > 0 && agentsInConfig.length < STARTER_AGENTS.length) {
    const missing = STARTER_AGENTS.filter((id) => !agentsInConfig.includes(id));
    check(
      `All starter agents present (missing: ${missing.join(', ')})`,
      false,
      'Run: npx @robbiesrobotics/alice-agents --update'
    );
    allOk = false;
  } else if (agentsInConfig.length === STARTER_AGENTS.length) {
    check('All starter agents present', true);
  }

  // 4. Agent workspaces exist on disk
  if (agentsInConfig.length > 0) {
    let missingWorkspaces = [];
    for (const id of agentsInConfig) {
      const wsDir = join(OPENCLAW_DIR, `workspace-${id}`);
      if (!existsSync(wsDir)) {
        missingWorkspaces.push(id);
      }
    }
    const workspacesOk = missingWorkspaces.length === 0;
    check(
      workspacesOk
        ? `Agent workspaces exist (${agentsInConfig.length})`
        : `Agent workspaces missing: ${missingWorkspaces.join(', ')}`,
      workspacesOk,
      'Run: npx @robbiesrobotics/alice-agents --update to scaffold missing workspaces'
    );
    allOk = allOk && workspacesOk;
  }

  // 5. At least one model/provider configured
  let modelOk = false;
  let modelLabel = null;

  if (config.default_model) {
    modelOk = true;
    modelLabel = config.default_model;
  } else if (config.models && Object.keys(config.models).length > 0) {
    modelOk = true;
    modelLabel = Object.keys(config.models)[0];
  } else if (config.providers && Object.keys(config.providers).length > 0) {
    modelOk = true;
    modelLabel = Object.keys(config.providers)[0];
  } else if (config.llm && Object.keys(config.llm).length > 0) {
    modelOk = true;
    modelLabel = Object.keys(config.llm)[0];
  }

  check(
    modelOk
      ? `Model/provider configured: ${modelLabel}`
      : 'No model/provider configured',
    modelOk,
    'Run: openclaw configure to set up a model provider'
  );
  allOk = allOk && modelOk;

  // Summary
  console.log();
  if (allOk) {
    console.log('  ✅ A.L.I.C.E. is healthy!\n');
  } else {
    console.log('  ⚠️  Issues found — follow the hints above to fix them.\n');
  }

  return allOk;
}
