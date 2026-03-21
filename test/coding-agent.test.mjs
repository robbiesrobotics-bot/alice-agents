import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCodingAgentSkillContent,
  getModelProvider,
  normalizeProviderId,
  resolveCodingAgentPreference,
} from '../lib/coding-agent.mjs';

describe('coding-agent helpers', () => {
  test('normalizes openai-codex to openai', () => {
    assert.equal(normalizeProviderId('openai-codex'), 'openai');
  });

  test('extracts provider from model id', () => {
    assert.equal(getModelProvider('anthropic/claude-sonnet-4-6'), 'anthropic');
    assert.equal(getModelProvider('openai/gpt-5.4'), 'openai');
  });

  test('prefers Claude Code for Anthropic defaults', () => {
    const result = resolveCodingAgentPreference({
      detectedModels: {
        primary: 'anthropic/claude-sonnet-4-6',
        providers: ['anthropic'],
      },
      override: 'auto',
    });

    assert.equal(result.preferredTool, 'claude');
    assert.equal(result.fallbackTool, 'codex');
  });

  test('prefers Codex for OpenAI defaults', () => {
    const result = resolveCodingAgentPreference({
      detectedModels: {
        primary: 'openai/gpt-5.4',
        providers: ['openai'],
      },
      override: 'auto',
    });

    assert.equal(result.preferredTool, 'codex');
    assert.equal(result.fallbackTool, 'claude');
  });

  test('manual override wins over detected provider', () => {
    const result = resolveCodingAgentPreference({
      detectedModels: {
        primary: 'anthropic/claude-sonnet-4-6',
        providers: ['anthropic'],
      },
      override: 'codex',
    });

    assert.equal(result.preferredTool, 'codex');
    assert.match(result.selectionReason, /manual override/i);
  });

  test('builds a skill document with preferred and fallback tools', () => {
    const content = buildCodingAgentSkillContent({
      override: 'auto',
      provider: 'openai',
      preferredTool: 'codex',
      fallbackTool: 'claude',
      preferred: {
        id: 'codex',
        name: 'Codex',
        cli: 'codex',
        skillHeading: 'Codex',
        primaryExample: `codex exec --full-auto -C /path/to/project 'Task'`,
        reviewExample: `codex review --base main 'Review'`,
      },
      fallback: {
        id: 'claude',
        name: 'Claude Code',
        cli: 'claude',
        skillHeading: 'Claude Code',
        primaryExample: `claude --permission-mode bypassPermissions --print 'Task'`,
        reviewExample: `claude --permission-mode bypassPermissions --print 'Review'`,
      },
      available: { codex: true, claude: false },
      selectionReason: 'detected openai as the default OpenClaw provider',
    });

    assert.match(content, /Preferred tool: \*\*Codex\*\*/);
    assert.match(content, /Fallback tool: \*\*Claude Code\*\*/);
    assert.match(content, /codex exec --full-auto/);
  });
});
