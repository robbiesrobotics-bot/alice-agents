import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getAgentIdsForTier, normalizeTier } from '../lib/agent-registry.mjs';

describe('agent registry', () => {
  test('normalizes unsupported tiers to starter', () => {
    assert.equal(normalizeTier('enterprise'), 'starter');
  });

  test('loads starter and pro rosters with expected counts', () => {
    assert.equal(getAgentIdsForTier('starter').length, 10);
    assert.equal(getAgentIdsForTier('pro').length, 28);
  });
});
