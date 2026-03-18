import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { configExists, mergeConfig, removeAliceAgents, detectAvailableModels } from './config-merger.mjs';
import { scaffoldAll } from './workspace-scaffolder.mjs';
import { readManifest, writeManifest } from './manifest.mjs';
import {
  promptInstallMode,
  promptUserInfo,
  promptModelPreset,
  promptCustomModel,
  promptTier,
  promptLicenseKey,
  confirm,
  choose,
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

/**
 * On Linux, Docker requires the user to be in the docker group.
 * Detect this early and warn before OpenClaw's own preflight fails cryptically.
 */
function checkLinuxDockerPermissions() {
  if (process.platform !== 'linux') return;

  try {
    execSync('which docker', { stdio: 'pipe' });
  } catch {
    return; // Docker not installed — not our problem
  }

  try {
    execSync('docker ps', { stdio: 'pipe' });
    return; // Works fine — user is in docker group
  } catch (err) {
    const msg = err.stderr?.toString() || '';
    const isPermissionIssue =
      msg.includes('permission denied') ||
      msg.includes('Got permission denied') ||
      msg.includes('Cannot connect to the Docker daemon') ||
      msg.includes('connect: permission denied');

    if (isPermissionIssue) {
      console.log('  ⚠️  Docker permission issue detected.\n');
      console.log('  Your user is not in the docker group. This will cause');
      console.log('  OpenClaw to fail when it tries to access Docker.\n');
      console.log('  Fix this now (recommended):');
      console.log('    sudo usermod -aG docker $USER');
      console.log('    newgrp docker\n');
      console.log('  Or log out and back in after running the usermod command.');
      console.log('  You can also run: npx @robbiesrobotics/alice-agents --doctor');
      console.log('  after fixing to verify the issue is resolved.\n');
    }
  }
}

async function detectRuntime() {
  // Check for NemoClaw binary
  try {
    execSync('nemoclaw --version', { stdio: 'pipe' });
    return 'nemoclaw';
  } catch {}

  // Check for NemoClaw directory
  const nemoclawDir = join(process.env.HOME || '', '.nemoclaw');
  if (existsSync(nemoclawDir)) return 'nemoclaw';

  // Fall back to OpenClaw
  return 'openclaw';
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

async function installRuntime(auto) {
  console.log('  ⚠️  No agent runtime detected.\n');
  console.log('  A.L.I.C.E. requires a compatible runtime. We recommend NemoClaw —');
  console.log("  NVIDIA's secure, open-source distribution that includes OpenClaw");
  console.log('  plus enterprise-grade security (OpenShell sandbox, local AI models).\n');

  let choice;
  if (auto) {
    choice = 'nemoclaw';
  } else {
    choice = await choose('  Which would you like to install?', [
      { label: 'NemoClaw (Recommended)', value: 'nemoclaw' },
      { label: 'OpenClaw only', value: 'openclaw' },
    ]);
  }

  if (choice === 'nemoclaw') {
    console.log('  📦 Installing NemoClaw...\n');
    try {
      execSync('curl -fsSL https://nvidia.com/nemoclaw.sh | bash', { stdio: 'inherit' });
      console.log('\n  ✔  NemoClaw installed — agents will run in OpenShell sandbox\n');
    } catch (err) {
      console.error('\n  ❌ Failed to install NemoClaw. Try manually:');
      console.error('     curl -fsSL https://nvidia.com/nemoclaw.sh | bash\n');
      process.exit(1);
    }
  } else {
    console.log('  📦 Installing OpenClaw...\n');
    try {
      execSync('npm install -g openclaw', { stdio: 'inherit' });
      console.log('\n  ✔  OpenClaw installed\n');
    } catch (err) {
      console.error('\n  ❌ Failed to install OpenClaw. Try manually:');
      console.error('     npm install -g openclaw\n');
      process.exit(1);
    }
  }

  // Run openclaw configure
  try {
    execSync('openclaw configure', { stdio: 'inherit' });
    console.log('\n  ✓ OpenClaw configured\n');
  } catch {
    console.error('\n  ⚠️  Configuration incomplete. Run manually:');
    console.error('     openclaw configure');
    console.error(`     Then: npx @robbiesrobotics/alice-agents\n`);
    process.exit(1);
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAgentRegistry() {
  const raw = readFileSync(join(__dirname, '..', 'templates', 'agents-starter.json'), 'utf8');
  return JSON.parse(raw);
}

function printBanner() {
  console.log();
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║                                                   ║');
  console.log('  ║   🧠  A.L.I.C.E. Agent Framework Installer       ║');
  console.log('  ║                                                   ║');
  console.log('  ║   Adaptive Learning & Intelligent Coordination    ║');
  console.log('  ║   Engine — 10 starter agents, one conversation.    ║');
  console.log('  ║                                                   ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log();
}

function printSummary(mode, tier, agents, preset, userInfo, detectedModels) {
  const modelLabel =
    preset === 'detected'
      ? `${detectedModels?.primary || 'your configured model'} (detected)`
      : preset === 'custom'
        ? `custom`
        : preset;

  console.log('\n  ── Install Summary ──────────────────────────────');
  console.log(`  Mode:      ${mode}`);
  console.log(`  Tier:      ${tier} (${agents.length} agents)`);
  console.log(`  Model:     ${modelLabel}`);
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

  // Check health flag first (before banner)
  if (process.argv.includes('--health')) {
    const healthPath = join(process.env.HOME, '.openclaw', '.alice-health-alert.json');
    if (existsSync(healthPath)) {
      const alerts = JSON.parse(readFileSync(healthPath, 'utf8'));
      console.log('\n⚠️  A.L.I.C.E. Health Report\n');
      for (const alert of alerts.alerts) {
        console.log(`  [${alert.severity}] ${alert.category}: ${alert.field}`);
        console.log(`    ${alert.description}\n`);
      }
      process.exit(0);
    }
    console.log('✅ A.L.I.C.E. is healthy\n');
    process.exit(0);
  }

  printBanner();

  // 0. Linux Docker permission check — warn early before OpenClaw preflight fails
  checkLinuxDockerPermissions();

  // 1. Detect OpenClaw — offer to install if missing
  if (!isOpenClawInstalled() || !configExists()) {
    await installRuntime(auto);
  }

  // Final check
  if (!configExists()) {
    console.error('  ❌ OpenClaw config not found. Run: openclaw configure\n');
    process.exit(1);
  }

  // 1b. Check for OpenClaw updates
  await checkForOpenClawUpdate(auto);

  const runtime = await detectRuntime();
  if (runtime === 'nemoclaw') {
    console.log('  ✔  NemoClaw detected — agents will run in OpenShell sandbox (secure mode)\n');
  } else {
    console.log('  ✔  OpenClaw detected\n');
    console.log('  💡 Tip: Upgrade to NemoClaw for enterprise security: https://nvidia.com/nemoclaw\n');
  }

  // Detect what models the user already has configured
  const detectedModels = detectAvailableModels();
  if (detectedModels?.hasModel) {
    console.log(`  ✔  Detected configured model: ${detectedModels.primary}`);
    if (detectedModels.providers.length > 0) {
      console.log(`     Providers: ${detectedModels.providers.join(', ')}\n`);
    } else {
      console.log();
    }
  } else {
    console.log('  ℹ  No model configured yet — you\'ll be prompted to choose one.\n');
  }

  const allAgents = loadAgentRegistry();

  // 2. Install mode
  let mode;
  if (options.modeOverride) {
    mode = options.modeOverride;
  } else if (auto) {
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
    // Non-interactive: use whatever the user already has configured.
    // Only fall back to sonnet if nothing is detected (e.g. fresh OpenClaw install
    // where the user explicitly set up Claude credentials).
    preset = detectedModels?.hasModel ? 'detected' : 'sonnet';
  } else {
    preset = await promptModelPreset(detectedModels);
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

  if (tier === 'pro') {
    const { checkProLicense, validateLicenseRemote, storeLicense, isValidFormat } = await import('./license.mjs');

    const existing = await checkProLicense();

    if (existing.licensed) {
      console.log(`  ✅ Pro license found (${existing.key.slice(0, 12)}...)`);
    } else if (auto) {
      // --yes flag: skip interactive prompt, fallback to Starter if no stored license
      console.log('');
      console.log('  ℹ️  Pro tier requires a license key.');
      console.log('  Run without --yes to enter your license key.');
      console.log('  Falling back to Starter tier.');
      console.log('  Purchase a license at: https://getalice.av3.ai/pricing');
      tier = 'starter';
    } else {
      // No stored license — prompt for key
      let key = '';
      let attempts = 0;

      while (attempts < 3) {
        key = await promptLicenseKey();

        if (!isValidFormat(key)) {
          console.log('  ❌ Invalid format. Key must be ALICE-XXXX-XXXX-XXXX');
          attempts++;
          continue;
        }

        console.log('  Validating key...');
        const result = await validateLicenseRemote(key);

        if (result.valid) {
          storeLicense(key);
          if (result.message === 'offline') {
            console.log('  ✅ Key stored (offline — will validate on next run)');
          } else {
            console.log('  ✅ License verified! Welcome to A.L.I.C.E. Pro.');
          }
          break;
        } else {
          console.log(`  ❌ Invalid key: ${result.message ?? 'Not recognized'}`);
          attempts++;

          if (attempts >= 3) {
            console.log('');
            console.log('  Too many invalid attempts. Falling back to Starter tier.');
            console.log('  Purchase a license at: https://getalice.av3.ai/pricing');
            tier = 'starter'; // fallback gracefully
          }
        }
      }
    }
  }

  const agents = allAgents;

  // 6. Confirmation
  printSummary(mode, tier, agents, preset, userInfo, detectedModels);

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
  const finalRuntime = await detectRuntime();
  if (finalRuntime === 'nemoclaw') {
    console.log('  🔒 Running in secure mode — OpenShell sandbox active\n');
  }
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
