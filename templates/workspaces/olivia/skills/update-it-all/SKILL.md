---
name: update-it-all
description: "Automates the full A.L.I.C.E. product update cycle after major releases. Auto-detects new/removed agents, generates changelog + release notes, waits for confirmation, then commits, tags, and publishes to npm. Use whenever agents are added/removed or a significant feature lands."
---

# Update It All

Automates the complete A.L.I.C.E. product update cycle — from auto-detection to npm publish — with zero manual changelog writing.

## Philosophy

The script **auto-detects what changed** by diffing git history and `agents.ts`, **generates the full changelog and release notes draft for you to review**, and only pushes when you confirm. You provide the judgment call; it handles the mechanical work.

## Quick Start

```bash
# Interactive (recommended) — auto-detects, shows draft, waits for confirm
bash ~/.openclaw/workspace-olivia/scripts/update-it-all.sh

# Dry run — see what would be detected without changing anything
bash ~/.openclaw/workspace-olivia/scripts/update-it-all.sh --dry-run

# Non-interactive — auto-confirms (for CI)
bash ~/.openclaw/workspace-olivia/scripts/update-it-all.sh --confirm
```

## What Gets Auto-Detected

| What changed | How detected | Result |
|---|---|---|
| New agents | `git diff agents.ts` vs last tag | Added to changelog as `feat` |
| Removed agents | Same diff | Added to changelog as `chore` |
| Version bump type | Minor if new agents, else patch | Suggested automatically |
| Landing page changes | Git diff of landing dir | `chore: landing page updated` |

## How the Pipeline Works

1. **Detect** — Diff `agents.ts` against the last git tag to find new/removed agents
2. **Generate** — Auto-build the changelog entry + release notes draft
3. **Review** — Shows you the draft and asks for version number + confirmation
4. **Execute** — On confirm: commits, pushes, runs tests, tags, publishes npm
5. **Verify** — Confirms the version is live on npm

## What the Output Looks Like

When you run the script, it shows you:

```
Current state:
  Last git tag:       v1.5.1
  Current version:     1.5.1
  Suggested bump:      minor → v1.5.2
  New agents:         aria, nate
  Removed agents:     none
  Total agents after:  31

Draft changelog entry:

  ## v1.5.2 — 2026-03-26
  - **feat** Agent roster expanded — 2 new agent(s): aria, nate
  - **chore** Landing page and documentation updated

  New version [v1.5.2]:    ← you can override here
  Proceed with v1.5.2? [y/N]  ← your call
```

## Version Bump Rules

| Change | Bump type |
|---|---|
| New agent(s) added | **Minor** (`1.5.1` → `1.5.2`) |
| Agent(s) removed | **Minor** (`1.5.1` → `1.5.2`) |
| Internal fixes only | **Patch** (`1.5.1` → `1.5.1`) |

You can always override the suggested version at the prompt.

## What Gets Committed and Pushed

### Landing page (`robbiesrobotics/alice-landing`)
- `content/changelog.md` — new entry prepended
- `lib/agents.ts` — new agent entries (if any)
- `components/AgentGrid.tsx` — updated counts

### alice-agents package (`robbiesrobotics/alice-agents`)
- `package.json` — version bumped
- `README.md` — agent table + counts updated
- `landing/` — submodule updated to new landing commit
- `releases/v{VERSION}.md` — release notes generated

## What the Script Does NOT Touch

These require manual attention after the script runs:
- `ROSTER.md` — full agent entries (if new agents were added)
- `HEARTBEAT.md` — agent count (auto-updated by script)
- Landing page `vercel.json` or env vars
- Any third-party integrations (Stripe, Supabase, etc.)

## Git Credential Setup

If `git push` fails with `could not read Username for 'https://github.com'`, the script auto-sets this:

```bash
git config --global credential.helper "$(which gh) auth git-credential"
```

The `gh` CLI is logged in as `robbiesrobotics-bot` and handles auth automatically.

## Test Failures

If `npm test` fails, the script pauses and asks:

```
Some tests failed. Continue anyway? [y/N]
```

Always fix tests before tagging. The most common cause is agent count assertions in `lib/agent-registry.mjs` that don't match the actual agent list.

## Key File Locations

| File | Path |
|---|---|
| Master script | `~/.openclaw/workspace-olivia/scripts/update-it-all.sh` |
| Landing page | `~/.openclaw/workspace-olivia/alice-agents/landing/` |
| Changelog (landing) | `landing/content/changelog.md` |
| Agent grid lib | `landing/lib/agents.ts` |
| alice-agents package | `~/.openclaw/workspace-olivia/alice-agents/` |
| npm package.json | `alice-agents/package.json` |
| Release notes | `alice-agents/releases/v{VERSION}.md` |
| Workspace HEARTBEAT | `~/.openclaw/workspace-olivia/HEARTBEAT.md` |

## When to Run This Skill

Run `update-it-all` when:
- A new agent was added to the roster
- An agent was renamed or removed
- A major feature lands in alice-agents or Mission Control
- The landing page had significant content changes
- After any `git commit` that touches `agents.ts`, `landing/`, or `README.md`

Do NOT run this for:
- Hotfixes that don't touch agents or landing page
- Docs-only changes
- Dependency bumps (use `npm version patch` instead)
