#!/usr/bin/env node

import { runInstall, runUninstall } from '../lib/installer.mjs';

const args = process.argv.slice(2);
const flags = new Set(args);

if (flags.has('--help') || flags.has('-h')) {
  console.log(`
  alice-agents — A.L.I.C.E. Agent Framework Installer

  Usage:
    npx @robbiesrobotics/alice-agents              Interactive install
    npx @robbiesrobotics/alice-agents --yes        Non-interactive install with defaults
    npx @robbiesrobotics/alice-agents --uninstall  Remove A.L.I.C.E. agents from config
    npx @robbiesrobotics/alice-agents --help       Show this help

  Options:
    --yes         Skip prompts, use defaults (Sonnet, Starter tier)
    --uninstall   Remove A.L.I.C.E. agents (preserves non-ALICE agents)
  `);
  process.exit(0);
}

if (flags.has('--uninstall')) {
  runUninstall({ yes: flags.has('--yes') }).catch((err) => {
    console.error('  ❌ Uninstall failed:', err.message);
    process.exit(1);
  });
} else {
  runInstall({ yes: flags.has('--yes') }).catch((err) => {
    console.error('  ❌ Install failed:', err.message);
    process.exit(1);
  });
}
