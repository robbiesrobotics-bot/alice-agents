import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { configExists, mergeConfig, removeAliceAgents } from './config-merger.mjs';
import { scaffoldAll } from './workspace-scaffolder.mjs';
import { readManifest, writeManifest } from './manifest.mjs';
import {
  promptInstallMode,
  promptUserInfo,
  promptModelPreset,
  promptCustomModel,
  promptTier,
  confirm,
  input,
  closePrompt,
  detectUserName,
  detectTimezone,
} from './prompter.mjs';

function isOpenClawInstalled() {
  try {
    execSync('which openclaw', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getOpenClawVersion() {
  try {
    const output = execSync('openclaw --version', { stdio: 'pipe', encoding: 'utf8' });
    const match = output.match(/(\d{4}\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function getLatestNpmVersion() {
  try {
    const output = execSync('npm view openclaw version', { stdio: 'pipe', encoding: 'utf8' });
    return output.trim();
  } catch {
    return null;
  }
}

async function checkForOpenClawUpdate(auto) {
  const current = getOpenClawVersion();
  if (!current) return;

  console.log(`  OpenClaw version: ${current}`);

  const latest = getLatestNpmVersion();
  if (!latest) {
    console.log('  ⚠️  Could not check for updates (npm registry unreachable)\n');
    return;
  }

  if (current === latest) {
    console.log(`  ✓ OpenClaw is up to date (${latest})\n`);
    return;
  }

  console.log(`  ⬆️  Update available: ${current} → ${latest}\n`);

  let shouldUpdate = auto;
  if (!auto) {
    shouldUpdate = await confirm('  Update OpenClaw to latest before continuing?');
  }

  if (shouldUpdate) {
    console.log('  📦 Updating OpenClaw...\n');
    try {
      execSync('npm install -g openclaw@latest', { stdio: 'inherit' });
      const updated = getOpenClawVersion();
      console.log(`\n  ✓ OpenClaw updated to ${updated || latest}\n`);
    } catch {
      console.log('\n  ⚠️  Update failed — continuing with current version\n');
    }
  } else {
    console.log();
  }
}

async function installOpenClaw(auto) {
  console.log('  ⚠️  OpenClaw is not installed.\n');

  if (!auto) {
    const shouldInstall = await confirm('  Would you like to install OpenClaw now?');
    if (!shouldInstall) {
      console.log('\n  Install OpenClaw manually:');
      console.log('    npm install -g openclaw');
      console.log('    openclaw configure');
      console.log(`\n  Then re-run: npx @robbiesrobotics/alice-agents\n`);
      process.exit(0);
    }
  }

  console.log('  📦 Installing OpenClaw...\n');
  try {
    execSync('npm install -g openclaw', { stdio: 'inherit' });
    console.log('\n  ✓ OpenClaw installed\n');
  } catch (err) {
    console.error('\n  ❌ Failed to install OpenClaw. Try manually:');
    console.error('     npm install -g openclaw\n');
    process.exit(1);
  }

  // Check if openclaw needs configuration
  if (!configExists()) {
    console.log('  OpenClaw needs initial configuration before A.L.I.C.E. can be set up.');
    console.log('  This will set up your API keys, channels, and preferences.\n');

    if (!auto) {
      const shouldConfigure = await confirm('  Run openclaw configure now?');
      if (shouldConfigure) {
        try {
          execSync('openclaw configure', { stdio: 'inherit' });
          console.log('\n  ✓ OpenClaw configured\n');
        } catch {
          console.error('\n  ⚠️  Configuration incomplete. Run manually:');
          console.error('     openclaw configure');
          console.error(`     npx @robbiesrobotics/alice-agents\n`);
          process.exit(1);
        }
      } else {
        console.log('\n  Run these commands when ready:');
        console.log('    openclaw configure');
        console.log(`    npx @robbiesrobotics/alice-agents\n`);
        process.exit(0);
      }
    } else {
      console.error('  ❌ OpenClaw is installed but not configured.');
      console.error('     Run: openclaw configure');
      console.error(`     Then: npx @robbiesrobotics/alice-agents\n`);
      process.exit(1);
    }
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAgentRegistry() {
  const raw = readFileSync(join(__dirname, '..', 'templates', 'agents.json'), 'utf8');
  return JSON.parse(raw);
}

function filterByTier(agents, tier) {
  if (tier === 'pro') return agents;
  return agents.filter((a) => a.tier === 'starter');
}

function printBanner() {
  console.log();
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║                                                   ║');
  console.log('  ║   🧠  A.L.I.C.E. Agent Framework Installer       ║');
  console.log('  ║                                                   ║');
  console.log('  ║   Adaptive Learning & Intelligent Coordination    ║');
  console.log('  ║   Engine — 28 specialists, one conversation.      ║');
  console.log('  ║                                                   ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log();
}

function printSummary(mode, tier, agents, preset, userInfo) {
  console.log('\n  ── Install Summary ──────────────────────────────');
  console.log(`  Mode:      ${mode}`);
  console.log(`  Tier:      ${tier} (${agents.length} agents)`);
  console.log(`  Model:     ${preset}`);
  console.log(`  User:      ${userInfo.name}`);
  console.log(`  Timezone:  ${userInfo.timezone}`);
  console.log('  ─────────────────────────────────────────────────');
  console.log();
  console.log('  Agents:');
  for (const a of agents) {
    console.log(`    ${a.emoji}  ${a.name.padEnd(10)} — ${a.domain}`);
  }
  console.log();
}

export async function runInstall(options = {}) {
  const auto = options.yes || false;

  printBanner();

  // 1. Detect OpenClaw — offer to install if missing
  if (!isOpenClawInstalled() || !configExists()) {
    await installOpenClaw(auto);
  }

  // Final check
  if (!configExists()) {
    console.error('  ❌ OpenClaw config not found. Run: openclaw configure\n');
    process.exit(1);
  }

  // 1b. Check for OpenClaw updates
  await checkForOpenClawUpdate(auto);

  console.log('  ✓ OpenClaw detected\n');

  const allAgents = loadAgentRegistry();

  // 2. Install mode
  let mode;
  if (auto) {
    const manifest = readManifest();
    mode = manifest ? 'upgrade' : 'fresh';
  } else {
    mode = await promptInstallMode();
  }

  if (mode === 'upgrade') {
    const manifest = readManifest();
    if (!manifest) {
      console.log('  ⚠  No previous install found. Switching to fresh install.\n');
      mode = 'fresh';
    }
  }

  if (mode === 'fresh' && !auto) {
    const ok = await confirm('  ⚠  This will replace the agents section in openclaw.json. Continue?');
    if (!ok) {
      console.log('  Aborted.');
      closePrompt();
      return;
    }
  }

  // 3. User info
  let userInfo;
  if (auto) {
    userInfo = { name: detectUserName(), timezone: detectTimezone(), notes: '' };
  } else {
    console.log('\n  ── About You ───────────────────────────────────\n');
    userInfo = await promptUserInfo();
  }

  // 4. Model preset
  let preset, customModels;
  if (auto) {
    preset = 'sonnet';
  } else {
    preset = await promptModelPreset();
    if (preset === 'custom') {
      customModels = await promptCustomModel();
    }
  }

  // 5. Tier selection
  let tier;
  if (auto) {
    tier = 'starter';
  } else {
    tier = await promptTier();
  }

  const agents = filterByTier(allAgents, tier);

  // 6. Confirmation
  printSummary(mode, tier, agents, preset, userInfo);

  if (!auto) {
    const ok = await confirm('  Proceed with installation?');
    if (!ok) {
      console.log('  Aborted.');
      closePrompt();
      return;
    }
  }

  closePrompt();

  // Execute
  console.log('\n  Installing...\n');

  // Merge config
  const { backupPath, agentCount } = mergeConfig({
    agents,
    mode,
    preset,
    customModels,
  });
  console.log(`  ✓ Config updated (backup: ${backupPath})`);

  // Scaffold workspaces
  const results = scaffoldAll(agents, userInfo);
  let newWorkspaces = 0;
  let updatedWorkspaces = 0;
  for (const r of results) {
    if (r.skipped.length === 0) {
      newWorkspaces++;
    } else {
      updatedWorkspaces++;
    }
  }
  console.log(`  ✓ Workspaces: ${newWorkspaces} created, ${updatedWorkspaces} updated`);

  // Write manifest
  const existing = readManifest();
  writeManifest({
    installedAt: existing?.installedAt,
    tier,
    agents: agents.map((a) => a.id),
    userName: userInfo.name,
    userTimezone: userInfo.timezone,
    modelPreset: preset,
  });
  console.log('  ✓ Manifest written');

  console.log(`\n  🎉 A.L.I.C.E. installed! ${agentCount} agents ready.`);
  console.log('  Restart OpenClaw to activate: openclaw gateway restart\n');
}

export async function runUninstall(options = {}) {
  const auto = options.yes || false;

  console.log('\n  🧠 A.L.I.C.E. Uninstaller\n');

  const manifest = readManifest();
  if (!manifest) {
    console.error('  ❌ No A.L.I.C.E. installation found (no manifest).');
    process.exit(1);
  }

  console.log(`  Found: ${manifest.agents.length} agents installed`);
  console.log(`  Tier: ${manifest.tier}`);
  console.log();

  if (!auto) {
    const { createInterface } = await import('node:readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) => {
      rl.question('  Remove A.L.I.C.E. agents from config? [y/N] ', resolve);
    });
    rl.close();
    if (!answer.toLowerCase().startsWith('y')) {
      console.log('  Aborted.');
      return;
    }
  }

  const { backupPath } = removeAliceAgents(manifest.agents);
  console.log(`  ✓ Agents removed from config (backup: ${backupPath})`);

  if (!auto) {
    const { createInterface } = await import('node:readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) => {
      rl.question('  Also remove workspace directories? [y/N] ', resolve);
    });
    rl.close();
    if (answer.toLowerCase().startsWith('y')) {
      console.log('  ⚠  Workspace removal not implemented (safety measure).');
      console.log('  Remove manually: rm -rf ~/.openclaw/workspace-{agent-id}');
    }
  }

  console.log('\n  ✓ A.L.I.C.E. uninstalled. Restart OpenClaw: openclaw gateway restart\n');
}
