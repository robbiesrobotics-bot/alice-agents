import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getAgentIdsForTier, loadAgentRegistry, normalizeTier } from '../lib/agent-registry.mjs';

describe('agent registry', () => {
  test('normalizes unsupported tiers to starter', () => {
    assert.equal(normalizeTier('enterprise'), 'starter');
  });

  test('loads starter and pro rosters with expected counts', () => {
    assert.equal(getAgentIdsForTier('starter').length, 14);
    assert.equal(getAgentIdsForTier('pro').length, 36);
    assert.equal(getAgentIdsForTier('pro', { runtime: 'hermes' })[0], 'alice');
  });

  test('includes Athena as the software delivery lead for existing coding specialists', () => {
    // Starter tier — defensive filter drops nadia (pro-only) from Athena's
    // allowAgents at registry load time.
    const athena = loadAgentRegistry('starter').find((entry) => entry.id === 'athena');

    assert.equal(athena?.name, 'Athena');
    assert.equal(athena?.domain, 'Software Delivery');
    assert.equal(athena?.coding, false);
    assert.equal(athena?.tools?.profile, 'full');
    assert.deepEqual(athena?.extraConfig?.groupChat, {
      mentionPatterns: ['@athena', 'athena'],
    });
    assert.deepEqual(athena?.extraConfig?.subagents?.allowAgents, [
      'sasha',
      'dylan',
      'morgan',
      'priya',
      'felix',
      'quinn',
      'devon',
      'selena',
      'daphne',
    ]);
  });

  test('Athena keeps nadia in allowAgents when loaded as pro tier', () => {
    // Pro tier includes nadia in the roster, so the defensive filter keeps her.
    const athena = loadAgentRegistry('pro').find((entry) => entry.id === 'athena');
    assert.deepEqual(athena?.extraConfig?.subagents?.allowAgents, [
      'sasha',
      'dylan',
      'morgan',
      'priya',
      'felix',
      'quinn',
      'devon',
      'nadia',
      'selena',
      'daphne',
    ]);
  });
});
