#!/usr/bin/env node
/**
 * alice-cloud - Zero-touch client onboarding CLI for A.L.I.C.E. | Control
 * Usage: alice-cloud <command>
 *   --non-interactive  Skip interactive prompts (use env vars)
 *   ALICE_SUPABASE_TOKEN  Supabase access token (non-interactive mode)
 */

const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.openclaw');
const CONFIG_FILE = path.join(CONFIG_DIR, 'alice-cloud.json');
const API_BASE = 'https://alice.av3.ai/api/cloud';

const NON_INTERACTIVE = process.argv.includes('--non-interactive') || process.env.ALICE_NON_INTERACTIVE === '1';
const SUPABASE_TOKEN = process.env.ALICE_SUPABASE_TOKEN;

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { shell: true });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `exit ${code}`));
    });
    child.on('error', reject);
  });
}

// ── Login ──────────────────────────────────────────────────────────────────────
async function login(args) {
  const open = (await import('open')).default;
  const got = (await import('got')).default;

  // Non-interactive mode: use token from env
  if (NON_INTERACTIVE) {
    const token = SUPABASE_TOKEN;
    if (!token) {
      console.error('❌  ALICE_SUPABASE_TOKEN env var required for non-interactive login.');
      process.exit(1);
    }
    try {
      const res = await got(`${process.env.ALICE_SUPABASE_URL || 'https://xxxgvtwnlbtdgmlgccee.supabase.co'}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}` },
        throwHttpErrors: false,
      }).json();
      const config = loadConfig();
      config.supabaseToken = token;
      config.user = res;
      saveConfig(config);
      console.log('✅  Logged in as', res.email || res.user_metadata?.user_name || 'unknown');
      return;
    } catch (err) {
      console.error('❌  Token validation failed:', err.message);
      process.exit(1);
    }
  }

  console.log('🔐  A.L.I.C.E. Cloud login');
  console.log('   Opening browser for Supabase OAuth…');

  const supabaseUrl = process.env.ALICE_SUPABASE_URL || 'https://xxxgvtwnlbtdgmlgccee.supabase.co';
  const redirectUri = `${API_BASE}/auth/callback`;
  const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectUri)}`;

  await open(oauthUrl);
  console.log('   Browser opened. Complete login in your browser.');
  console.log('   After login, paste your Supabase access token here:');
  process.stdout.write('   > ');

  return new Promise((resolve, reject) => {
    let token = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (d) => { token += d; });
    process.stdin.on('end', async () => {
      token = token.trim();
      if (!token) { reject(new Error('No token provided')); return; }
      try {
        const res = await got(`${supabaseUrl}/auth/v1/user`, {
          headers: { Authorization: `Bearer ${token}` },
          throwHttpErrors: false,
        }).json();
        const config = loadConfig();
        config.supabaseToken = token;
        config.user = res;
        saveConfig(config);
        console.log('   ✅ Logged in as', res.email || res.user_metadata?.user_name || 'unknown');
        resolve();
      } catch (err) {
        reject(new Error('Token validation failed: ' + err.message));
      }
    });
  });
}

// ── Register ───────────────────────────────────────────────────────────────────
async function detectGatewayUrl() {
  const got = (await import('got')).default;
  const candidates = ['https://localhost:18789', 'http://localhost:18789'];
  for (const url of candidates) {
    try {
      await got.get(url, { throwHttpErrors: true, timeout: { request: 2000 }, retry: { limit: 0 } });
      return url;
    } catch (_) {}
  }
  return 'https://localhost:18789';
}

async function readGatewayToken() {
  const cfg = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  try {
    const data = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    return data.gateway?.auth?.token || '';
  } catch (_) {}
  return '';
}

async function getOpenClawVersion() {
  try { return (await runCommand('openclaw', ['--version'])).trim(); } catch (_) {}
  return 'unknown';
}

async function register(args) {
  const got = (await import('got')).default;
  const config = loadConfig();

  if (!config.supabaseToken) {
    console.error('❌  Not logged in. Run `alice-cloud login` first.');
    process.exit(1);
  }

  const gatewayUrl = await detectGatewayUrl();
  const gatewayToken = await readGatewayToken();
  const hostname = os.hostname();
  const version = await getOpenClawVersion();

  console.log('🔗  Registering gateway with A.L.I.C.E. Cloud…');
  console.log(`   Gateway URL : ${gatewayUrl}`);
  console.log(`   Hostname    : ${hostname}`);
  console.log(`   Version     : ${version}`);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await got.post(`${API_BASE}/register`, {
        json: { gatewayUrl, gatewayToken, hostname, version },
        headers: { Authorization: `Bearer ${config.supabaseToken}` },
        throwHttpErrors: true,
      }).json();
      config.registration = { gatewayUrl, hostname, version, registeredAt: new Date().toISOString() };
      saveConfig(config);
      console.log('   ✅ Gateway registered!');
      return;
    } catch (err) {
      lastError = err;
      const delay = attempt * 2000;
      console.log(`   ⚠️  Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms…`);
      await sleep(delay);
    }
  }
  console.error('❌  Registration failed after 3 attempts:', lastError.message);
  process.exit(1);
}

// ── Status ─────────────────────────────────────────────────────────────────────
async function status(args) {
  const got = (await import('got')).default;
  const config = loadConfig();

  if (!config.supabaseToken) {
    console.error('❌  Not logged in. Run `alice-cloud login` first.');
    process.exit(1);
  }

  try {
    const data = await got.get(`${API_BASE}/status`, {
      headers: { Authorization: `Bearer ${config.supabaseToken}` },
      throwHttpErrors: false,
    }).json();

    if (!data.registered) {
      console.log('⚪  No gateway registered.');
      console.log('   Run `alice-cloud register` to connect your gateway.');
      return;
    }

    console.log('🟢  A.L.I.C.E. Cloud Status');
    console.log(`   Gateway URL   : ${data.gatewayUrl}`);
    console.log(`   Hostname      : ${data.hostname}`);
    console.log(`   Status        : ${data.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
    console.log(`   Last heartbeat: ${data.lastHeartbeat ? new Date(data.lastHeartbeat).toLocaleString() : 'Never'}`);
    console.log(`   Version      : ${data.version}`);
  } catch (err) {
    if (err.response?.statusCode === 401) {
      console.error('❌  Session expired. Run `alice-cloud login` again.');
    } else {
      console.error('❌  Status check failed:', err.message);
    }
    process.exit(1);
  }
}

