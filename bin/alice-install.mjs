#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInstall, runUninstall } from '../lib/installer.mjs';
import { runDoctor } from '../lib/doctor.mjs';
import { runSkillsManager } from '../lib/skills.mjs';

const args = process.argv.slice(2);
const flags = new Set(args);

function getFlagValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

if (flags.has('--version') || flags.has('-v')) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  console.log(pkg.version);
  process.exit(0);
}

if (flags.has('--help') || flags.has('-h')) {
  console.log(`
  alice-agents — A.L.I.C.E. Agent Framework Installer

  Usage:
    npx @robbiesrobotics/alice-agents              Interactive install
    npx @robbiesrobotics/alice-agents --yes        Non-interactive install with defaults
    npx @robbiesrobotics/alice-agents --update     Non-interactive upgrade to latest agents
    npx @robbiesrobotics/alice-agents --uninstall  Remove A.L.I.C.E. agents from config
    npx @robbiesrobotics/alice-agents --doctor     Run diagnostics on your A.L.I.C.E. install
    npx @robbiesrobotics/alice-agents --skills     Manage skills (install, remove, browse)
    npx @robbiesrobotics/alice-agents --hermes-bridge  Enable Hermes agent bridge during install (OpenClaw+Hermes)
    npx @robbiesrobotics/alice-agents --runtime <alice-runtime|hermes|openclaw|nemoclaw>  Force runtime selection
    npx @robbiesrobotics/alice-agents --version    Show version
    npx @robbiesrobotics/alice-agents --help       Show this help

  Options:
    --yes         Skip prompts and use detected defaults
    --update      Non-interactive upgrade (alias for --yes with upgrade mode)
    --uninstall   Remove A.L.I.C.E. agents (preserves non-ALICE agents)
    --doctor      Run diagnostics and check install health
    --hermes-bridge  Enable Hermes agent bridge (create hermes-agents.json, detect model)
    --tier <starter|pro>           Force the install tier
    --runtime <alice-runtime|hermes|openclaw|nemoclaw>  Force specific runtime
    --force                        Force reinstall even if already installed
    --license-key <key>            Provide a Pro license key for automation
    --coding-tool <auto|claude|codex>  Override the preferred coding CLI
    --version     Print package version
  `);
  process.exit(0);
}

const baseOptions = {
  tierOverride: getFlagValue('--tier'),
  runtimeOverride: getFlagValue('--runtime'),
  force: flags.has('--force'),
  licenseKey: getFlagValue('--license-key'),
  codingTool: getFlagValue('--coding-tool'),
  hermesBridge: flags.has('--hermes-bridge'),
};

if (flags.has('--doctor')) {
  runDoctor().then((ok) => process.exit(ok ? 0 : 1)).catch((err) => {
    console.error('  ❌ Doctor failed:', err.message);
    process.exit(1);
  });
} else if (flags.has('--update')) {
  runInstall({ yes: true, modeOverride: 'upgrade', ...baseOptions })
    .then(() => process.exit(0))
    .catch((err) => { console.error('  ❌ Upgrade failed:', err.message); process.exit(1); });
} else if (flags.has('--skills')) {
  runSkillsManager().then(() => process.exit(0)).catch((err) => {
    console.error(`  ✗ Skills manager failed: ${err.message}`);
    process.exit(1);
  });
} else if (flags.has('--uninstall')) {
  runUninstall({ yes: flags.has('--yes') }).then(() => process.exit(0)).catch((err) => {
    console.error('  ❌ Uninstall failed:', err.message);
    process.exit(1);
  });
} else {
  runInstall({ yes: flags.has('--yes'), ...baseOptions })
    .then(() => process.exit(0))
    .catch((err) => { console.error('  ❌ Install failed:', err.message); process.exit(1); });
}
