#!/usr/bin/env node
/**
 * A.L.I.C.E. Compatibility Checker
 * Diffs current OpenClaw installation against stored snapshots.
 * Exit 0 = compatible, 1 = breaking changes found.
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- CLI args ---
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1];

function log(...a) { if (verbose) console.log(...a); }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); }

// --- Helpers ---
function loadJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getOpenClawVersion() {
  try {
    const out = execSync('openclaw --version 2>/dev/null', { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    const m = out.match(/(\d{4}\.\d+\.\d+)/);
    return m ? m[1] : 'unknown';
  } catch { return 'unknown'; }
}

function getOpenClawConfig() {
  const configPath = join(process.env.HOME, '.openclaw', 'openclaw.json');
  return loadJSON(configPath);
}

// --- Diff functions ---

function diffConfigSchema(snapshot, liveConfig) {
  const changes = [];

  // Check agents.defaults fields
  const defaults = liveConfig?.agents?.defaults || {};
  const snap = snapshot?.agents?.defaults || {};

  if (!defaults.model?.primary) {
    changes.push({
      category: 'config',
      severity: 'high',
      field: 'agents.defaults.model.primary',
      change: 'Field missing or undefined',
      autoFixable: false
    });
  }

  // Check sandbox allowedValues
  const agents = liveConfig?.agents?.list || [];
  for (const agent of agents) {
    const mode = agent?.sandbox?.mode;
    const allowed = ['off', 'all'];
    if (mode && !allowed.includes(mode)) {
      changes.push({
        category: 'config',
        severity: 'high',
        field: `agents.list[${agent.id}].sandbox.mode`,
        change: `Unexpected value '${mode}', expected one of: ${allowed.join(', ')}`,
        autoFixable: false
      });
    }
  }

  // Check compaction mode
  const compactionMode = defaults?.compaction?.mode;
  const validModes = ['safeguard', 'auto', 'off'];
  if (compactionMode && !validModes.includes(compactionMode)) {
    changes.push({
      category: 'behavioral',
      severity: 'medium',
      field: 'agents.defaults.compaction.mode',
      change: `Value '${compactionMode}' may not be valid. Expected: ${validModes.join(', ')}`,
      autoFixable: false
    });
  }

  const configuredProviders = new Set([
    ...Object.keys(liveConfig?.models?.providers || {}),
    ...Object.values(liveConfig?.auth?.profiles || {}).map((profile) => profile?.provider),
  ].filter(Boolean).map((provider) => provider === 'openai-codex' ? 'openai' : provider));

  const referencedModels = [
    defaults?.model?.primary,
    defaults?.model?.orchestrator,
    ...(defaults?.model?.fallbacks || []),
    ...agents.map((agent) => agent?.model).filter(Boolean),
  ].filter(Boolean);

  for (const model of referencedModels) {
    const provider = typeof model === 'string' && model.includes('/') ? model.split('/')[0] : null;
    const normalized = provider === 'openai-codex' ? 'openai' : provider;
    if (normalized && configuredProviders.size > 0 && !configuredProviders.has(normalized)) {
      changes.push({
        category: 'config',
        severity: 'high',
        field: 'agents.defaults.model',
        change: `Model '${model}' references provider '${normalized}', but that provider is not configured in OpenClaw auth/models`,
        autoFixable: false
      });
      break;
    }
  }

  return changes;
}

function diffToolAPI(snapshot, liveConfig) {
  const changes = [];
  const snapTools = snapshot?.tools || {};

  // Get all tools referenced in agent configs
  const referencedTools = new Set();
  const referencedProfiles = new Set();

  for (const agent of liveConfig?.agents?.list || []) {
    const t = agent?.tools || {};
    if (t.profile) referencedProfiles.add(t.profile);
    for (const tool of [...(t.allow || []), ...(t.alsoAllow || []), ...(t.deny || [])]) {
      referencedTools.add(tool);
    }
  }

  const knownTools = new Set(Object.keys(snapTools));

  // Check for tools in use that aren't in our snapshot (may be new — not breaking)
  for (const tool of referencedTools) {
    if (!knownTools.has(tool)) {
      log(`  Note: Tool '${tool}' not in snapshot — may be new`);
    }
  }

  // Check snapshot profiles still exist
  const snapProfiles = snapshot?.profiles || {};
  for (const profile of referencedProfiles) {
    if (!snapProfiles[profile]) {
      // Can't verify, just note
      log(`  Note: Profile '${profile}' used but not in snapshot`);
    }
  }

  return changes;
}

function diffBehavioral(snapshot, liveConfig) {
  const changes = [];
  const defaults = liveConfig?.agents?.defaults || {};
  const snapDefaults = snapshot?.agents?.defaults || {};

  // Check heartbeat still works
  if (defaults.heartbeat && !defaults.heartbeat.every) {
    changes.push({
      category: 'behavioral',
      severity: 'medium',
      field: 'agents.defaults.heartbeat.every',
      change: 'Heartbeat interval missing',
      autoFixable: true,
      fix: { type: 'field-add', path: 'agents.defaults.heartbeat.every', value: '15m' }
    });
  }

  // Check subagents runTimeoutSeconds still present
  if (defaults.subagents && !defaults.subagents.runTimeoutSeconds) {
    changes.push({
      category: 'behavioral',
      severity: 'low',
      field: 'agents.defaults.subagents.runTimeoutSeconds',
      change: 'runTimeoutSeconds missing from subagents defaults',
      autoFixable: true,
      fix: { type: 'field-add', path: 'agents.defaults.subagents.runTimeoutSeconds', value: 900 }
    });
  }

  return changes;
}

function diffSkills() {
  const changes = [];
  // Check if skills directory structure is intact
  const skillsPath = join(
    process.env.HOME,
    '.local/share/fnm/node-versions',
  );
  // Skills live in node_modules/openclaw/skills — check a known skill exists
  try {
    execSync('ls ~/.local/share/fnm/node-versions/*/installation/lib/node_modules/openclaw/skills/coding-agent/SKILL.md 2>/dev/null | head -1', {
      encoding: 'utf8', shell: '/bin/sh', stdio: ['pipe','pipe','pipe']
    });
  } catch {
    changes.push({
      category: 'skills',
      severity: 'medium',
      field: 'skills.coding-agent',
      change: 'coding-agent skill not found in expected location',
      autoFixable: false
    });
  }
  return changes;
}

