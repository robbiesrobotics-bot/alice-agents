import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const MANIFEST_NAME = '.alice-manifest.json';
const PACKAGE_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version || '0.0.0';

export function getManifestPath() {
  return join(homedir(), '.openclaw', MANIFEST_NAME);
}

export function readManifest() {
  try {
    const raw = readFileSync(getManifestPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeManifest(data) {
  const existing = readManifest() || {};
  const now = new Date().toISOString();
  const manifest = {
    ...existing,
    version: data.version || existing.version || PACKAGE_VERSION,
    schemaVersion: 2,
    packageVersion: data.packageVersion || existing.packageVersion || PACKAGE_VERSION,
    installedAt: data.installedAt || existing.installedAt || now,
    updatedAt: now,
    tier: data.tier ?? existing.tier ?? 'starter',
    agents: Array.isArray(data.agents) ? [...new Set(data.agents)] : (existing.agents || []),
    userName: data.userName ?? existing.userName ?? null,
    userTimezone: data.userTimezone ?? existing.userTimezone ?? null,
    modelPreset: data.modelPreset ?? existing.modelPreset ?? null,
    missionControl: data.missionControl ?? existing.missionControl ?? null,
    skills: Array.isArray(data.skills) ? [...new Set(data.skills)] : (existing.skills || []),
    codingTool: data.codingTool ?? existing.codingTool ?? null,
    codingSkill: data.codingSkill ?? existing.codingSkill ?? null,
  };
  writeFileSync(getManifestPath(), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}
