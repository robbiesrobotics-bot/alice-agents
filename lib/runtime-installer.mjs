/**
 * runtime-installer.mjs — Auto-install missing runtimes for A.L.I.C.E.
 *
 * Handles detecting, offering to install, and installing:
 *   - Hermes Agent (Nous Research)
 *   - OpenClaw
 *   - NemoClaw (NVIDIA)
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { confirm, choose } from './prompter.mjs';

// ── Colors / icons (duplicated from installer.mjs to avoid circular imports) ──
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const greenBold = (s) => `\x1b[1m\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const icons = { ok: '✔', fail: '✗', info: 'ℹ', warn: '⚠' };

// ── Runtime definitions ──────────────────────────────────────────────────────

const RUNTIMES = {
  hermes: {
    name: 'Hermes Agent',
    maker: 'Nous Research',
    emoji: '🧠',
    tagline: 'Self-improving personal AI agent',
    description: [
      'Lightweight — runs on laptops, VPS, even Android.',
      'Self-improving — creates skills from experience, remembers across sessions.',
      'A.L.I.C.E. becomes a team of Hermes skills.',
    ],
    installTime: '~2 minutes',
    platforms: ['Linux', 'macOS', 'WSL2', 'Android/Termux'],
    requiresDocker: false,
    modelCommand: 'hermes model',
    docsUrl: 'https://hermes-agent.nousresearch.com/docs/',
    getInstallCommand() {
      return 'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash';
    },
    isInstalled() {
      const hermesConfig = join(homedir(), '.hermes', 'config.yaml');
      if (!existsSync(hermesConfig)) return false;
      try {
        execSync('hermes version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    getPostInstallSteps() {
      return [
        `Reload your shell: ${cyan('source ~/.bashrc')}  ${dim('(or ~/.zshrc)')}`,
        `Pick a model:      ${cyan('hermes model')}`,
        `Re-run A.L.I.C.E.: ${cyan('npx @robbiesrobotics/alice-agents')}`,
      ];
    },
  },

  openclaw: {
    name: 'OpenClaw',
    maker: 'OpenClaw',
    emoji: '🤖',
    tagline: 'Mature multi-agent orchestration platform',
    description: [
      'Full agent workspaces, subagent spawning, cron, MCP support.',
      '15+ messaging platforms. Mature ecosystem with ClawHub skills.',
      'A.L.I.C.E. becomes an agent workspace tree.',
    ],
    installTime: '~3 minutes',
    platforms: ['Linux', 'macOS', 'Windows', 'WSL2'],
    requiresDocker: false,
    modelCommand: 'openclaw configure',
    docsUrl: 'https://docs.openclaw.ai',
    getInstallCommand() {
      return 'npm install -g openclaw';
    },
    isInstalled() {
      try {
        execSync('openclaw --version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    getPostInstallSteps() {
      return [
        `Set up your model:  ${cyan('openclaw configure')}`,
        `Re-run A.L.I.C.E.:  ${cyan('npx @robbiesrobotics/alice-agents')}`,
      ];
    },
  },

  nemoclaw: {
    name: 'NemoClaw',
    maker: 'NVIDIA',
    emoji: '🛡️',
    tagline: 'Enterprise-grade agents with sandboxing',
    description: [
      'Agents run isolated — Landlock + seccomp + network namespace sandboxing.',
      'Built on OpenClaw, hardened by NVIDIA. Best for sensitive data.',
      'A.L.I.C.E. runs inside the OpenShell sandbox.',
    ],
    installTime: '~20-30 minutes',
    platforms: ['Linux', 'macOS (Docker)', 'DGX Spark', 'WSL2'],
    requiresDocker: true,
    modelCommand: '(configured during install)',
    docsUrl: 'https://docs.nvidia.com/nemoclaw/latest/',
    getInstallCommand() {
      return 'curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash';
    },
    isInstalled() {
      try {
        execSync('nemoclaw --version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    getPostInstallSteps() {
      return [
        `NemoClaw configures your model during onboard.`,
        `Connect:            ${cyan('nemoclaw <name> connect')}`,
        `Re-run A.L.I.C.E.:  ${cyan('npx @robbiesrobotics/alice-agents --runtime nemoclaw')}`,
      ];
    },
  },
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Show the runtime selection wizard and install the chosen runtime.
 * Returns the runtime key ('hermes' | 'openclaw' | 'nemoclaw') or null if user skips.
 */
export async function promptAndInstallRuntime(forceRuntime = null) {
  // If user specified --runtime X but it's not installed, install that one
  if (forceRuntime && RUNTIMES[forceRuntime]) {
    return await installSpecificRuntime(forceRuntime);
  }

  // No runtime at all — show the full wizard
  printRuntimeWizard();

  const choice = await choose(
    '  Which runtime do you want to install?',
    ['1', '2', '3', 'skip'],
    '1'
  );

  const map = { '1': 'hermes', '2': 'openclaw', '3': 'nemoclaw' };
  const picked = map[choice];

  if (!picked) {
    console.log(`\n  ${dim('Skipped. Install a runtime manually and re-run this installer.')}\n`);
    return null;
  }

  return await installSpecificRuntime(picked);
}

/**
 * Install a specific runtime, show progress, verify, and return the key.
 */
