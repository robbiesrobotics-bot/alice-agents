# Hermes Agent Integration

> Enable Hermes agents as first-class team members on the A.L.I.C.E. platform.

## Overview

A.L.I.C.E. can create and manage **Hermes agents** — specialist agents powered by Hermes Agent that run as subprocesses alongside the existing OpenClaw agents (Dylan, Selena, Devon, etc.).

Hermes agents bring two key capabilities that OpenClaw agents don't have natively:
1. **Long-term cross-session memory** via Hermes's built-in `~/.hermes/memories/`
2. **Reusable skill documents** — SKILL.md files that persist learned procedures

## Installation

### Automatic Detection During Install

When you run the A.L.I.C.E. installer, it **automatically detects if Hermes is installed**:

```bash
npx @robbiesrobotics/alice-agents --yes
```

- **Hermes found:** shows version and skips install
- **Hermes not found + `--hermes-bridge` set:** offers to install it automatically
- **Hermes not found + no flag:** shows informational message with install instructions

### Enable Hermes Bridge

**Option 1 — During A.L.I.C.E. Install (recommended)**

```bash
npx @robbiesrobotics/alice-agents --yes --hermes-bridge
```

This will:
- Detect if Hermes is already installed
- If not, offer to install it automatically (or skip with confirmation)
- Create `~/.openclaw/hermes-agents.json` (the registry)
- Verify Hermes is reachable

**Option 2 — Enable on Existing Install**

```bash
npx @robbiesrobotics/alice-agents --skills
# Choose: Manage Hermes agents
```

This launches the interactive Hermes Agents Manager.

## Creating a Hermes Agent

```bash
npx @robbiesrobotics/alice-agents --skills
# Choose: Manage Hermes agents → Create a Hermes agent
```

You'll be prompted for:
- **Agent ID** — unique name, e.g. `researcher`, `analyst`, `data-specialist`
- **Domain** — e.g. `Research`, `Data Analysis`, `Code Review`
- **Description** — what this agent does
- **Preload skills** — optional comma-separated Hermes skills to load, e.g. `web-search,codex`

This creates:
- `~/.hermes/skills/alice/<agent-id>/SKILL.md` — the agent's skill document
- An entry in `~/.openclaw/hermes-agents.json`

## How A.L.I.C.E. Uses Hermes Agents

### Spawning a Task

A.L.I.C.E. spawns a Hermes agent per task using:

```bash
hermes chat -q "<task prompt>" \
  -s <skill1,skill2> \
  --provider <provider> \
  --model <model> \
  -t <toolsets> \
  -Q
```

The spawn is:
- **Subprocess per task** — fresh process per assignment, exits when done
- **Memory-persistent** — Hermes automatically reads/writes `~/.hermes/memories/<agent-id>/`
- **Model-inherited** — `--provider` and `--model` flags come from OpenClaw's detected config

### Communication Flow

```
User → A.L.I.C.E. → [Dylan | Selena | Hermes-researcher | ...] → A.L.I.C.E. → User
```

## Model Inheritance

When A.L.I.C.E. spawns a Hermes agent, it reads the default model from OpenClaw config and passes it via CLI flags:

| OpenClaw Config | Hermes CLI Flag |
|----------------|----------------|
| `anthropic/claude-sonnet-4-6` | `--provider anthropic --model claude-sonnet-4-6` |
| `openai/gpt-5.4-mini` | `--provider openai --model gpt-5.4-mini` |
| `minimax/MiniMax-M2.7-highspeed` | `--provider minimax --model MiniMax-M2.7-highspeed` |

## Skills

Hermes agents use standard Hermes skill format — SKILL.md files at:

```
~/.hermes/skills/alice/<agent-id>/SKILL.md
```

Built-in Hermes skills you can preload:
- `web-search` — browse and search the web
- `codex` — OpenAI Codex for code
- `claude-code` — Anthropic Claude for code
- `opencode` — Universal coding agent
- `github` — GitHub CLI tools
- `jupyter-live-kernel` — Python data analysis
- And 60+ more via `hermes skills browse`

## Removing a Hermes Agent

```bash
npx @robbiesrobotics/alice-agents --skills
# Choose: Manage Hermes agents → Remove a Hermes agent
```

This removes:
- The SKILL.md file at `~/.hermes/skills/alice/<agent-id>/`
- The entry in `~/.openclaw/hermes-agents.json`

## Hermes Agent Registry

The registry file is at:
```
~/.openclaw/hermes-agents.json
```

Example:
```json
{
  "hermesAgents": [
    {
      "id": "hermes-1744800000000",
      "agentId": "researcher",
      "domain": "Research",
      "description": "Long-running web research with cross-session memory",
      "skillsCategory": "alice",
      "toolsets": "terminal,file,web",
      "preloadSkills": ["web-search"],
      "createdAt": "2026-04-16T08:00:00.000Z"
    }
  ]
}
```

## Direct Hermes CLI Usage

Once registered, you can also run a Hermes agent directly from the terminal:

```bash
hermes chat -s researcher -t terminal,file,web -Q
```

The `-s researcher` flag loads the agent's SKILL.md. Use `-t` to set toolsets and `-Q` for quiet/programmatic mode.

## Architecture

```
alice-agents/
  lib/
    hermes-agent.mjs       ← HermesAgentManager class
  templates/
    workspaces/
      _shared/
        hermes-agent-skill.md  ← SKILL.md template
        SOUL-hermes.md         ← persona template
        AGENTS-hermes.md       ← operating instructions template
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/hermes-agent.mjs` | Core manager — createAgent, spawnAgent, removeAgent |
| `hermes-agents.json` | Registry of all Hermes agents |
| `~/.hermes/skills/alice/<id>/SKILL.md` | Per-agent skill document |
| `~/.hermes/memories/` | Hermes-managed session memories |
