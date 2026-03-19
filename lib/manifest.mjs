import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const MANIFEST_NAME = '.alice-manifest.json';

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
  const manifest = {
    version: '1.0.0',
    installedAt: data.installedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tier: data.tier,
    agents: data.agents,
    userName: data.userName,
    userTimezone: data.userTimezone,
    modelPreset: data.modelPreset,
    missionControl: data.missionControl || null,
  };
  writeFileSync(getManifestPath(), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}
