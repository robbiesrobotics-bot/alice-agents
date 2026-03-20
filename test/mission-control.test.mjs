import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEMP_HOME = join(tmpdir(), `alice-mc-test-${Date.now()}`);
const TEMP_OPENCLAW = join(TEMP_HOME, '.openclaw');
mkdirSync(TEMP_OPENCLAW, { recursive: true });
writeFileSync(join(TEMP_OPENCLAW, 'openclaw.json'), JSON.stringify({ agents: {}, plugins: {} }, null, 2));

const originalHome = process.env.HOME;
const originalOpenClawHome = process.env.OPENCLAW_HOME;
process.env.HOME = TEMP_HOME;
process.env.OPENCLAW_HOME = TEMP_OPENCLAW;

const {
  buildMissionControlSettings,
  configureMissionControlCloud,
  getMissionControlConfigPath,
  readMissionControlConfig,
} = await import('../lib/mission-control.mjs');

process.env.HOME = originalHome;
if (originalOpenClawHome === undefined) {
  delete process.env.OPENCLAW_HOME;
} else {
  process.env.OPENCLAW_HOME = originalOpenClawHome;
}

after(() => {
  rmSync(TEMP_HOME, { recursive: true, force: true });
});

describe('mission-control installer helpers', () => {
  test('buildMissionControlSettings derives ingest URL from dashboard URL', () => {
    const settings = buildMissionControlSettings({
      dashboardUrl: 'https://alice.av3.ai/',
      sourceNode: 'test-node',
    });

    assert.equal(settings.dashboardUrl, 'https://alice.av3.ai');
    assert.equal(settings.ingestUrl, 'https://alice.av3.ai/api/v1/ingest');
    assert.equal(settings.runtimeBaseUrl, 'https://alice.av3.ai/api/v1/runtime');
    assert.equal(settings.commandsUrl, 'https://alice.av3.ai/api/v1/runtime/commands');
    assert.equal(settings.nodeRegisterUrl, 'https://alice.av3.ai/api/v1/runtime/nodes/register');
    assert.equal(settings.nodeHeartbeatUrl, 'https://alice.av3.ai/api/v1/runtime/nodes/heartbeat');
    assert.equal(settings.sourceNode, 'test-node');
  });

  test('configureMissionControlCloud writes config and installs bridge', () => {
    const result = configureMissionControlCloud({
      dashboardUrl: 'https://alice.av3.ai',
      ingestToken: 'test-token',
      sourceNode: 'portable-node',
    });

    assert.equal(result.summary.enabled, true);
    assert.equal(result.summary.dashboardUrl, 'https://alice.av3.ai');
    assert.equal(result.summary.ingestUrl, 'https://alice.av3.ai/api/v1/ingest');
    assert.equal(result.summary.runtimeBaseUrl, 'https://alice.av3.ai/api/v1/runtime');
    assert.equal(result.summary.hasIngestToken, true);
    assert.equal(result.summary.hasWorkerToken, true);
    assert.ok(existsSync(result.configPath), 'mission control config should exist');
    assert.ok(existsSync(join(result.bridgeSourcePath, 'index.ts')), 'bridge source should be installed');
    assert.ok(existsSync(join(result.bridgeInstallPath, 'openclaw.plugin.json')), 'bridge extension metadata should be installed');
  });

  test('configureMissionControlCloud enables plugin in openclaw.json', () => {
    const openclawConfig = JSON.parse(readFileSync(join(TEMP_OPENCLAW, 'openclaw.json'), 'utf8'));
    assert.equal(openclawConfig.plugins.entries['mission-control-bridge'].enabled, true);
    assert.ok(openclawConfig.plugins.installs['mission-control-bridge'].sourcePath.includes('.openclaw/plugins/mission-control-bridge'));
  });

  test('readMissionControlConfig returns stored cloud settings', () => {
    const config = readMissionControlConfig();
    assert.ok(config);
    assert.equal(config.cloud.dashboardUrl, 'https://alice.av3.ai');
    assert.equal(config.cloud.commandsUrl, 'https://alice.av3.ai/api/v1/runtime/commands');
    assert.equal(config.cloud.sourceNode, 'portable-node');
    assert.equal(config.cloud.ingestToken, 'test-token');
    assert.equal(config.cloud.workerToken, 'test-token');
    assert.equal(getMissionControlConfigPath(), join(TEMP_OPENCLAW, '.alice-mission-control.json'));
  });
});
