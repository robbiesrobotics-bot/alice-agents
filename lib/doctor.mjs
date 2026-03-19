import { readFileSync, existsSync, accessSync, constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { icons, greenBold, green, red, yellow, cyan, dim, bold,
         printSection, printSeparator, separator } from './colors.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();

function commandExists(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  try {
    execSync(`${probe} ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
const OPENCLAW_DIR = join(HOME, '.openclaw');

const STARTER_AGENTS = [
  'olivia', 'dylan', 'selena', 'devon', 'quinn',
  'felix', 'daphne', 'rowan', 'darius', 'sophie',
];

function check(label, ok, hint) {
  const icon = ok ? icons.ok : icons.fail;
  console.log(`  ${icon}  ${ok ? green(label) : red(label)}`);
  if (!ok && hint) console.log(`     ${dim('→')} ${dim(hint)}`);
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
  if (!commandExists('docker')) {
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
  console.log('');
  printSection('A.L.I.C.E. Doctor');
  console.log(`  ${dim('Diagnostic Report')}`);
  console.log('');
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
    console.log(`\n  ${icons.warn} ${yellow('Cannot continue checks — openclaw.json missing.')}\n`);
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
    console.log(`\n  ${icons.warn} ${yellow('Cannot continue checks — config is invalid JSON.')}\n`);
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
      console.log(`  ${icons.info} ${dim('This will affect OpenClaw features that use Docker.')}\n`);
    } else {
      check('Docker daemon not running or not accessible', false, docker.hint);
    }
  }

  const isWSL = !!process.env.WSL_DISTRO_NAME || !!process.env.WSLENV;
  if (isWSL && docker.present) {
    console.log("  ℹ️  WSL2 detected. If Docker has cgroup issues, run: nemoclaw setup-spark\n");
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

  // 8. Skills disk check
  const skillsManifestPath = join(OPENCLAW_DIR, '.alice-manifest.json');
  const skillsManifestData = (() => {
    try {
      if (!existsSync(skillsManifestPath)) return null;
      return JSON.parse(readFileSync(skillsManifestPath, 'utf8'));
    } catch { return null; }
  })();

  const installedSkills = skillsManifestData?.skills || [];
  if (installedSkills.length > 0) {
    const missingSkills = installedSkills.filter(
      id => !existsSync(join(HOME, '.openclaw', 'skills', id))
    );
    if (missingSkills.length > 0) {
      check(
        `Skills missing on disk: ${missingSkills.join(', ')}`,
        false,
        'Run: npx @robbiesrobotics/alice-agents --skills to reinstall'
      );
      allOk = false;
    } else {
      check(`Skills installed (${installedSkills.length}): ${installedSkills.join(', ')}`, true);
    }
  } else {
    console.log(`  ${dim('–')}  ${dim('No skills installed (optional)')}`);
  }

  // Summary
  console.log('');
  if (allOk) {
    console.log(`  ${icons.ok} ${greenBold('A.L.I.C.E. is healthy!')}`);
  } else {
    console.log(`  ${icons.warn} ${yellow('Issues found')} ${dim('─ follow the hints above to fix them.')}`);
  }
  printSeparator();
  console.log('');

  return allOk;
}
