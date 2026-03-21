import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir, hostname } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENCLAW_HOME = process.env.OPENCLAW_HOME || join(homedir(), '.openclaw');
const CONFIG_PATH = join(OPENCLAW_HOME, 'openclaw.json');
const MC_CONFIG_PATH = join(OPENCLAW_HOME, '.alice-mission-control.json');
const BRIDGE_ID = 'mission-control-bridge';
const DEFAULT_DASHBOARD_URL = 'https://alice.av3.ai';
const DEFAULT_ADMIN_URL = 'https://admin.av3.ai';
const DEFAULT_INGEST_URL = `${DEFAULT_DASHBOARD_URL}/api/v1/ingest`;
const TEMPLATE_DIR = join(__dirname, '..', 'templates', 'mission-control-bridge');

function normalizeUrl(url, fallback) {
  const value = String(url || fallback || '').trim();
  if (!value) return '';
  return value.replace(/\/+$/, '');
}

function atomicWriteJSON(targetPath, data) {
  const tmpPath = `${targetPath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  renameSync(tmpPath, targetPath);
}

function readJsonFile(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

export function getMissionControlConfigPath() {
  return MC_CONFIG_PATH;
}

export function readMissionControlConfig() {
  return readJsonFile(MC_CONFIG_PATH);
}

export function buildMissionControlSettings(input = {}) {
  const dashboardUrl = normalizeUrl(input.dashboardUrl, DEFAULT_DASHBOARD_URL);
  const adminUrl = normalizeUrl(input.adminUrl, DEFAULT_ADMIN_URL);
  const ingestUrl = normalizeUrl(input.ingestUrl, `${dashboardUrl}/api/v1/ingest`);
  const runtimeBaseUrl = normalizeUrl(input.runtimeBaseUrl, `${dashboardUrl}/api/v1/runtime`);
  const adminHeartbeatUrl = normalizeUrl(input.adminHeartbeatUrl, `${adminUrl}/api/admin/v1/node-heartbeat`);
  const commandsUrl = normalizeUrl(input.commandsUrl, `${runtimeBaseUrl}/commands`);
  const nodeRegisterUrl = normalizeUrl(input.nodeRegisterUrl, `${runtimeBaseUrl}/nodes/register`);
  const nodeHeartbeatUrl = normalizeUrl(input.nodeHeartbeatUrl, `${runtimeBaseUrl}/nodes/heartbeat`);
  const sourceNode = String(input.sourceNode || hostname() || 'openclaw-local').trim();
  const ingestToken = String(input.ingestToken || '').trim();
  const workerToken = String(input.workerToken || ingestToken || '').trim();
  const teamId = String(input.teamId || '').trim();
  const teamSlug = String(input.teamSlug || '').trim();
  const teamName = String(input.teamName || '').trim();
  const teamPlan = String(input.teamPlan || '').trim();

  return {
    enabled: input.enabled !== false,
    provider: 'cloud',
    dashboardUrl,
    adminUrl,
    ingestUrl,
    runtimeBaseUrl,
    adminHeartbeatUrl,
    commandsUrl,
    nodeRegisterUrl,
    nodeHeartbeatUrl,
    sourceNode,
    ...(teamId ? { teamId } : {}),
    ...(teamSlug ? { teamSlug } : {}),
    ...(teamName ? { teamName } : {}),
    ...(teamPlan ? { teamPlan } : {}),
    ...(ingestToken ? { ingestToken } : {}),
    ...(workerToken ? { workerToken } : {}),
  };
}

export function writeMissionControlConfig(input = {}) {
  mkdirSync(OPENCLAW_HOME, { recursive: true });

  const existing = readMissionControlConfig();
  const settings = buildMissionControlSettings({
    ...existing?.cloud,
    ...input,
  });

  const config = {
    version: 1,
    updatedAt: new Date().toISOString(),
    cloud: settings,
  };

  atomicWriteJSON(MC_CONFIG_PATH, config);
  return { path: MC_CONFIG_PATH, config };
}

function ensureBridgeFiles(targetPath) {
  mkdirSync(dirname(targetPath), { recursive: true });
  cpSync(TEMPLATE_DIR, targetPath, { recursive: true, force: true });
}

export function installMissionControlBridge() {
  const sourcePath = join(OPENCLAW_HOME, 'plugins', BRIDGE_ID);
  const installPath = join(OPENCLAW_HOME, 'extensions', BRIDGE_ID);

  ensureBridgeFiles(sourcePath);
  ensureBridgeFiles(installPath);

  return { sourcePath, installPath };
}

export function enableMissionControlBridge() {
  const config = readJsonFile(CONFIG_PATH);
  if (!config) {
    throw new Error('OpenClaw config not found. Run openclaw configure first.');
  }

  const existingInstall = config?.plugins?.installs?.[BRIDGE_ID] || {};
  const { sourcePath, installPath } = installMissionControlBridge();
  const pkg = readJsonFile(join(TEMPLATE_DIR, 'package.json')) || {};

  config.plugins = config.plugins || {};
  config.plugins.entries = config.plugins.entries || {};
  config.plugins.installs = config.plugins.installs || {};

  config.plugins.entries[BRIDGE_ID] = {
    ...(config.plugins.entries[BRIDGE_ID] || {}),
    enabled: true,
  };

  config.plugins.installs[BRIDGE_ID] = {
    source: 'path',
    sourcePath,
    installPath,
    version: pkg.version || existingInstall.version || '1.0.0',
    installedAt: existingInstall.installedAt || new Date().toISOString(),
  };

  atomicWriteJSON(CONFIG_PATH, config);
  return { configPath: CONFIG_PATH, sourcePath, installPath };
}

export function configureMissionControlCloud(input = {}) {
  const configResult = writeMissionControlConfig(input);
  const bridgeResult = enableMissionControlBridge();
  const settings = configResult.config.cloud;

  return {
    configPath: configResult.path,
    bridgeSourcePath: bridgeResult.sourcePath,
    bridgeInstallPath: bridgeResult.installPath,
    summary: {
      enabled: settings.enabled,
      provider: settings.provider,
      dashboardUrl: settings.dashboardUrl,
      adminUrl: settings.adminUrl,
      ingestUrl: settings.ingestUrl,
      runtimeBaseUrl: settings.runtimeBaseUrl,
      adminHeartbeatUrl: settings.adminHeartbeatUrl,
      sourceNode: settings.sourceNode,
      teamId: settings.teamId ?? null,
      teamSlug: settings.teamSlug ?? null,
      teamName: settings.teamName ?? null,
      teamPlan: settings.teamPlan ?? null,
      hasIngestToken: !!settings.ingestToken,
      hasWorkerToken: !!settings.workerToken,
    },
  };
}

export function getDefaultMissionControlSettings() {
  return buildMissionControlSettings();
}

export function hasMissionControlBridgeInstalled() {
  return existsSync(join(OPENCLAW_HOME, 'extensions', BRIDGE_ID));
}