async function installSpecificRuntime(key) {
  const rt = RUNTIMES[key];
  if (!rt) return null;

  // Pre-flight checks
  if (rt.requiresDocker) {
    const dockerOk = checkDockerAvailable();
    if (!dockerOk) {
      console.log(`\n  ${icons.warn} ${yellow('Docker is required for ' + rt.name + ' but does not appear to be running.')}`);
      console.log(`  Start Docker (or Colima on macOS) and try again.\n`);
      console.log(`  ${dim('Docs: ' + rt.docsUrl)}\n`);
      return null;
    }
  }

  if (key === 'nemoclaw') {
    const platform = process.platform;
    if (platform === 'darwin') {
      console.log(`\n  ${icons.warn} ${yellow('NemoClaw on macOS requires Docker Desktop or Colima.')}`);
      console.log(`  ${dim('Make sure one is running before proceeding.')}`);
      const ok = await confirm('  Continue with NemoClaw install?', false);
      if (!ok) return null;
    }
  }

  // Confirm
  console.log(`\n  ${bold(rt.emoji + '  Installing ' + rt.name + ' (' + rt.installTime + ')')}\n`);
  console.log(`  ${dim(rt.getInstallCommand())}\n`);

  const ok = await confirm('  Proceed?', true);
  if (!ok) return null;

  // Run install
  console.log('');
  try {
    execSync(rt.getInstallCommand(), { stdio: 'inherit', timeout: 10 * 60 * 1000 }); // 10 min timeout
  } catch (err) {
    console.log(`\n  ${icons.fail} ${red('Installation failed.')}`);
    console.log(`  Install manually: ${cyan(rt.getInstallCommand())}`);
    console.log(`  Docs: ${dim(rt.docsUrl)}\n`);
    return null;
  }

  // Verify
  console.log('');
  if (rt.isInstalled()) {
    console.log(`  ${icons.ok} ${green(rt.name + ' installed successfully!')}`);
  } else {
    console.log(`  ${icons.warn} ${yellow('Install completed but ' + rt.name + ' not detected in PATH.')}`);
    console.log(`  You may need to reload your shell: ${cyan('source ~/.bashrc')}`);
  }

  // Post-install steps
  const steps = rt.getPostInstallSteps();
  if (steps.length) {
    console.log(`\n  ${bold('Next steps:')}`);
    for (const step of steps) {
      console.log(`    ${step}`);
    }
    console.log('');
  }

  return key;
}

/**
 * Check if Docker is available and running.
 */
function checkDockerAvailable() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if any supported runtime is installed.
 * Returns the runtime key or null.
 */
export function detectAnyRuntime() {
  for (const [key, rt] of Object.entries(RUNTIMES)) {
    if (rt.isInstalled()) return key;
  }
  return null;
}

/**
 * Get runtime info object.
 */
export function getRuntimeInfo(key) {
  return RUNTIMES[key] || null;
}

/**
 * Print the runtime selection wizard.
 */
function printRuntimeWizard() {
  console.log('');
  console.log('  ╭─ Choose Your Runtime ───────────────────────────────────────╮');
  console.log('  │                                                             │');
  console.log('  │  A.L.I.C.E. needs a runtime to manage your agent team.      │');
  console.log('  │                                                             │');
  console.log('  │  Three options — they work great together too:              │');
  console.log('  │                                                             │');
  console.log('  │  1. 🧠 Hermes Agent (recommended)                           │');
  console.log('  │     Self-improving personal AI agent by Nous Research.      │');
  console.log('  │     Lightweight, runs anywhere — laptop, VPS, phone.        │');
  console.log('  │     A.L.I.C.E. becomes a team of Hermes skills.             │');
  console.log('  │     Install: ~2 minutes                                     │');
  console.log('  │                                                             │');
  console.log('  │  2. 🤖 OpenClaw                                             │');
  console.log('  │     Mature multi-agent orchestration platform.               │');
  console.log('  │     Agent workspaces, subagent spawning, cron, MCP.          │');
  console.log('  │     A.L.I.C.E. becomes an agent workspace tree.             │');
  console.log('  │     Install: ~3 minutes                                     │');
  console.log('  │                                                             │');
  console.log('  │  3. 🛡️ NemoClaw (NVIDIA)                                    │');
  console.log('  │     Enterprise-grade OpenClaw with OpenShell sandboxing.     │');
  console.log('  │     Agents run isolated — Landlock + seccomp + netns.        │');
  console.log('  │     Best for teams handling sensitive data.                  │');
  console.log('  │     Requires Docker · Install: ~20-30 minutes               │');
  console.log('  │                                                             │');
  console.log('  │  Not sure? Start with Hermes — it\'s the fastest path.       │');
  console.log('  │  You can add OpenClaw or NemoClaw later.                    │');
  console.log('  │                                                             │');
  console.log('  ╰─────────────────────────────────────────────────────────────╯');
  console.log('');
}

/**
 * Print "runtime not detected" message (used before the wizard).
 */
export function printNoRuntimeDetected() {
  console.log('');
  console.log(`  ${icons.warn} ${yellow('No supported runtime detected')}`);
  console.log('');
  console.log('  A.L.I.C.E. requires one of:');
  console.log(`    ${cyan('1.')} Hermes Agent  ${dim('— personal AI agent, self-improving')}`);
  console.log(`    ${cyan('2.')} OpenClaw       ${dim('— multi-agent orchestration, mature ecosystem')}`);
  console.log(`    ${cyan('3.')} NemoClaw       ${dim('— enterprise sandboxed agents (NVIDIA)')}`);
  console.log('');
}
