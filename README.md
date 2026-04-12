# 🧠 A.L.I.C.E. — AI Agent Framework for NemoClaw & OpenClaw

**Adaptive Learning & Intelligent Coordination Engine**

One conversation. One orchestrator. Ten starter agents — with 23 more in Pro. A.L.I.C.E. turns your agent runtime into a full AI team — talk to A.L.I.C.E. (or just Alice), and she routes your request to the right expert.

**NemoClaw compatible** — A.L.I.C.E. v1.2.7+ runs natively on [NVIDIA NemoClaw](https://nvidia.com/nemoclaw), the secure open-source agent runtime. Agents execute inside the OpenShell sandbox for enterprise-grade security.

## Quick Start

```bash
npx @robbiesrobotics/alice-agents
```

That's it. The installer detects your runtime (NemoClaw or OpenClaw) and sets everything up. If neither is installed, it will offer to install NemoClaw — the recommended option.

## What You Get

**Starter** includes 10 agents. **Pro** unlocks 23 more — [sign up at getalice.av3.ai](https://getalice.av3.ai/signup?plan=pro)

**A.L.I.C.E. | Control Cloud** is available as a Pro add-on. If enabled during install, the package now:
- installs the `mission-control-bridge` plugin into your OpenClaw home
- writes a portable local A.L.I.C.E. | Control config at `~/.openclaw/.alice-mission-control.json`
- enables the bridge in `openclaw.json` so your runtime can forward live telemetry to A.L.I.C.E. | Control
- installs a bundled `coding-agent` skill that prefers Codex for OpenAI defaults and Claude Code for Anthropic defaults

An orchestrator (A.L.I.C.E., also addressable as Alice or Olivia) backed by specialist agents across every domain:

| Agent | Domain | Emoji | Tier |
|-------|--------|-------|------|
| **A.L.I.C.E.** | Orchestration | 🧠 | Starter |
| **Dylan** | Development | 💻 | Starter |
| **Selena** | Security | 🛡️ | Starter |
| **Devon** | DevOps | 🚀 | Starter |
| **Quinn** | QA/Testing | ✅ | Starter |
| **Felix** | Frontend | 🖥️ | Starter |
| **Daphne** | Documentation | 📝 | Starter |
| **Rowan** | Research | 🔍 | Starter |
| **Darius** | Data | 📊 | Starter |
| **Sophie** | Support | 💬 | Starter |
| **Hannah** | HR | 👥 | Pro |
| **Aiden** | Analytics | 📈 | Pro |
| **Clara** | Communication | ✍️ | Pro |
| **Avery** | Automation | ⚙️ | Pro |
| **Owen** | Operations | 🔧 | Pro |
| **Isaac** | Integration | 🔌 | Pro |
| **Tommy** | Travel | ✈️ | Pro |
| **Sloane** | Sales | 💼 | Pro |
| **Nadia** | UI/UX Design | 🎨 | Pro |
| **Morgan** | Marketing | 📣 | Pro |
| **Alex** | API Crawling | 🕷️ | Pro |
| **Uma** | UX Research | 🧪 | Pro |
| **Caleb** | CRM | 🗂️ | Pro |
| **Elena** | Estimation | 📋 | Pro |
| **Audrey** | Accounting | 💰 | Pro |
| **Logan** | Legal | ⚖️ | Pro |
| **Eva** | Executive Assistant | 📌 | Pro |
| **Parker** | Project Management | 📅 | Pro |
| **Aria** | Autonomous Research | 🔬 | Pro |
| **Nate** | n8n Automation | 🔧 | Pro |
| **MaxxiPro** | Roof Maxx Expert | 🏠 | Pro |
| **AccuScope** | AccuLynx CRM Auditor | 📊 | Pro |
| **SmokeTestAgent** | QA Specialist | 🧪 | Pro |

## Model Flexibility

A.L.I.C.E. works with **whatever model you already have configured** in OpenClaw/NemoClaw. There's no required API key — just use what you've got.

When you install, the installer will **auto-detect your configured model** and let the agent team inherit that runtime default. You can also choose from presets or specify a custom model for the OpenClaw/NemoClaw defaults A.L.I.C.E. should use.

| Preset | Models | Best For |
|--------|--------|----------|
| **Auto-detect** (default) | Your current OpenClaw/NemoClaw default | Zero friction — agents inherit what your runtime already uses |
| **Sonnet** | claude-sonnet-4-6 for all | Balanced speed + quality (requires Anthropic key) |
| **Opus + Sonnet** | Opus for orchestrator, Sonnet for specialists | Maximum quality (requires Anthropic key) |
| **OpenAI** | GPT-5.4 / GPT-5.4-mini | OpenAI users |
| **Local (Ollama)** | Local models | Privacy, offline use, no API key needed |
| **Custom** | Your choice | Full control |

> **Tip:** We prefer Claude Opus for orchestration when available — but A.L.I.C.E. is model-agnostic. Whatever model OpenClaw has configured will work.

## Install Options

```bash
# Interactive install
npx @robbiesrobotics/alice-agents

# Non-interactive with defaults (detected model if available, otherwise Sonnet; Starter tier unless --tier pro)
npx @robbiesrobotics/alice-agents --yes

# Non-interactive Pro install with A.L.I.C.E. | Control Cloud enabled
npx @robbiesrobotics/alice-agents --yes --tier pro --license-key YOUR_KEY --cloud --cloud-token YOUR_TOKEN

# Force the coding tool preference for this install
npx @robbiesrobotics/alice-agents --yes --coding-tool codex

# Show help
npx @robbiesrobotics/alice-agents --help
```

### Install Modes

- **Fresh** — Replaces the agents section in `openclaw.json` (recommended for first install)
- **Merge** — Adds A.L.I.C.E. agents alongside your existing agents
- **Upgrade** — Updates product files (SOUL.md, AGENTS.md, etc.) without touching user customizations

### A.L.I.C.E. | Control Cloud

If you're a Pro user with the cloud add-on, the installer can configure your local runtime for A.L.I.C.E. | Control in the same pass.

- Interactive install: choose `Pro`, validate your license, then enable the A.L.I.C.E. | Control Cloud add-on when prompted
- Non-interactive install: pass `--tier pro --license-key YOUR_KEY --cloud`
- Optional flags:
  - `--cloud-token <token>` — access or ingest token for authenticated telemetry
  - `--cloud-dashboard-url <url>` — defaults to `https://alice.av3.ai`
  - `--cloud-ingest-url <url>` — defaults to `<dashboard-url>/api/v1/ingest`

The cloud config is stored in `~/.openclaw/.alice-mission-control.json`, and the bundled bridge plugin reads from that file so the setup remains portable across macOS, Linux, and Windows.

## Upgrade

Re-run the installer and choose "Upgrade":

```bash
npx @robbiesrobotics/alice-agents
# Select: Upgrade
```

This updates agent templates and config while preserving your PLAYBOOK.md, LEARNINGS.md, FEEDBACK.md, and memory/ directories.

## Uninstall

```bash
npx @robbiesrobotics/alice-agents --uninstall
```

Removes A.L.I.C.E. agents from `openclaw.json` while preserving any non-ALICE agents. Creates a backup before making changes.

## Maintainer Release Guard

Maintainer publishes are now gated.

- `npm publish` runs `prepublishOnly`
- that hook runs tests, syntax checks, and `npm run release:check`
- publish is blocked unless the package version has a matching git tag on `HEAD`
- publish is blocked unless `landing/content/changelog.md` contains the matching version entry
- publish is blocked unless `releases/vX.Y.Z.md` exists and is marked `Status: approved`

Use `releases/TEMPLATE.md` as the starting point for each release brief.

## How It Works

1. **You talk to A.L.I.C.E.** — she's your single point of contact
2. **A.L.I.C.E. routes to specialists** — "Build me an API" → Dylan (Development)
3. **Specialists do the work** — using their domain-specific tools and expertise
4. **A.L.I.C.E. synthesizes** — combines results and presents them to you

Each agent has its own workspace with:
- `SOUL.md` — personality and values
- `AGENTS.md` — operating instructions
- `PLAYBOOK.md` — learned patterns (evolves over time)
- `LEARNINGS.md` — task log
- `memory/` — persistent context between sessions

## Compatibility

A.L.I.C.E. runs on any OpenClaw-compatible runtime:

| Runtime | Status | Notes |
|---------|--------|-------|
| **NemoClaw** | ✅ Recommended | NVIDIA's secure distribution. Agents run inside OpenShell sandbox. [Get NemoClaw](https://nvidia.com/nemoclaw) |
| **OpenClaw** | ✅ Fully supported | Lightweight option. [openclaw.ai](https://openclaw.ai) |

### Why NemoClaw?

NemoClaw is NVIDIA's open-source, enterprise-grade distribution of OpenClaw. It adds the OpenShell security sandbox — isolating what agents can access on your machine, enforcing policy-based guardrails, and keeping your data private. A.L.I.C.E. is NemoClaw-native as of v1.2.7: the installer defaults to NemoClaw, and agents display their sandbox status on startup.

If you're already running NemoClaw, A.L.I.C.E. works out of the box — no extra config needed.

## Requirements

- [OpenClaw](https://openclaw.ai) or [NemoClaw](https://nemoclaw.com) installed and configured
- Node.js 18+
- At least one model configured in OpenClaw or NemoClaw — no specific API key required. A.L.I.C.E. uses whatever you already have set up.

## License

MIT
