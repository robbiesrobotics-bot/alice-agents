# 🧠 A.L.I.C.E. — AI Agent Framework for NemoClaw & OpenClaw

**Adaptive Learning & Intelligent Coordination Engine**

One conversation. One orchestrator. Ten starter agents — with 18 more in Pro. A.L.I.C.E. turns your agent runtime into a full AI team — talk to Olivia, and she routes your request to the right expert.

**NemoClaw compatible** — A.L.I.C.E. v1.2.7+ runs natively on [NVIDIA NemoClaw](https://nvidia.com/nemoclaw), the secure open-source agent runtime. Agents execute inside the OpenShell sandbox for enterprise-grade security.

## Quick Start

```bash
npx @robbiesrobotics/alice-agents
```

That's it. The installer detects your runtime (NemoClaw or OpenClaw) and sets everything up. If neither is installed, it will offer to install NemoClaw — the recommended option.

## What You Get

**Starter** includes 10 agents. **Pro** unlocks 18 more — [sign up at getalice.av3.ai](https://getalice.av3.ai/signup?plan=pro)

An orchestrator (Olivia) backed by specialist agents across every domain:

| Agent | Domain | Emoji | Tier |
|-------|--------|-------|------|
| **Olivia** | Orchestration | 🧠 | Starter |
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

## Model Presets

| Preset | Models | Best For |
|--------|--------|----------|
| **Sonnet** (default) | claude-sonnet-4-6 for all | Balanced speed + quality |
| **Opus + Sonnet** | Opus for orchestrator, Sonnet for specialists | Maximum orchestration quality |
| **OpenAI** | GPT-5.4 / GPT-5.4-mini | OpenAI users |
| **Local (Ollama)** | Local models | Privacy, offline use |
| **Custom** | Your choice | Full control |

## Install Options

```bash
# Interactive install
npx @robbiesrobotics/alice-agents

# Non-interactive with defaults (Sonnet, Starter tier)
npx @robbiesrobotics/alice-agents --yes

# Show help
npx @robbiesrobotics/alice-agents --help
```

### Install Modes

- **Fresh** — Replaces the agents section in `openclaw.json` (recommended for first install)
- **Merge** — Adds A.L.I.C.E. agents alongside your existing agents
- **Upgrade** — Updates product files (SOUL.md, AGENTS.md, etc.) without touching user customizations

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

1. **You talk to Olivia** — she's your single point of contact
2. **Olivia routes to specialists** — "Build me an API" → Dylan (Development)
3. **Specialists do the work** — using their domain-specific tools and expertise
4. **Olivia synthesizes** — combines results and presents them to you

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
- At least one AI provider configured (Anthropic, OpenAI, or Ollama)

## License

MIT
