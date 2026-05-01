import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getAgentIdsForTier, loadAgentRegistry, normalizeTier } from '../lib/agent-registry.mjs';

describe('agent registry', () => {
  test('normalizes unsupported tiers to starter', () => {
    assert.equal(normalizeTier('enterprise'), 'starter');
  });

  test('loads starter and pro rosters with expected counts', () => {
    assert.equal(getAgentIdsForTier('starter').length, 11);
    assert.equal(getAgentIdsForTier('pro').length, 34);
    assert.equal(getAgentIdsForTier('pro', { runtime: 'hermes' })[0], 'alice');
  });

  test('includes Athena as the software delivery lead for existing coding specialists', () => {
    const athena = loadAgentRegistry('starter').find((entry) => entry.id === 'athena');

    assert.equal(athena?.name, 'Athena');
    assert.equal(athena?.domain, 'Software Delivery');
    assert.equal(athena?.coding, false);
    assert.equal(athena?.tools?.profile, 'full');
    assert.deepEqual(athena?.extraConfig?.groupChat, {
      mentionPatterns: ['@athena', 'athena'],
    });
    assert.deepEqual(athena?.extraConfig?.subagents, {
      allowAgents: ['dylan', 'felix', 'quinn', 'devon', 'nadia', 'morgan', 'selena', 'daphne'],
    });
  });
});
