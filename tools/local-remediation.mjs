#!/usr/bin/env node
/**
 * A.L.I.C.E. Local Remediation
 * Runs on user's machine via OpenClaw cron.
 * Detects OpenClaw version changes and auto-fixes compatible issues.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const HOME = process.env.HOME;
const OPENCLAW_CONFIG = join(HOME, '.openclaw', 'openclaw.json');
const ALICE_MANIFEST = join(HOME, '.openclaw', '.alice-manifest.json');
const ALERT_FILE = join(HOME, '.openclaw', '.alice-health-alert.json');
const verbose = process.argv.includes('--verbose');

function log(...a) { if (verbose) console.log('[alice-remediation]', ...a); }
function warn(msg) { console.warn(`⚠️  ${msg}`); }
function info(msg) { console.log(`ℹ️  ${msg}`); }

function getOpenClawVersion() {
  try {
    const out = execSync('openclaw --version 2>/dev/null', { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    const m = out.match(/(\d{4}\.\d+\.\d+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

function loadJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveJSON(path, obj) {
  writeFileSync(path, JSON.stringify(obj, null, 2));
}

function backupConfig() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backup = `${OPENCLAW_CONFIG}.bak.selfheal-${timestamp}`;
  copyFileSync(OPENCLAW_CONFIG, backup);
  log(`Config backed up to: ${backup}`);
  return backup;
}

function rollback(backup) {
  copyFileSync(backup, OPENCLAW_CONFIG);
  warn(`Rolled back config from: ${backup}`);
}

function verifyConfig() {
  try {
    execSync('openclaw status --format=json 2>/dev/null', { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    return true;
  } catch {
    return false;
  }
}

function applyPatch(config, patch) {
  const { type, path: fieldPath, from, to, value } = patch;

  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  function setNestedValue(obj, path, val) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = val;
  }

  if (type === 'value-rename') {
    // Find and rename all occurrences of `from` to `to` in string values
    JSON.stringify(config)
      .split('"' + from + '"')
      .join('"' + to + '"');
    log(`  Renamed: "${from}" → "${to}"`);
  } else if (type === 'field-rename') {
    const oldVal = getNestedValue(config, from);
    if (oldVal !== undefined) {
      setNestedValue(config, to, oldVal);
      // Delete old field
      const oldKeys = from.split('.');
      let current = config;
      for (let i = 0; i < oldKeys.length - 1; i++) {
        current = current[oldKeys[i]];
      }
      delete current[oldKeys[oldKeys.length - 1]];
      log(`  Renamed field: ${from} → ${to}`);
    }
  } else if (type === 'field-add') {
    const current = getNestedValue(config, fieldPath.split('.').slice(0, -1).join('.'));
    if (current) {
      const key = fieldPath.split('.').pop();
      current[key] = value;
      log(`  Added field: ${fieldPath} = ${JSON.stringify(value)}`);
    }
  } else if (type === 'tool-rename') {
    let changed = 0;
    for (const agent of config?.agents?.list || []) {
      const tools = agent?.tools || {};
      for (const list of ['allow', 'alsoAllow']) {
        if (tools[list]) {
          const idx = tools[list].indexOf(from);
          if (idx !== -1) {
            tools[list][idx] = to;
            changed++;
          }
        }
      }
    }
    if (changed > 0) log(`  Renamed tool: "${from}" → "${to}" (${changed} references)`);
  }

  return config;
}

async function main() {
  const currentVersion = getOpenClawVersion();
  if (!currentVersion) {
    warn('Could not detect OpenClaw version');
    return;
  }

  const manifest = loadJSON(ALICE_MANIFEST) || {
    installedVersion: 'unknown',
    installedAt: new Date().toISOString(),
    compatibilityVersion: 'unknown'
  };

  const prevVersion = manifest.compatibilityVersion || 'unknown';

  log(`OpenClaw version: ${currentVersion}`);
  log(`Previous checked: ${prevVersion}`);

  if (currentVersion === prevVersion) {
    log('No version change detected — nothing to do');
    return;
  }

  log(`Version mismatch — checking for breaking changes...`);

  // Try to fetch or run compatibility report
  let report = null;
  const reportPath = join(HOME, '.openclaw', `.alice-compat-${currentVersion}.json`);

  // Try to use the installed compatibility checker
  try {
    const checkerPath = require.resolve('@robbiesrobotics/alice-agents/tools/compatibility-checker.mjs');
    execSync(`node ${checkerPath} --output=${reportPath}`, { stdio: 'pipe' });
    report = loadJSON(reportPath);
  } catch {
    log('Could not run compatibility checker');
  }

  if (!report) {
    warn('No compatibility report available');
    return;
  }

  const { breakingChanges = [] } = report;
  const autoFixable = breakingChanges.filter(c => c.autoFixable);
  const needsReview = breakingChanges.filter(c => !c.autoFixable);

  log(`Found: ${autoFixable.length} auto-fixable, ${needsReview.length} need review`);

  // Auto-fix if any
  if (autoFixable.length > 0) {
    const config = loadJSON(OPENCLAW_CONFIG);
    const backup = backupConfig();

    let fixed = 0;
    for (const change of autoFixable) {
      try {
        applyPatch(config, change.fix);
        fixed++;
      } catch (err) {
        warn(`Failed to apply patch for ${change.field}: ${err.message}`);
      }
    }

    if (fixed === autoFixable.length) {
      saveJSON(OPENCLAW_CONFIG, config);
      if (!verifyConfig()) {
        rollback(backup);
        warn('Config verification failed — rolled back');
        return;
      }
      info(`Auto-patched ${fixed} issue(s) for OpenClaw ${currentVersion}`);
    } else {
      warn(`Only patched ${fixed}/${autoFixable.length} — rolling back`);
      rollback(backup);
      return;
    }
  }

  // Write escalation alerts if needed
  if (needsReview.length > 0) {
    const alerts = {
      timestamp: new Date().toISOString(),
      openclawVersion: currentVersion,
      previousVersion: prevVersion,
      alerts: needsReview.map(c => ({
        category: c.category,
        severity: c.severity,
        field: c.field,
        description: c.change,
        actionRequired: true
      }))
    };
    saveJSON(ALERT_FILE, alerts);
    warn(`${needsReview.length} issue(s) need review — see Mission Control > Compatibility`);
  }

  // Update manifest
  manifest.compatibilityVersion = currentVersion;
  manifest.lastCheckedAt = new Date().toISOString();
  saveJSON(ALICE_MANIFEST, manifest);

  log('Done');
}

main().catch(err => {
  warn(`Remediation error: ${err.message}`);
});
