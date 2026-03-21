import { execSync } from 'node:child_process';

export const CODING_TOOL_OVERRIDES = new Set(['auto', 'claude', 'codex']);

const TOOL_CONFIG = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    cli: 'claude',
    skillHeading: 'Claude Code',
    primaryExample: `claude --permission-mode bypassPermissions --print 'YOUR TASK HERE. Run tests to verify.'`,
    reviewExample: `claude --permission-mode bypassPermissions --print 'Review the current changes for bugs, regressions, and missing tests. Output a numbered list of findings.'`,
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    cli: 'codex',
    skillHeading: 'Codex',
    primaryExample: `codex exec --full-auto -C /path/to/project 'YOUR TASK HERE. Run tests to verify.'`,
    reviewExample: `codex review --base main 'Review the current changes for bugs, regressions, and missing tests.'`,
  },
};

function commandExists(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  try {
    execSync(`${probe} ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function normalizeProviderId(provider) {
  if (!provider) return null;
  if (provider === 'openai-codex') return 'openai';
  return provider;
}

export function getModelProvider(model) {
  if (!model || typeof model !== 'string' || !model.includes('/')) return null;
  return normalizeProviderId(model.split('/')[0]);
}

function getPreferredToolForProvider(provider) {
  if (provider === 'anthropic') return 'claude';
  if (provider === 'openai') return 'codex';
  return null;
}

function validateOverride(override) {
  const normalized = String(override || 'auto').trim().toLowerCase() || 'auto';
  if (!CODING_TOOL_OVERRIDES.has(normalized)) {
    throw new Error(`Invalid --coding-tool value "${override}". Use auto, claude, or codex.`);
  }
  return normalized;
}

export function resolveCodingAgentPreference({ detectedModels = null, override = 'auto' } = {}) {
  const normalizedOverride = validateOverride(override);
  const available = {
    claude: commandExists(TOOL_CONFIG.claude.cli),
    codex: commandExists(TOOL_CONFIG.codex.cli),
  };
  const provider =
    getModelProvider(detectedModels?.primary) ||
    getModelProvider(detectedModels?.orchestrator) ||
    (detectedModels?.providers || [])
      .map(normalizeProviderId)
      .find((entry) => entry === 'anthropic' || entry === 'openai') ||
    null;

  let preferredTool = normalizedOverride === 'auto' ? getPreferredToolForProvider(provider) : normalizedOverride;

  if (!preferredTool) {
    if (available.codex) {
      preferredTool = 'codex';
    } else if (available.claude) {
      preferredTool = 'claude';
    } else {
      preferredTool = 'codex';
    }
  }

  const fallbackTool = preferredTool === 'codex' ? 'claude' : 'codex';
  const selectionReason =
    normalizedOverride !== 'auto'
      ? `manual override (--coding-tool ${preferredTool})`
      : provider
        ? `detected ${provider} as the default OpenClaw provider`
        : available.codex || available.claude
          ? 'no provider-specific default detected; using the first available coding CLI'
          : 'no coding CLI detected yet; generated guidance includes both Codex and Claude Code';

  return {
    override: normalizedOverride,
    provider,
    preferredTool,
    fallbackTool,
    preferred: TOOL_CONFIG[preferredTool],
    fallback: TOOL_CONFIG[fallbackTool],
    available,
    selectionReason,
    skillId: 'coding-agent',
    skillPath: '~/.openclaw/skills/coding-agent/SKILL.md',
  };
}

export function buildCodingAgentSkillContent(preference) {
  const preferredAvailability = preference.available[preference.preferred.id]
    ? `${preference.preferred.cli} is installed on this machine.`
    : `${preference.preferred.cli} is not currently installed; check before using it.`;
  const fallbackAvailability = preference.available[preference.fallback.id]
    ? `${preference.fallback.cli} is also available as a fallback.`
    : `${preference.fallback.cli} is the fallback if you install it later.`;
  const providerLabel = preference.provider || 'unknown';

  return `---
name: coding-agent
description: 'Delegate substantial coding work to the preferred coding CLI for this install. Use when: multi-file implementation, refactors, build/test verification, deep codebase exploration, or structured code review. Prefer ${preference.preferred.name} first, then fall back to ${preference.fallback.name} if needed.'
metadata:
  {
    "openclaw": { "emoji": "⚙️", "requires": { "anyBins": ["${preference.preferred.cli}", "${preference.fallback.cli}"] } }
  }
---

# Coding Agent Skill

This bundled skill routes coding work through the preferred CLI for this install.

- Preferred tool: **${preference.preferred.name}**
- Fallback tool: **${preference.fallback.name}**
- Detection basis: ${preference.selectionReason}
- Current provider signal: ${providerLabel}

## Availability

- ${preferredAvailability}
- ${fallbackAvailability}

## When to use this skill

Use this skill when the task requires:
- Modifying multiple files
- Running build, lint, or test commands to verify correctness
- Exploring an unfamiliar codebase before implementing
- A focused code review with concrete findings

## Preferred path: ${preference.preferred.skillHeading}

\`\`\`
${preference.preferred.primaryExample}
\`\`\`

Review-only example:

\`\`\`
${preference.preferred.reviewExample}
\`\`\`

## Fallback path: ${preference.fallback.skillHeading}

\`\`\`
${preference.fallback.primaryExample}
\`\`\`

Review-only example:

\`\`\`
${preference.fallback.reviewExample}
\`\`\`

## Rules

1. Use the preferred tool first unless it is unavailable or blocked.
2. Always point the tool at the project root before asking it to work.
3. Ask it to run the relevant verification commands before finishing.
4. Summarize what changed and any remaining risks when reporting back.
5. Do not use this skill for trivial one-line edits or pure planning.

## Quick check

\`\`\`
which ${preference.preferred.cli} || which ${preference.fallback.cli}
\`\`\`
`;
}
