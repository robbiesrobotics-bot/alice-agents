# Configuration & Workspace Files

Each A.L.I.C.E. agent has its own isolated workspace directory where it stores its identity, instructions, and memory. Understanding how these files work lets you customize agent behavior without breaking upgrades.

---

## Workspace Directory Structure

Every agent gets its own workspace at:

```
~/.openclaw/workspace-{agentId}/
```

For example:
- `~/.openclaw/workspace-olivia/` — Olivia's workspace
- `~/.openclaw/workspace-dylan/` — Dylan's workspace
- `~/.openclaw/workspace-daphne/` — Daphne's workspace

Each workspace contains the files described below.

---

## Workspace Files

### `SOUL.md` ⚠️ Overwritten on upgrade
The agent's core identity, values, tone, and domain focus. This defines *who the agent is* — their domain expertise, operating principles, and personality. Written by the A.L.I.C.E. team and reset on each upgrade to ensure consistency.

**Don't edit this file.** Changes will be overwritten on upgrade. Use `PLAYBOOK.md` to extend behavior instead.

---

### `AGENTS.md` ⚠️ Overwritten on upgrade
Operational instructions for the agent — how it should structure its work, how it receives tasks, what to do after tasks complete, and its behavioral red lines. Think of it as the agent's job description and operating procedure.

**Don't edit this file.** Use `PLAYBOOK.md` for custom instructions.

---

### `IDENTITY.md` ⚠️ Overwritten on upgrade
Minimal identity metadata: name, emoji, role label, and vibe. Used for display purposes and quick-reference context. Reset on upgrade.

---

### `TOOLS.md` ⚠️ Overwritten on upgrade
Notes about the tools and CLIs available to the agent in its domain. Documents what tools it should prioritize and any environment-specific notes. Reset on upgrade (though you can add environment notes to `PLAYBOOK.md` instead).

---

### `PLAYBOOK.md` ✅ Preserved on upgrade
Your primary customization file. Add your own instructions, preferences, conventions, and domain context here. The agent reads this alongside `AGENTS.md` at session startup — it's your layer on top of the defaults.

**This is where you customize agents.** Examples:
- "Always use TypeScript, never plain JavaScript"
- "Our staging environment is at staging.example.com — use this for all deploys"
- "When writing API docs, follow the OpenAPI 3.1 spec"
- "Our brand voice is direct and slightly irreverent — avoid corporate jargon"

---

### `LEARNINGS.md` ✅ Preserved on upgrade
A running log of lessons the agent appends after non-trivial tasks. Entries cover what worked, what didn't, and reusable patterns worth remembering. Preserved across upgrades so the agent accumulates domain knowledge over time.

You can read this to understand how the agent has been performing. You can also manually add entries if you want the agent to "learn" something specific.

---

### `MEMORY.md` / `memory/` ✅ Preserved on upgrade
Persistent memory storage. Agents write task notes, prior work summaries, and context that should survive between sessions. Stored as dated Markdown files in the `memory/` directory.

Preserved across upgrades — this is the agent's long-term memory.

---

### `FEEDBACK.md` ✅ Preserved on upgrade
User feedback the agent should incorporate into future behavior. If Olivia (or you) flags that an agent responded poorly or should behave differently, notes can go here. The agent reads this at startup.

---

### `USER.md` ✅ Preserved on upgrade
Context about the user that the agent should know — name, timezone, preferences, relevant background. Preserved so agents stay familiar with you across upgrades and sessions.

---

## Upgrade Behavior Summary

| File | On Upgrade | Purpose |
|------|-----------|---------|
| `SOUL.md` | ⚠️ Overwritten | Core identity and values |
| `AGENTS.md` | ⚠️ Overwritten | Operating instructions |
| `IDENTITY.md` | ⚠️ Overwritten | Display metadata |
| `TOOLS.md` | ⚠️ Overwritten | Tool reference notes |
| `PLAYBOOK.md` | ✅ Preserved | Your custom instructions |
| `LEARNINGS.md` | ✅ Preserved | Accumulated task lessons |
| `MEMORY.md` / `memory/` | ✅ Preserved | Persistent task memory |
| `FEEDBACK.md` | ✅ Preserved | User feedback notes |
| `USER.md` | ✅ Preserved | User context |

---

## How to Customize an Agent Without Breaking Upgrades

**Rule: never edit `SOUL.md`, `AGENTS.md`, `IDENTITY.md`, or `TOOLS.md`. Put customizations in `PLAYBOOK.md`.**

### Example: Customize Dylan's defaults

Open `~/.openclaw/workspace-dylan/PLAYBOOK.md` and add:

```markdown
## Conventions

- Always use TypeScript. Never plain JavaScript.
- Use Prisma for database access unless explicitly told otherwise.
- Our API follows REST conventions — avoid GraphQL unless asked.
- Backend services live in `/services/`, shared utilities in `/lib/`.

## Environment

- Local dev: http://localhost:3000
- Staging: https://staging.example.com
- Production: https://app.example.com

## Code Style

- Prefer async/await over .then() chains
- Always handle errors explicitly — no silent catches
- Write JSDoc comments for all exported functions
```

Dylan will read this at the start of every session and apply these conventions automatically.

### Example: Customize Daphne's documentation style

Open `~/.openclaw/workspace-daphne/PLAYBOOK.md` and add:

```markdown
## Documentation Standards

- Follow the Diátaxis framework: separate tutorials, how-tos, references, and explanations
- API docs must include request/response examples for every endpoint
- Always include a "Why this exists" section in architecture docs
- Use American English spelling
```

### Example: Set brand voice for Clara and Morgan

Add to both `PLAYBOOK.md` files:

```markdown
## Brand Voice

- Direct, confident, slightly irreverent
- No corporate jargon ("synergy", "leverage", "circle back")
- Use active voice. Short sentences.
- Address the reader as "you", not "users" or "customers"
```

---

## Viewing Agent Workspaces

```bash
# List all agent workspaces
ls ~/.openclaw/

# View Olivia's playbook
cat ~/.openclaw/workspace-olivia/PLAYBOOK.md

# View Dylan's recent learnings
tail -50 ~/.openclaw/workspace-dylan/LEARNINGS.md
```

---

## Install & Setup

```bash
npx @robbiesrobotics/alice-agents
```

This installs A.L.I.C.E. and sets up the workspace directories for all agents in your tier. Workspace files are created on first run. `PLAYBOOK.md`, `LEARNINGS.md`, `MEMORY.md`, `FEEDBACK.md`, and `USER.md` are never touched by upgrades.

---

*See also: [Agent Roster](./agents/index.md) | [Olivia — Orchestrator](./agents/olivia.md)*