// ── Unregister ─────────────────────────────────────────────────────────────────
async function unregister(args) {
  const got = (await import('got')).default;
  const config = loadConfig();

  if (!config.supabaseToken) {
    console.error('❌  Not logged in. Run `alice-cloud login` first.');
    process.exit(1);
  }

  console.log('🗑️  Unregistering gateway…');
  try {
    await got.delete(`${API_BASE}/status`, {
      headers: { Authorization: `Bearer ${config.supabaseToken}` },
      throwHttpErrors: false,
    });
    delete config.registration;
    saveConfig(config);
    console.log('   ✅ Gateway unregistered.');
  } catch (err) {
    if (err.response?.statusCode === 404) {
      console.log('   ℹ️  No gateway was registered.');
    } else {
      console.error('❌  Unregister failed:', err.message);
      process.exit(1);
    }
  }
}

// ── Watch (daemon) ─────────────────────────────────────────────────────────────
async function checkGatewayUp(gatewayUrl) {
  const got = (await import('got')).default;
  try {
    await got.get(gatewayUrl, { throwHttpErrors: true, timeout: { request: 3000 }, retry: { limit: 0 } });
    return true;
  } catch (_) {}
  return false;
}

async function startHeartbeatLoop(config) {
  const got = (await import('got')).default;
  const gatewayUrl = config.registration?.gatewayUrl || 'https://localhost:18789';

  async function heartbeat() {
    try {
      const isUp = await checkGatewayUp(gatewayUrl);
      if (!isUp) {
        console.log('[watch] Gateway down, attempting restart…');
        try { await runCommand('openclaw', ['gateway', 'start']); await sleep(3000); } catch (_) {}
      }
      await got.post(`${API_BASE}/heartbeat`, {
        json: { hostname: os.hostname(), connected: await checkGatewayUp(gatewayUrl), timestamp: new Date().toISOString() },
        headers: { Authorization: `Bearer ${config.supabaseToken}` },
        throwHttpErrors: false, timeout: { request: 10000 },
      });
      console.log(`[${new Date().toLocaleTimeString()}] heartbeat sent (gateway: ${isUp ? 'up' : 'down'})`);
    } catch (err) {
      console.error('[watch] heartbeat error:', err.message);
    }
  }

  await heartbeat();
  const interval = setInterval(heartbeat, 30_000);
  process.on('SIGINT', () => { clearInterval(interval); process.exit(0); });
  process.on('SIGTERM', () => { clearInterval(interval); process.exit(0); });
}

async function watch(args) {
  const config = loadConfig();
  if (!config.supabaseToken) {
    console.error('❌  Not logged in. Run `alice-cloud login` first.');
    process.exit(1);
  }

  if (args.daemon || process.argv.includes('--daemon')) {
    const child = spawn(process.execPath, [__filename, 'watch', '--running'], {
      detached: true, stdio: 'ignore', env: { ...process.env, ALICE_NON_INTERACTIVE: '1' },
    });
    child.unref();
    console.log('🚀  alice-cloud watch started in background (PID:', child.pid, ')');
    return;
  }

  console.log('👁️  A.L.I.C.E. Cloud watch daemon started');
  console.log('   Press Ctrl+C to stop.');
  await startHeartbeatLoop(config);
}

// ── Programmatic API exports ───────────────────────────────────────────────────
// Allow ESM callers to import these via createRequire or spawn as child process.
module.exports = {
  login,
  register,
  status,
  unregister,
  watch,
  loadConfig,
  saveConfig,
  detectGatewayUrl,
  readGatewayToken,
  API_BASE,
  CONFIG_FILE,
};

// ── CLI dispatcher ─────────────────────────────────────────────────────────────
// Only run as CLI when this file is the main module (not when required/imported)
if (require.main === module) {
  const commands = { login, register, status, unregister, watch };
  const cmd = process.argv[2];

  if (!cmd) {
    console.log(`alice-cloud v1.0.1 — A.L.I.C.E. | Control Cloud CLI

Usage: alice-cloud <command> [options]

Commands:
  login        Authenticate with Supabase
  register     Register this gateway with A.L.I.C.E. Cloud
  status       Show gateway connection status
  unregister   Remove gateway registration
  watch        Start background heartbeat daemon

Options:
  --non-interactive  Use env vars (ALICE_SUPABASE_TOKEN) instead of prompts

Environment:
  ALICE_SUPABASE_TOKEN   Supabase access token (for non-interactive mode)
  ALICE_SUPABASE_URL     Supabase project URL (default: xxx project)

Run 'alice-cloud <command> --help' for more options.`);
    process.exit(0);
  }

  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }

  handler(process.argv.slice(3)).catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
