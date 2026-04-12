---
name: coding-agent
description: 'Delegate substantial coding work to the preferred coding CLI for this install. Use when: multi-file implementation, refactors, build/test verification, deep codebase exploration, or structured code review. Prefer Claude Code first, then fall back to Codex if needed.'
metadata:
  {
    "openclaw": { "emoji": "⚙️", "requires": { "anyBins": ["claude", "codex"] } }
  }
---

# Coding Agent Skill

This bundled skill routes coding work through the preferred CLI for this install.

- Preferred tool: **Claude Code**
- Fallback tool: **Codex**
- Detection basis: detected minimax-portal as the default OpenClaw provider
- Current provider signal: minimax-portal

## Availability

- claude is installed on this machine.
- codex is the fallback if you install it later.

## When to use this skill

Use this skill when the task requires:
- Modifying multiple files
- Running build, lint, or test commands to verify correctness
- Exploring an unfamiliar codebase before implementing
- A focused code review with concrete findings

## Preferred path: Claude Code

```
claude --permission-mode bypassPermissions --print 'YOUR TASK HERE. Run tests to verify.'
```

Review-only example:

```
claude --permission-mode bypassPermissions --print 'Review the current changes for bugs, regressions, and missing tests. Output a numbered list of findings.'
```

## Fallback path: Codex

```
codex exec --full-auto -C /path/to/project 'YOUR TASK HERE. Run tests to verify.'
```

Review-only example:

```
codex review --base main 'Review the current changes for bugs, regressions, and missing tests.'
```

## Rules

1. Use the preferred tool first unless it is unavailable or blocked.
2. Always point the tool at the project root before asking it to work.
3. Ask it to run the relevant verification commands before finishing.
4. Summarize what changed and any remaining risks when reporting back.
5. Do not use this skill for trivial one-line edits or pure planning.

## Quick check

```
which claude || which codex
```
