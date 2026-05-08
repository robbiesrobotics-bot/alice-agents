import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const MANIFEST_NAME = '.alice-manifest.json';
const PACKAGE_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version || '0.0.0';

export function getManifestPath(runtime = null) {
  if (runtime === 'alice-runtime') return join(homedir(), '.alice', MANIFEST_NAME);
  return join(homedir(), '.openclaw', MANIFEST_NAME);
}

export function readManifest() {
  try {
    const aliceRuntimePath = getManifestPath('alice-runtime');
    const raw = readFileSync(existsSync(aliceRuntimePath) ? aliceRuntimePath : getManifestPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeManifest(data) {
  const existing = readManifest() || {};
  const manifestPath = getManifestPath(data.runtime);
  const now = new Date().toISOString();
  const { missionControl: _legacyMissionControl, ...existingClean } = existing;
  const manifest = {
    ...existingClean,
    version: data.version || existing.version || PACKAGE_VERSION,
    schemaVersion: 3,
    packageVersion: data.packageVersion || PACKAGE_VERSION,
    installedAt: data.installedAt || existing.installedAt || now,
    updatedAt: now,
    tier: data.tier ?? existing.tier ?? 'starter',
    agents: Array.isArray(data.agents) ? [...new Set(data.agents)] : (existing.agents || []),
    userName: data.userName ?? existing.userName ?? null,
    userTimezone: data.userTimezone ?? existing.userTimezone ?? null,
    runtime: data.runtime ?? existing.runtime ?? 'openclaw',
    modelPreset: data.modelPreset ?? existing.modelPreset ?? null,
    skills: Array.isArray(data.skills) ? [...new Set(data.skills)] : (existing.skills || []),
    codingTool: data.codingTool ?? existing.codingTool ?? null,
    codingSkill: data.codingSkill ?? existing.codingSkill ?? null,
  };
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}
