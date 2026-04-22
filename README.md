# 🧠 A.L.I.C.E. — Multi-Agent AI Team Framework

**Adaptive Learning & Intelligent Coordination Engine**

One conversation. One orchestrator. 10 starter agents — with 23 more in Pro. Tell A.L.I.C.E. what you need, and she routes it to the right specialist and delivers the result.

A.L.I.C.E. runs on any supported runtime — OpenClaw, NemoClaw, or Hermes Agent. No required API key, no vendor lock-in.

## Supported Runtimes

| Runtime | Status | Install Guide |
|---------|--------|---------------|
| **Hermes Agent** | ✅ Recommended | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) |
| **NemoClaw** | ✅ Supported | [nvidia.com/nemoclaw](https://nvidia.com/nemoclaw) |
| **OpenClaw** | ✅ Supported | [openclaw.ai](https://openclaw.ai) |

## Prerequisites

**Before installing**, make sure your runtime has a default model set:

- **Hermes Agent:** Run `hermes model` to select a provider and model
- **NemoClaw / OpenClaw:** Run `openclaw configure` → select "model" to configure your default

A.L.I.C.E. uses whatever model your runtime already has configured. If no model is set, the installer will tell you exactly which command to run.

## Quick Start

```bash
# Interactive install — auto-detects your runtime
npx @robbiesrobotics/alice-agents

# Non-interactive (Starter tier, auto-detected defaults)
npx @robbiesrobotics/alice-agents --yes

# Force a specific runtime
npx @robbiesrobotics/alice-agents --yes --runtime hermes
npx @robbiesrobotics/alice-agents --yes --runtime openclaw
```

## What You Get

**Starter** — 10 core agents. **Pro** — 23 additional agents. [Sign up at getalice.av3.ai](https://getalice.av3.ai/signup?plan=pro)

| Agent | Domain | Tier |
|-------|--------|------|
| **A.L.I.C.E.** | Orchestration | Starter |
| **Dylan** | Development | Starter |
| **Selena** | Security | Starter |
| **Devon** | DevOps | Starter |
| **Quinn** | QA / Testing | Starter |
| **Felix** | Frontend | Starter |
| **Daphne** | Documentation | Starter |
| **Rowan** | Research | Starter |
| **Darius** | Data | Starter |
| **Sophie** | Support | Starter |
| **Hannah** | HR | Pro |
| **Aiden** | Analytics | Pro |
| **Clara** | Communication | Pro |
| **Avery** | Automation | Pro |
| **Owen** | Operations | Pro |
| **Isaac** | Integration | Pro |
| **Tommy** | Travel | Pro |
| **Sloane** | Sales | Pro |
| **Nadia** | UI/UX Design | Pro |
| **Morgan** | Marketing | Pro |
| **Alex** | API Crawling | Pro |
| **Uma** | UX Research | Pro |
| **Caleb** | CRM | Pro |
| **Elena** | Estimation | Pro |
| **Audrey** | Accounting | Pro |
| **Logan** | Legal | Pro |
| **Eva** | Executive Assistant | Pro |
| **Parker** | Project Management | Pro |
| **Aria** | Autonomous Research | Pro |
| **Nate** | n8n Automation | Pro |
| **MaxxiPro** | Roof Maxx Expert | Pro |
| **AccuScope** | AccuLynx CRM Auditor | Pro |
| **SmokeTestAgent** | QA Specialist | Pro |

## How It Works

1. **You talk to A.L.I.C.E.** — she's your single point of contact
2. **A.L.I.C.E. routes to specialists** — "Build me an API" → Dylan; "Audit my security" → Selena
3. **Specialists do the work** — using their domain tools and knowledge
4. **A.L.I.C.E. synthesizes** — combines results into one clear answer

Each specialist agent operates within their domain and flags when something falls outside their scope.

## Model Configuration

A.L.I.C.E. does **not** pick a model for you. It uses whatever your runtime already has configured.

### Before Installing

**Hermes Agent:**
```bash
hermes model
# Follow the prompts to select a provider (e.g., OpenAI, Anthropic, Ollama, Nous Portal) and default model
```

**OpenClaw / NemoClaw:**
```bash
openclaw configure
# Select "model" → choose your provider and default model
```

### Model Presets (OpenClaw/NemoClaw only)

If your runtime already has a model configured, A.L.I.C.E. uses it automatically. The installer will not ask about models.

If you need to override for OpenClaw/NemoClaw specifically, you can pass model hints before install:
```bash
# Set model in OpenClaw config directly
openclaw configure --section model

# Or configure API keys for your provider
openclaw configure --section credentials
```

## Install Options

```bash
# Interactive install — auto-detects runtime and guides you through setup
npx @robbiesrobotics/alice-agents

# Non-interactive (uses detected defaults)
npx @robbiesrobotics/alice-agents --yes

# Pro tier
npx @robbiesrobotics/alice-agents --yes --tier pro

# With A.L.I.C.E. | Control Cloud (Pro)
npx @robbiesrobotics/alice-agents --yes --tier pro --license-key YOUR_KEY --cloud

# Force a specific runtime (useful on machines with multiple runtimes)
npx @robbiesrobotics/alice-agents --yes --runtime hermes
npx @robbiesrobotics/alice-agents --yes --runtime openclaw

# Reinstall over existing A.L.I.C.E.
npx @robbiesrobotics/alice-agents --yes --force

# Show all options
npx @robbiesrobotics/alice-agents --help
```

## A.L.I.C.E. | Control Cloud

A Pro add-on that connects your local runtime to the A.L.I.C.E. Control web dashboard. Enables telemetry, fleet visibility, and remote agent management.

```bash
npx @robbiesrobotics/alice-agents --yes --tier pro --license-key YOUR_KEY --cloud
```

Optional flags:
- `--cloud-token <token>` — access or ingest token
- `--cloud-dashboard-url <url>` — defaults to `https://alice.av3.ai`
- `--cloud-ingest-url <url>` — defaults to `<dashboard-url>/api/v1/ingest`

## Upgrading

```bash
npx @robbiesrobotics/alice-agents --update
```

Or run interactively and select "Upgrade":
```bash
npx @robbiesrobotics/alice-agents
# → Select: Upgrade
```

Upgrade preserves your `PLAYBOOK.md`, `LEARNINGS.md`, `FEEDBACK.md`, and `memory/` directories.

## Uninstalling

```bash
npx @robbiesrobotics/alice-agents --uninstall
```

Removes A.L.I.C.E. agents from your runtime config. Creates a backup first.

## Requirements

- **Hermes Agent** v0.10.0+ **or** **OpenClaw** / **NemoClaw** installed and configured
- A default model set in your runtime (`hermes model` or `openclaw configure`)
- Node.js 18+ (for the installer itself)
- For local models: [Ollama](https://ollama.com) running locally

## Architecture

A.L.I.C.E. is an orchestrator + specialist agent team. The orchestrator (A.L.I.C.E.) receives all requests, classifies intent, routes to the right specialist(s), and synthesizes results.

On **Hermes Agent:** A.L.I.C.E. and all specialists are installed as Hermes skills (`~/.hermes/skills/alice/`). Delegation is skill-to-skill via Hermes tool calling.

On **OpenClaw / NemoClaw:** A.L.I.C.E. and specialists are installed as agent workspaces. Delegation uses `sessions_spawn`.

Both architectures are functionally equivalent — the user experience is identical.

## Compatibility

| Runtime | Agent Model | Config Location |
|---------|-------------|----------------|
| Hermes Agent | `~/.hermes/config.yaml` | `~/.hermes/skills/alice/` |
| NemoClaw | `~/.nemoclaw/openclaw.json` | `~/.nemoclaw/workspace/` |
| OpenClaw | `~/.openclaw/openclaw.json` | `~/.openclaw/workspace/` |

## License

MIT
