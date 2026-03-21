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
    npx @robbiesrobotics/alice-agents --cloud      Enable Mission Control Cloud during install
    npx @robbiesrobotics/alice-agents --version    Show version
    npx @robbiesrobotics/alice-agents --help       Show this help

  Options:
    --yes         Skip prompts, use detected model when available (otherwise Sonnet)
    --update      Non-interactive upgrade (alias for --yes with upgrade mode)
    --uninstall   Remove A.L.I.C.E. agents (preserves non-ALICE agents)
    --doctor      Run diagnostics and check install health
    --cloud       Enable Mission Control Cloud setup during install
    --no-cloud    Skip Mission Control Cloud setup during install
    --tier <starter|pro>           Force the install tier
    --license-key <key>            Provide a Pro license key for automation
    --coding-tool <auto|claude|codex>  Override the preferred coding CLI
    --cloud-token <token>           Mission Control ingest/access token
    --cloud-dashboard-url <url>     Mission Control dashboard URL
    --cloud-ingest-url <url>        Mission Control ingest endpoint
    --cloud-team-id <id>            Mission Control team UUID for hosted linkage
    --cloud-team-slug <slug>        Mission Control team slug
    --cloud-team-name <name>        Mission Control team display name
    --cloud-team-plan <plan>        Mission Control team plan
    --version     Print package version
  `);
  process.exit(0);
}

if (flags.has('--doctor')) {
  runDoctor().then((ok) => process.exit(ok ? 0 : 1)).catch((err) => {
    console.error('  ❌ Doctor failed:', err.message);
    process.exit(1);
  });
} else if (flags.has('--update')) {
  runInstall({
    yes: true,
    modeOverride: 'upgrade',
    cloud: flags.has('--cloud') ? true : flags.has('--no-cloud') ? false : undefined,
    tierOverride: getFlagValue('--tier'),
    licenseKey: getFlagValue('--license-key'),
    codingTool: getFlagValue('--coding-tool'),
    cloudToken: getFlagValue('--cloud-token'),
    cloudDashboardUrl: getFlagValue('--cloud-dashboard-url'),
    cloudIngestUrl: getFlagValue('--cloud-ingest-url'),
    cloudTeamId: getFlagValue('--cloud-team-id'),
    cloudTeamSlug: getFlagValue('--cloud-team-slug'),
    cloudTeamName: getFlagValue('--cloud-team-name'),
    cloudTeamPlan: getFlagValue('--cloud-team-plan'),
  }).catch((err) => {
    console.error('  ❌ Update failed:', err.message);
    process.exit(1);
  });
} else if (flags.has('--skills')) {
  runSkillsManager().catch((err) => {
    console.error(`  ✗ Skills manager failed: ${err.message}`);
    process.exit(1);
  });
} else if (flags.has('--uninstall')) {
  runUninstall({ yes: flags.has('--yes') }).catch((err) => {
    console.error('  ❌ Uninstall failed:', err.message);
    process.exit(1);
  });
} else {
  runInstall({
    yes: flags.has('--yes'),
    cloud: flags.has('--cloud') ? true : flags.has('--no-cloud') ? false : undefined,
    tierOverride: getFlagValue('--tier'),
    licenseKey: getFlagValue('--license-key'),
    codingTool: getFlagValue('--coding-tool'),
    cloudToken: getFlagValue('--cloud-token'),
    cloudDashboardUrl: getFlagValue('--cloud-dashboard-url'),
    cloudIngestUrl: getFlagValue('--cloud-ingest-url'),
    cloudTeamId: getFlagValue('--cloud-team-id'),
    cloudTeamSlug: getFlagValue('--cloud-team-slug'),
    cloudTeamName: getFlagValue('--cloud-team-name'),
    cloudTeamPlan: getFlagValue('--cloud-team-plan'),
  }).catch((err) => {
    console.error('  ❌ Install failed:', err.message);
    process.exit(1);
  });
}
