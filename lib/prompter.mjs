import { createInterface } from 'node:readline';

// Simple readline-based prompts. Zero deps.

let rl;

function getRL() {
  if (!rl) {
    rl = createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}

export function closePrompt() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    getRL().question(question, (answer) => resolve(answer.trim()));
  });
}

export async function confirm(message, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await ask(`${message} ${hint} `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith('y');
}

export async function choose(message, options) {
  console.log(`\n${message}\n`);
  for (let i = 0; i < options.length; i++) {
    console.log(`  ${i + 1}. ${options[i].label}`);
  }
  console.log();
  const answer = await ask(`Choice [1-${options.length}]: `);
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return options[idx].value;
  // Default to first
  return options[0].value;
}

export async function input(message, defaultValue = '') {
  const hint = defaultValue ? ` [${defaultValue}]` : '';
  const answer = await ask(`${message}${hint}: `);
  return answer || defaultValue;
}

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function detectUserName() {
  const { env } = process;
  return env.USER || env.USERNAME || env.LOGNAME || 'User';
}

export async function promptInstallMode() {
  return choose('Install mode:', [
    { label: 'Fresh install — replace agents section (recommended for first install)', value: 'fresh' },
    { label: 'Merge — add A.L.I.C.E. agents alongside existing ones', value: 'merge' },
    { label: 'Upgrade — update product files only (preserves user customizations)', value: 'upgrade' },
  ]);
}

export async function promptUserInfo() {
  const name = await input('Your name', detectUserName());
  const tz = await input('Timezone', detectTimezone());
  const notes = await input('Any notes about yourself (optional)', '');
  return { name, timezone: tz, notes };
}

export async function promptModelPreset() {
  return choose('Model preset:', [
    { label: 'Sonnet (recommended) — claude-sonnet-4-6 for all agents', value: 'sonnet' },
    { label: 'Opus + Sonnet — Opus for orchestrator, Sonnet for specialists', value: 'opus-sonnet' },
    { label: 'OpenAI — GPT-4.1 / GPT-4.1-mini', value: 'openai' },
    { label: 'Local (Ollama) — requires local models', value: 'local' },
    { label: 'Custom — specify your own model strings', value: 'custom' },
  ]);
}

export async function promptCustomModel() {
  const primary = await input('Primary model (e.g., anthropic/claude-sonnet-4-6)');
  const orchestrator = await input('Orchestrator model (or same as primary)', primary);
  return { primary, orchestrator };
}

export async function promptTier() {
  return choose('Agent tier:', [
    { label: 'Starter (10 agents) — core team for most workflows', value: 'starter' },
    { label: 'Pro (all 28 agents) — full specialist roster', value: 'pro' },
  ]);
}
