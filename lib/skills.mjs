// lib/skills.mjs
// A.L.I.C.E. Skills Manager — install, list, remove skills via clawhub

import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { readManifest, writeManifest } from './manifest.mjs';
import { icons, greenBold, green, red, yellow, cyan, dim, bold,
         printSection, printSeparator, printBox, printStepDone,
         printStepFail, printStepSkip, separator } from './colors.mjs';
import { confirm, choose, closePrompt } from './prompter.mjs';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const SKILLS_DIR   = join(OPENCLAW_DIR, 'skills');

export const SKILL_CATALOG = [
  {
    category: 'Productivity',
    icon: '📅',
    skills: [
      { id: 'apple-reminders', label: 'Apple Reminders',  desc: 'Manage reminders from the terminal' },
      { id: 'apple-notes',     label: 'Apple Notes',      desc: 'Create and search notes' },
      { id: 'things-mac',      label: 'Things 3',         desc: 'Task management via Things 3 on macOS' },
      { id: 'gog',             label: 'Google Workspace', desc: 'Gmail, Calendar, Drive, Docs, Sheets' },
      { id: 'obsidian',        label: 'Obsidian',         desc: 'Work with Obsidian vaults' },
    ],
  },
  {
    category: 'Web & Research',
    icon: '🌐',
    skills: [
      { id: 'blogwatcher', label: 'Blog Watcher', desc: 'Monitor RSS/Atom feeds for updates' },
      { id: 'weather',     label: 'Weather',      desc: 'Current weather and forecasts (no API key)' },
      { id: 'summarize',   label: 'Summarize',    desc: 'Summarize URLs, podcasts, YouTube videos' },
      { id: 'gifgrep',     label: 'GIF Search',   desc: 'Search and download GIFs' },
    ],
  },
  {
    category: 'Communication',
    icon: '💬',
    skills: [
      { id: 'imsg',     label: 'iMessage', desc: 'Send and read iMessages/SMS' },
      { id: 'wacli',    label: 'WhatsApp', desc: 'WhatsApp messaging via CLI' },
      { id: 'himalaya', label: 'Email',    desc: 'IMAP/SMTP email via himalaya' },
    ],
  },
  {
    category: 'Developer Tools',
    icon: '⚙️',
    skills: [
      { id: 'github',       label: 'GitHub',            desc: 'Issues, PRs, CI via gh CLI' },
      { id: 'gh-issues',    label: 'GitHub Issues Bot', desc: 'Auto-fix issues and open PRs' },
      { id: '1password',    label: '1Password',         desc: 'Secrets and credentials via op CLI' },
    ],
  },
  {
    category: 'Smart Home & IoT',
    icon: '🏠',
    skills: [
      { id: 'openhue',  label: 'Philips Hue', desc: 'Control Hue lights and scenes' },
      { id: 'sonoscli', label: 'Sonos',        desc: 'Control Sonos speakers' },
      { id: 'blucli',   label: 'BluOS',        desc: 'BluOS audio system control' },
    ],
  },
];

// Egress endpoints needed per skill beyond NemoClaw baseline
const SKILL_POLICY_ENDPOINTS = {
  'weather':     ['wttr.in:443', 'api.open-meteo.com:443'],
  'gog':         ['oauth2.googleapis.com:443', 'www.googleapis.com:443', 'accounts.google.com:443'],
  'gifgrep':     ['api.giphy.com:443', 'api.tenor.com:443'],
  'blogwatcher': ['*:443'],
  'summarize':   ['*:443'],
  // github, gh-issues, apple-*, things-mac, obsidian, imsg, wacli, himalaya, coding-agent, 1password,
  // openhue, sonoscli, blucli — no extra endpoints needed or use dynamic approval
};

