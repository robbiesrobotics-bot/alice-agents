import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
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
import { c, bold, dim, green, greenBold, red, yellow, cyan, gray,
         icons, separator, printSection, printSeparator, printBox,
         printStepDone, printStepFail, printStepSkip } from './colors.mjs';
import { runSkillsWizardStep } from './skills.mjs';

function commandExists(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  try {
    execSync(`${probe} ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function isOpenClawInstalled() {
  return commandExists('openclaw');
}

/**
 * On Linux, Docker requires the user to be in the docker group.
 * Detect this early and warn before OpenClaw's own preflight fails cryptically.
 */
function checkLinuxDockerPermissions() {
  if (process.platform !== 'linux') return;

  if (!commandExists('docker')) {
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
      console.log(`  ${icons.warn} ${yellow('Docker permission issue detected.')}\n`);
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
  const nemoclawDir = join(homedir(), '.nemoclaw');
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

  console.log(`  ${dim('OpenClaw version:')} ${green(current)}`);

  const latest = getLatestNpmVersion();
  if (!latest) {
    console.log(`  ${icons.warn} ${yellow('Could not check for updates (npm registry unreachable)')}\n`);
    return;
  }

  if (current === latest) {
    printStepDone('OpenClaw is up to date', latest);
    console.log('');
    return;
  }

  console.log(`  ⬆️  Update available: ${current} → ${latest}\n`);

  let shouldUpdate = auto;
  if (!auto) {
    shouldUpdate = await confirm('  Update OpenClaw to latest before continuing?');
  }

  if (shouldUpdate) {
    console.log(`  ${icons.pkg} ${bold('Updating OpenClaw...')}\n`);
    try {
      execSync('npm install -g openclaw@latest', { stdio: 'inherit' });
      const updated = getOpenClawVersion();
      console.log('');
      printStepDone('OpenClaw updated', updated || latest);
      console.log('');
    } catch {
      console.log(`\n  ${icons.warn} ${yellow('Update failed — continuing with current version')}\n`);
    }
  } else {
    console.log();
  }
}

async function installRuntime(auto) {
  const plat = process.platform;
  const isWSL = !!process.env.WSL_DISTRO_NAME || !!process.env.WSLENV;

  console.log(`  ${icons.warn} ${yellow('No agent runtime detected.')}\n`);

  // Windows (native, not WSL)
  if (plat === "win32") {
    console.log("  A.L.I.C.E. requires OpenClaw or NemoClaw to run.\n");
    console.log("  NemoClaw (the recommended runtime with enterprise sandbox) requires");
    console.log("  Linux — but you can get it on Windows via WSL2 (Windows Subsystem for Linux).\n");

    const wslAvailable = commandExists("wsl");

    if (wslAvailable) {
      let wslDistros = "";
      try {
        // WSL --list output on Windows can be UTF-16LE encoded — decode from Buffer
        const raw = execSync("wsl --list --quiet", { stdio: "pipe" });
        wslDistros = raw.toString("utf16le").replace(/\0/g, "").trim();
      } catch {}

      const hasDistro = wslDistros.length > 0 &&
        !wslDistros.toLowerCase().includes("no installed") &&
        !wslDistros.toLowerCase().includes("has no");

      if (hasDistro) {
        console.log("  ✔  WSL2 detected with an installed distro.\n");
        console.log("  Recommended: Install NemoClaw inside WSL2 for full sandbox support.\n");

        let choice;
        if (auto) {
          choice = "wsl-nemoclaw";
        } else {
          choice = await choose("  How would you like to proceed?", [
            { label: "Install NemoClaw inside WSL2 (Recommended)", value: "wsl-nemoclaw" },
            { label: "Install OpenClaw for Windows (no sandbox)", value: "openclaw-win" },
          ]);
        }

        if (choice === "wsl-nemoclaw") {
          console.log("\n  📦 Installing NemoClaw inside WSL2...\n");
          console.log("  This will run the NemoClaw installer in your default WSL2 distro.\n");
          try {
            execSync(
              "wsl bash -c \"curl -fsSL https://nvidia.com/nemoclaw.sh | bash\"",
              { stdio: "inherit" }
            );
            console.log("\n  ✔  NemoClaw installed in WSL2.\n");
            console.log("  ℹ️  Note: On Ubuntu 24.04 / WSL2, Docker may need a cgroup fix.");
            console.log("      If onboard fails, run inside WSL2: nemoclaw setup-spark\n");
          } catch {
            console.error("\n  ❌ WSL2 NemoClaw install failed. Try manually inside WSL2:");
            console.error("     wsl bash -c \"curl -fsSL https://nvidia.com/nemoclaw.sh | bash\"\n");
            process.exit(1);
          }
        } else {
          console.log("\n  📦 Installing OpenClaw for Windows...\n");
          try {
            execSync("npm install -g openclaw", { stdio: "inherit" });
            console.log("\n  ✔  OpenClaw installed.\n");
            console.log("  💡 Tip: Set up WSL2 + NemoClaw later for sandbox mode.\n");
          } catch {
            console.error("\n  ❌ Failed to install OpenClaw:");
            console.error("     npm install -g openclaw\n");
            process.exit(1);
          }
        }
      } else {
        console.log("  ℹ️  WSL is installed but no Linux distro is set up yet.\n");

        let shouldSetup;
        if (auto) {
          shouldSetup = true;
        } else {
          shouldSetup = await confirm(
            "  Set up Ubuntu in WSL2 now and install NemoClaw? (Recommended)"
          );
        }

        if (shouldSetup) {
          console.log("\n  📦 Setting up Ubuntu in WSL2...\n");
          console.log("  This will install Ubuntu and then install NemoClaw inside it.");
          console.log("  You may be prompted to create a Linux username and password.\n");
          try {
            // Modern syntax (Win11/Win10 modern): wsl --install Ubuntu
            // On older Win10 builds, -d flag is required: wsl --install --distribution Ubuntu
            execSync("wsl --install Ubuntu", { stdio: "inherit" });
            execSync("wsl --set-default-version 2", { stdio: "inherit" });
            console.log("\n  ✔  Ubuntu installed in WSL2.\n");
            console.log("  📦 Installing NemoClaw inside WSL2...\n");
            execSync(
              "wsl bash -c \"curl -fsSL https://nvidia.com/nemoclaw.sh | bash\"",
              { stdio: "inherit" }
            );
            console.log("\n  ✔  NemoClaw installed in WSL2.\n");
            console.log("  ℹ️  If onboard fails on Ubuntu 24.04: run inside WSL2: nemoclaw setup-spark\n");
          } catch {
            console.error("\n  ❌ WSL2 setup failed. Try manually:");
            console.error("     1. wsl --install Ubuntu  (or: wsl --install --distribution Ubuntu on older Win10)");
            console.error("     2. wsl bash -c \"curl -fsSL https://nvidia.com/nemoclaw.sh | bash\"\n");
            console.error("  Falling back to OpenClaw for Windows...\n");
            try {
              execSync("npm install -g openclaw", { stdio: "inherit" });
              console.log("  ✔  OpenClaw installed as fallback.\n");
            } catch {
              process.exit(1);
            }
          }
        } else {
          console.log("\n  📦 Installing OpenClaw for Windows...\n");
          try {
            execSync("npm install -g openclaw", { stdio: "inherit" });
            console.log("\n  ✔  OpenClaw installed.\n");
            console.log("  💡 Tip: Run \"wsl --install Ubuntu\" later, then re-run this installer");
            console.log("     to get NemoClaw with full sandbox support.\n");
          } catch {
            console.error("\n  ❌ Failed to install OpenClaw:");
            console.error("     npm install -g openclaw\n");
            process.exit(1);
          }
        }
      }
    } else {
      console.log("  WSL2 is not installed on this machine.\n");

      let shouldInstallWSL;
      if (auto) {
        shouldInstallWSL = false;
      } else {
        shouldInstallWSL = await confirm(
          "  Install WSL2 + Ubuntu now for full NemoClaw support? (Recommended)"
        );
      }

      if (shouldInstallWSL) {
        console.log("\n  📦 Installing WSL2 and Ubuntu...\n");
        console.log("  ⚠️  This requires a system restart after WSL2 installs.");
        console.log("      After restarting, re-run: npx @robbiesrobotics/alice-agents\n");
        try {
          execSync("wsl --install", { stdio: "inherit" });
          try { execSync("wsl --set-default-version 2", { stdio: "pipe" }); } catch {}
          console.log("\n  ✔  WSL2 installation initiated.");
          console.log("  🔁 Please restart your computer, then re-run the installer.\n");
          process.exit(0);
        } catch {
          console.error("\n  ❌ WSL2 install failed. Enable it manually:");
          console.error("     1. Open PowerShell as Administrator");
          console.error("     2. Run: wsl --install");
          console.error("     3. Restart your computer");
          console.error("     4. Re-run: npx @robbiesrobotics/alice-agents\n");
          console.error("  Falling back to OpenClaw for Windows...\n");
          try {
            execSync("npm install -g openclaw", { stdio: "inherit" });
            console.log("  ✔  OpenClaw installed as fallback.\n");
          } catch {
            process.exit(1);
          }
        }
      } else {
        console.log("\n  📦 Installing OpenClaw for Windows...\n");
        console.log("  A.L.I.C.E. will run without the NemoClaw sandbox.\n");
        try {
          execSync("npm install -g openclaw", { stdio: "inherit" });
          console.log("\n  ✔  OpenClaw installed.\n");
          console.log("  💡 To enable NemoClaw later:");
          console.log("     1. Open PowerShell as Administrator: wsl --install");
          console.log("     2. Restart, then re-run: npx @robbiesrobotics/alice-agents\n");
        } catch {
          console.error("\n  ❌ Failed to install OpenClaw:");
          console.error("     npm install -g openclaw\n");
          process.exit(1);
        }
      }
    }

    try {
      execSync("openclaw configure", { stdio: "inherit" });
    } catch {
      console.error("\n  ⚠️  Configuration incomplete. Run manually: openclaw configure\n");
      process.exit(1);
    }
    return;
  }

  // macOS
  if (plat === "darwin") {
    console.log("  A.L.I.C.E. requires a compatible runtime. NemoClaw requires Linux");
    console.log("  (OpenShell uses Linux kernel primitives: Landlock, seccomp, netns).\n");
    console.log("  On macOS, OpenClaw will be installed. For NemoClaw sandbox mode,");
    console.log("  use a Linux VM or deploy remotely with: nemoclaw deploy <brev-instance>\n");

    console.log("  📦 Installing OpenClaw...\n");
    try {
      execSync("npm install -g openclaw", { stdio: "inherit" });
      console.log("\n  ✔  OpenClaw installed.\n");
    } catch {
      console.error("\n  ❌ Failed to install OpenClaw:");
      console.error("     npm install -g openclaw\n");
      process.exit(1);
    }

    try {
      execSync("openclaw configure", { stdio: "inherit" });
      console.log("\n  ✓ OpenClaw configured\n");
    } catch {
      console.error("\n  ⚠️  Configuration incomplete. Run manually: openclaw configure\n");
      process.exit(1);
    }
    return;
  }

  // Linux / WSL2
  console.log("  A.L.I.C.E. requires a compatible runtime. We recommend NemoClaw —");
  console.log("  NVIDIA\u2019s secure, open-source distribution that includes OpenClaw");
  console.log("  plus enterprise-grade security (OpenShell sandbox, local AI models).\n");

  if (isWSL) {
    console.log("  ℹ️  WSL2 environment detected.");
    console.log("      If NemoClaw onboard fails, run: nemoclaw setup-spark");
    console.log("      (applies the required cgroup v2 Docker fix for WSL2)\n");
  }

  let choice;
  if (auto) {
    choice = "nemoclaw";
  } else {
    choice = await choose("  Which would you like to install?", [
      { label: "NemoClaw (Recommended)", value: "nemoclaw" },
      { label: "OpenClaw only", value: "openclaw" },
    ]);
  }

  if (choice === "nemoclaw") {
    console.log("  📦 Installing NemoClaw...\n");
    try {
      execSync("curl -fsSL https://nvidia.com/nemoclaw.sh | bash", { stdio: "inherit" });
      console.log("\n  ✔  NemoClaw installed — agents will run in OpenShell sandbox\n");
    } catch {
      console.error("\n  ❌ Failed to install NemoClaw. Try manually:");
      console.error("     curl -fsSL https://nvidia.com/nemoclaw.sh | bash\n");
      process.exit(1);
    }
  } else {
    console.log("  📦 Installing OpenClaw...\n");
    try {
      execSync("npm install -g openclaw", { stdio: "inherit" });
      console.log("\n  ✔  OpenClaw installed\n");
    } catch {
      console.error("\n  ❌ Failed to install OpenClaw:");
      console.error("     npm install -g openclaw\n");
      process.exit(1);
    }
  }

  try {
    execSync("openclaw configure", { stdio: "inherit" });
    console.log("\n  ✓ OpenClaw configured\n");
  } catch {
    console.error("\n  ⚠️  Configuration incomplete. Run manually:");
    console.error("     openclaw configure");
    console.error("     Then: npx @robbiesrobotics/alice-agents\n");
    process.exit(1);
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAgentRegistry() {
  const raw = readFileSync(join(__dirname, '..', 'templates', 'agents-starter.json'), 'utf8');
  return JSON.parse(raw);
}

function printBanner() {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const version = pkg.version || '';
  console.log('');
  console.log(`  ${dim('╭──────────────────────────────────────────────╮')}`);
  console.log(`  ${dim('│')}                                              ${dim('│')}`);
  console.log(`  ${dim('│')}    ${greenBold('A . L . I . C . E .')}                         ${dim('│')}`);
  console.log(`  ${dim('│')}    ${dim('Adaptive Learning & Intelligent Coordination')}  ${dim('│')}`);
  console.log(`  ${dim('│')}    ${dim('Engine — Multi-Agent Orchestration')}            ${dim('│')}`);
  console.log(`  ${dim('│')}                                              ${dim('│')}`);
  console.log(`  ${dim('│')}    ${dim('v' + version)}  ${green('●')}  ${dim('10 starter agents, one team')}     ${dim('│')}`);
  console.log(`  ${dim('│')}                                              ${dim('│')}`);
  console.log(`  ${dim('╰──────────────────────────────────────────────╯')}`);
  console.log('');
}

function printSummary(mode, tier, agents, preset, userInfo, detectedModels) {
  const modelLabel =
    preset === 'detected'
      ? `${detectedModels?.primary || 'your configured model'} ${dim('(detected)')}`
      : preset === 'custom' ? 'custom' : preset;

  printSection('Install Summary');
  console.log('');

  const lines = [
    `${dim('Mode:')}      ${green(mode)}`,
    `${dim('Tier:')}      ${green(tier)} ${dim('(' + agents.length + ' agents)')}`,
    `${dim('Model:')}     ${green(modelLabel)}`,
    `${dim('User:')}      ${green(userInfo.name)}`,
    `${dim('Timezone:')}  ${green(userInfo.timezone)}`,
    '',
    `${dim('Agents:')}`,
    ...agents.map(a => `  ${icons.bullet} ${green(a.emoji)}  ${bold(a.name.padEnd(10))} ${dim('─')} ${a.domain}`),
  ];

  printBox(lines, { title: 'Ready to install', padding: 2 });
  console.log('');
}

export async function runInstall(options = {}) {
  const auto = options.yes || false;

  // Check health flag first (before banner)
  if (process.argv.includes('--health')) {
    const healthPath = join(homedir(), '.openclaw', '.alice-health-alert.json');
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
    printStepFail('OpenClaw config not found', 'Run: openclaw configure');
    console.log('');
    process.exit(1);
  }

  // 1b. Check for OpenClaw updates
  await checkForOpenClawUpdate(auto);

  const runtime = await detectRuntime();
  if (runtime === 'nemoclaw') {
    console.log(`  ${icons.ok} ${greenBold('NemoClaw detected')} ${dim('─')} agents run in OpenShell sandbox\n`);
  } else {
    console.log(`  ${icons.ok} ${green('OpenClaw detected')}\n`);
    if (process.platform === "linux" || process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
      console.log(`  ${icons.info} ${dim('Tip:')} Upgrade to NemoClaw for enterprise security: https://nvidia.com/nemoclaw\n`);
    } else if (process.platform === "darwin") {
      console.log(`  ${icons.info} ${dim('Tip:')} NemoClaw requires Linux. For sandbox mode, use a Linux VM or Brev remote deploy.\n`);
    }
  }

  // Detect what models the user already has configured
  const detectedModels = detectAvailableModels();
  if (detectedModels?.hasModel) {
    console.log(`  ${icons.ok} ${green('Detected configured model:')} ${detectedModels.primary}`);
    if (detectedModels.providers.length > 0) {
      console.log(`     Providers: ${detectedModels.providers.join(', ')}\n`);
    } else {
      console.log();
    }
  } else {
    console.log(`  ${icons.info} ${dim('No model configured yet — you\'ll be prompted to choose one.')}\n`);
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
      console.log(`  ${icons.warn} ${yellow('No previous install found. Switching to fresh install.')}\n`);
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
    printSection('About You');
    console.log('');
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
      printStepDone(`Pro license found (${existing.key.slice(0, 12)}...)`);
    } else if (auto) {
      // --yes flag: skip interactive prompt, fallback to Starter if no stored license
      console.log('');
      console.log(`  ${icons.info} ${dim('Pro tier requires a license key.')}`);
      console.log(`  ${dim('Run without --yes to enter your license key.')}`);
      console.log(`  ${dim('Falling back to Starter tier.')}`);
      console.log(`  ${dim('Purchase a license at:')} ${cyan('https://getalice.av3.ai/pricing')}`);
      tier = 'starter';
    } else {
      // No stored license — prompt for key
      let key = '';
      let attempts = 0;

      while (attempts < 3) {
        key = await promptLicenseKey();

        if (!isValidFormat(key)) {
          printStepFail('Invalid format. Key must be ALICE-XXXX-XXXX-XXXX');
          attempts++;
          continue;
        }

        console.log('  Validating key...');
        const result = await validateLicenseRemote(key);

        if (result.valid) {
          storeLicense(key);
          if (result.message === 'offline') {
            printStepDone('Key stored', 'offline — will validate on next run');
          } else {
            printStepDone('License verified! Welcome to A.L.I.C.E. Pro.');
          }
          break;
        } else {
          printStepFail(`Invalid key: ${result.message ?? 'Not recognized'}`);
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
  printSection('Installing');
  console.log('');

  // Merge config
  const { backupPath, agentCount, effectivePreset, warning } = mergeConfig({
    agents,
    mode,
    preset,
    customModels,
  });
  printStepDone('Config updated', `backup: ${backupPath}`);
  if (warning) {
    console.log(`  ${icons.warn} ${yellow(warning)}`);
  }

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
  printStepDone('Workspaces', `${newWorkspaces} created, ${updatedWorkspaces} updated`);

  // Skills installation step
  const finalRuntimeForSkills = await detectRuntime();
  const skillsInstalled = await runSkillsWizardStep({
    auto,
    nemoclaw: finalRuntimeForSkills === 'nemoclaw',
    sandboxName: 'my-assistant',
  });

  // Write manifest
  const existing = readManifest();
  writeManifest({
    installedAt: existing?.installedAt,
    tier,
    agents: agents.map((a) => a.id),
    userName: userInfo.name,
    userTimezone: userInfo.timezone,
    modelPreset: effectivePreset,
  });
  printStepDone('Manifest written');

  console.log('');
  printSeparator();
  console.log('');
  console.log(`  ${icons.ok} ${greenBold('A.L.I.C.E. installed!')} ${dim(agentCount + ' agents ready.')}`);
  console.log('');
  const finalRuntime = await detectRuntime();
  if (finalRuntime === 'nemoclaw') {
    console.log(`  ${icons.ok} ${green('Secure mode')} ${dim('─')} OpenShell sandbox active`);
  } else {
    console.log(`  ${icons.info} ${dim('Runtime: OpenClaw')}`);
  }
  console.log('');
  console.log(`  ${dim('Manage skills:')}    ${cyan('npx @robbiesrobotics/alice-agents --skills')}`);
  console.log(`  ${dim('Health check:')}     ${cyan('npx @robbiesrobotics/alice-agents --doctor')}`);
  console.log(`  ${dim('Restart runtime:')}  ${cyan('openclaw gateway restart')}`);
  console.log('');
  printSeparator();
  console.log('');
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
