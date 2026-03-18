import { readFileSync, existsSync, accessSync, constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
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

/**
 * Check Docker socket accessibility.
 * On Linux, Docker often requires sudo unless the user is in the docker group.
 * Returns { present, accessible, needsSudo, hint }
 */
function checkDockerEnvironment() {
  const isLinux = platform() === 'linux';

  // Check if docker binary exists at all
  let dockerInstalled = false;
  try {
    execSync('which docker', { stdio: 'pipe' });
    dockerInstalled = true;
  } catch {
    // Docker not installed — not a blocker unless openclaw needs it
    return { present: false, accessible: false, needsSudo: false, hint: null };
  }

  // Try docker ps without sudo
  try {
    execSync('docker ps', { stdio: 'pipe' });
    return { present: true, accessible: true, needsSudo: false, hint: null };
  } catch (err) {
    const msg = err.stderr?.toString() || '';

    // Permission denied / cannot connect to daemon — classic sudo-required scenario
    const isPermissionIssue =
      msg.includes('permission denied') ||
      msg.includes('Got permission denied') ||
      msg.includes('Cannot connect to the Docker daemon') ||
      msg.includes('dial unix') ||
      msg.includes('connect: permission denied');

    if (isLinux && isPermissionIssue) {
      // Try sudo docker ps to confirm it works with elevated perms
      let sudoWorks = false;
      try {
        execSync('sudo docker ps', { stdio: 'pipe', timeout: 5000 });
        sudoWorks = true;
      } catch {}

      return {
        present: true,
        accessible: false,
        needsSudo: true,
        sudoWorks,
        hint: sudoWorks
          ? `Docker requires sudo on this machine. Fix with:\n     sudo usermod -aG docker $USER && newgrp docker\n     Then log out and back in. Or run OpenClaw with sudo (not recommended for production).`
          : `Docker found but not accessible. Check that the Docker daemon is running:\n     sudo systemctl start docker\n     Then add your user to the docker group:\n     sudo usermod -aG docker $USER && newgrp docker`,
      };
    }

    // Docker is installed but daemon isn't running
    if (msg.includes('Is the docker daemon running') || msg.includes('Cannot connect')) {
      return {
        present: true,
        accessible: false,
        needsSudo: false,
        hint: 'Docker daemon is not running. Start it:\n     sudo systemctl start docker   (Linux)\n     open -a Docker                  (macOS)',
      };
    }

    return { present: true, accessible: false, needsSudo: false, hint: `docker ps failed: ${msg.slice(0, 100)}` };
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

  // 6. Docker environment check (Linux-aware)
  const docker = checkDockerEnvironment();
  if (docker.present) {
    if (docker.accessible) {
      check('Docker accessible', true);
    } else if (docker.needsSudo) {
      check(
        'Docker requires sudo — user not in docker group',
        false,
        docker.hint
      );
      // Docker permission issue is a warning, not a hard failure for A.L.I.C.E. itself
      // but it will break OpenClaw's own Docker features
      console.log('  ℹ️  Note: This will affect OpenClaw features that use Docker.\n');
    } else {
      check('Docker daemon not running or not accessible', false, docker.hint);
    }
  }
  // If docker not present at all, skip silently — not required for all setups

  // 7. License check
  const { checkProLicense } = await import('./license.mjs');
  const manifest = (() => {
    try {
      const mPath = join(OPENCLAW_DIR, '.alice-manifest.json');
      if (!existsSync(mPath)) return null;
      return JSON.parse(readFileSync(mPath, 'utf8'));
    } catch {
      return null;
    }
  })();

  const licenseResult = await checkProLicense();
  if (manifest?.tier === 'pro' || licenseResult.licensed) {
    if (licenseResult.licensed) {
      const maskedKey = licenseResult.key.slice(0, 13) + '****';
      check(
        `Pro license: ${maskedKey} (stored at ~/.alice/license)`,
        true
      );
    } else {
      check(
        'Pro license: not found (running Starter tier)',
        false,
        'Purchase a Pro license at: https://getalice.av3.ai/pricing'
      );
      allOk = false;
    }
  } else {
    // Starter tier — just note no license needed
    check('License: Starter tier (no license required)', true);
  }

  // Summary
  console.log();
  if (allOk) {
    console.log('  ✅ A.L.I.C.E. is healthy!\n');
  } else {
    console.log('  ⚠️  Issues found — follow the hints above to fix them.\n');
  }

  return allOk;
}