function commandExists(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  try { execSync(`${probe} ${cmd}`, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

function isClawhubAvailable() {
  return commandExists('clawhub');
}

function isSkillInstalled(skillId) {
  return existsSync(join(SKILLS_DIR, skillId));
}

export function getInstalledSkills() {
  const manifest = readManifest();
  return manifest?.skills || [];
}

async function detectNemoclawSandboxName() {
  const manifest = readManifest();
  if (manifest?.nemoclawSandbox) return manifest.nemoclawSandbox;
  try {
    const out = execSync('nemoclaw list', { stdio: 'pipe', encoding: 'utf8' });
    const match = out.match(/^(\S+)\s/m);
    if (match) return match[1];
  } catch {}
  return 'my-assistant';
}

async function applyNemoclawPolicyForSkill(skillId, sandboxName) {
  const endpoints = SKILL_POLICY_ENDPOINTS[skillId];
  if (!endpoints || endpoints.length === 0) return;

  if (endpoints.includes('*:443')) {
    console.log(`  ${icons.info} ${cyan(skillId)} ${dim('requires dynamic egress — approve via')} ${cyan('openshell term')}`);
    return;
  }

  const policyContent = [
    'network:',
    `  - name: alice_${skillId}`,
    '    endpoints:',
    ...endpoints.map(e => `      - ${e}`),
    '    binaries:',
    '      - /usr/local/bin/openclaw',
    '    rules:',
    '      - methods: [GET, POST]',
    '',
  ].join('\n');

  const tmpPath = join(homedir(), `.alice-policy-${skillId}.yaml`);
  writeFileSync(tmpPath, policyContent, 'utf8');

  try {
    execSync(`openshell policy set ${tmpPath}`, { stdio: 'pipe' });
    console.log(`  ${icons.ok} ${dim('Policy updated for')} ${green(skillId)} ${dim('─')} ${endpoints.join(', ')}`);
  } catch {
    console.log(`  ${icons.warn} ${yellow('Could not auto-apply policy for')} ${skillId}`);
    console.log(`     ${dim('Run manually:')} openshell policy set ${tmpPath}`);
  }
}

export async function installSkill(skillId, { nemoclaw = false, sandboxName = 'my-assistant' } = {}) {
  if (isSkillInstalled(skillId)) {
    printStepSkip(skillId, 'already installed');
    return { status: 'skipped' };
  }

  if (!isClawhubAvailable()) {
    printStepFail(skillId, 'clawhub not found — install: npm install -g clawhub');
    return { status: 'error', reason: 'clawhub not available' };
  }

  try {
    execSync(`clawhub install ${skillId}`, { stdio: 'pipe' });
    printStepDone(skillId);
    if (nemoclaw) {
      await applyNemoclawPolicyForSkill(skillId, sandboxName);
    }
    return { status: 'ok' };
  } catch (err) {
    printStepFail(skillId, err.message?.slice(0, 60));
    return { status: 'error', reason: err.message };
  }
}

export async function runSkillsWizardStep({ auto = false, nemoclaw = false, sandboxName = 'my-assistant' } = {}) {
  printSection('Skills & Tools');
  console.log('');
  console.log(`  ${dim('Skills extend your agents with real-world capabilities.')}`);
  console.log(`  ${dim('Installed via')} ${green('clawhub')} ${dim('— the OpenClaw skill marketplace.')}`);
  console.log('');

  if (!isClawhubAvailable()) {
    console.log(`  ${icons.warn} ${yellow('clawhub not found.')} ${dim('Skills cannot be installed right now.')}`);
    console.log(`     ${dim('Install it with:')} ${cyan('npm install -g clawhub')}`);
    console.log(`     ${dim('Then run:')} ${cyan('npx @robbiesrobotics/alice-agents --skills')}`);
    console.log('');
    return [];
  }

  if (auto) {
    console.log(`  ${icons.info} ${dim('Skipping skills in non-interactive mode.')}`);
    console.log(`  ${dim('Run')} ${cyan('npx @robbiesrobotics/alice-agents --skills')} ${dim('to install later.')}`);
    console.log('');
    return [];
  }

  const shouldInstall = await confirm('  Install recommended skills now?');
  if (!shouldInstall) {
    printStepSkip('Skills', 'skipped — run --skills to install later');
    return [];
  }

  console.log('');
  const selected = [];

  for (const group of SKILL_CATALOG) {
    printSection(`${group.icon}  ${group.category}`);
    console.log('');

    for (const skill of group.skills) {
      const already = isSkillInstalled(skill.id);
      if (already) {
        console.log(`  ${icons.check} ${green(skill.label)} ${dim('─ already installed')}`);
        continue;
      }
      const yes = await confirm(`  Install ${green(skill.label)}? ${dim('─')} ${dim(skill.desc)}`);
      if (yes) selected.push(skill.id);
    }
    console.log('');
  }

  if (selected.length === 0) {
    console.log(`  ${icons.info} ${dim('No skills selected.')}`);
    console.log('');
    return [];
  }

  printSection('Installing Skills');
  console.log('');

  if (nemoclaw) {
    console.log(`  ${icons.info} ${cyan('NemoClaw detected')} ${dim('─ policy endpoints will be applied automatically.')}`);
    console.log('');
  }

  const results = [];
  for (const skillId of selected) {
    const result = await installSkill(skillId, { nemoclaw, sandboxName });
    results.push({ skillId, ...result });
  }

  const ok  = results.filter(r => r.status === 'ok').length;
  const err = results.filter(r => r.status === 'error').length;

  console.log('');
  console.log(`  ${separator()}`);
  console.log(`  ${icons.ok} ${green(String(ok))} ${dim('skills installed')}${err ? `  ${icons.warn} ${yellow(String(err) + ' failed')}` : ''}`);
  console.log('');

  const manifest = readManifest();
  if (manifest) {
    const already = manifest.skills || [];
    const newOnes = results.filter(r => r.status === 'ok').map(r => r.skillId);
    writeManifest({ ...manifest, skills: [...new Set([...already, ...newOnes])] });
  }

  return selected;
}

export async function runSkillsManager() {
  console.log('');
  printSection('A.L.I.C.E. Skills Manager');
  console.log('');

  const installed = getInstalledSkills();

  if (installed.length > 0) {
    console.log(`  ${dim('Installed skills:')}`);
    installed.forEach(id => {
      const onDisk = isSkillInstalled(id);
      console.log(`  ${onDisk ? icons.ok : icons.warn}  ${onDisk ? green(id) : yellow(id + ' (missing on disk)')}`);
    });
    console.log('');
  } else {
    console.log(`  ${icons.info} ${dim('No skills installed yet.')}`);
    console.log('');
  }

  const action = await choose('  What would you like to do?', [
    { label: 'Browse & install skills', value: 'install' },
    { label: 'Remove a skill',          value: 'remove'  },
    { label: 'Exit',                    value: 'exit'    },
  ]);

  if (action === 'exit') { closePrompt(); return; }

  if (action === 'install') {
    const nemoclaw = commandExists('nemoclaw');
    const sandboxName = nemoclaw ? await detectNemoclawSandboxName() : null;
    await runSkillsWizardStep({ auto: false, nemoclaw, sandboxName });
  }

  if (action === 'remove') {
    if (installed.length === 0) {
      console.log(`  ${icons.info} ${dim('Nothing to remove.')}`);
      closePrompt();
      return;
    }
    const toRemove = await choose('  Which skill to remove?', [
      ...installed.map(id => ({ label: id, value: id })),
      { label: 'Cancel', value: null },
    ]);
    if (toRemove) {
      try {
        execSync(`clawhub uninstall ${toRemove}`, { stdio: 'inherit' });
        printStepDone(toRemove, 'removed');
        const manifest = readManifest();
        if (manifest) {
          writeManifest({ ...manifest, skills: (manifest.skills || []).filter(s => s !== toRemove) });
        }
      } catch {
        printStepFail(toRemove, 'remove failed');
      }
    }
  }

  closePrompt();
}