// --- Main ---
async function main() {
  const openclawVersion = getOpenClawVersion();
  const aliceVersion = loadJSON(join(ROOT, 'package.json'))?.version || 'unknown';

  console.log(`\n  🔍 A.L.I.C.E. Compatibility Checker`);
  console.log(`  OpenClaw: ${openclawVersion} | A.L.I.C.E.: ${aliceVersion}\n`);

  const schemaSnapshot = loadJSON(join(ROOT, 'snapshots', 'schema-snapshot.json'));
  const toolSnapshot = loadJSON(join(ROOT, 'snapshots', 'tool-snapshot.json'));
  const liveConfig = getOpenClawConfig();

  if (!schemaSnapshot || !toolSnapshot) {
    warn('Snapshots missing — cannot check compatibility');
    process.exit(0);
  }

  if (!liveConfig) {
    warn('OpenClaw config not found — is OpenClaw installed and configured?');
    process.exit(1);
  }

  const breakingChanges = [
    ...diffConfigSchema(schemaSnapshot, liveConfig),
    ...diffToolAPI(toolSnapshot, liveConfig),
    ...diffBehavioral(schemaSnapshot, liveConfig),
    ...diffSkills()
  ];

  const criticals = breakingChanges.filter(c => c.severity === 'critical' || c.severity === 'high');
  const mediums   = breakingChanges.filter(c => c.severity === 'medium');
  const lows      = breakingChanges.filter(c => c.severity === 'low');
  const autoFixable = breakingChanges.filter(c => c.autoFixable);

  const report = {
    generatedAt: new Date().toISOString(),
    openclawVersion,
    aliceVersion,
    snapshotVersion: schemaSnapshot.meta?.openclawVersion,
    compatible: breakingChanges.length === 0,
    summary: {
      total: breakingChanges.length,
      critical: criticals.length,
      medium: mediums.length,
      low: lows.length,
      autoFixable: autoFixable.length
    },
    breakingChanges
  };

  if (outputFile) {
    writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`  Report written to: ${outputFile}`);
  }

  if (breakingChanges.length === 0) {
    console.log('  ✅ Compatible — no breaking changes detected\n');
    process.exit(0);
  }

  console.log(`  Found ${breakingChanges.length} issue(s):\n`);
  for (const c of breakingChanges) {
    const icon = c.severity === 'high' || c.severity === 'critical' ? '🔴' :
                 c.severity === 'medium' ? '🟡' : '🟢';
    const fix = c.autoFixable ? ' [auto-fixable]' : ' [manual review]';
    console.log(`  ${icon} [${c.category}] ${c.field}`);
    console.log(`     ${c.change}${fix}\n`);
  }

  if (autoFixable.length > 0) {
    console.log(`  💡 ${autoFixable.length} issue(s) can be auto-fixed.`);
    console.log(`     Run: npx @robbiesrobotics/alice-agents --health\n`);
  }

  process.exit(criticals.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Checker error:', err.message);
  process.exit(1);
});
