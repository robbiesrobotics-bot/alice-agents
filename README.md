# 🧠 A.L.I.C.E. — AI Agent Framework for NemoClaw & OpenClaw

**Adaptive Learning & Intelligent Coordination Engine**

One conversation. One orchestrator. Ten starter agents — with 18 more in Pro. A.L.I.C.E. turns your agent runtime into a full AI team — talk to A.L.I.C.E. (or just Alice), and she routes your request to the right expert.

**NemoClaw compatible** — A.L.I.C.E. v1.2.7+ runs natively on [NVIDIA NemoClaw](https://nvidia.com/nemoclaw), the secure open-source agent runtime. Agents execute inside the OpenShell sandbox for enterprise-grade security.

## Quick Start

```bash
npx @robbiesrobotics/alice-agents
```

That's it. The installer detects your runtime (NemoClaw or OpenClaw) and sets everything up. If neither is installed, it will offer to install NemoClaw — the recommended option.

## What You Get

**Starter** includes 10 agents. **Pro** unlocks 18 more — [sign up at getalice.av3.ai](https://getalice.av3.ai/signup?plan=pro)

**Mission Control Cloud** is available as a Pro add-on. If enabled during install, the package now:
- installs the `mission-control-bridge` plugin into your OpenClaw home
- writes a portable local Mission Control config at `~/.openclaw/.alice-mission-control.json`
- enables the bridge in `openclaw.json` so your runtime can forward live telemetry to Mission Control

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

# Non-interactive with defaults (detected model if available, otherwise Sonnet; Starter tier)
npx @robbiesrobotics/alice-agents --yes

# Non-interactive Pro install with Mission Control Cloud enabled
npx @robbiesrobotics/alice-agents --cloud --cloud-token YOUR_TOKEN

# Show help
npx @robbiesrobotics/alice-agents --help
```

### Install Modes

- **Fresh** — Replaces the agents section in `openclaw.json` (recommended for first install)
- **Merge** — Adds A.L.I.C.E. agents alongside your existing agents
- **Upgrade** — Updates product files (SOUL.md, AGENTS.md, etc.) without touching user customizations

### Mission Control Cloud

If you're a Pro user with the cloud add-on, the installer can configure your local runtime for Mission Control in the same pass.

- Interactive install: choose `Pro`, validate your license, then enable the Mission Control Cloud add-on when prompted
- Non-interactive install: pass `--cloud`
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
