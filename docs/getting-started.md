# Getting Started with A.L.I.C.E.

## Prerequisites

- **OpenClaw installed and configured** — A.L.I.C.E. runs on top of OpenClaw (or NemoClaw). That's the only requirement.
- **No API keys needed** — A.L.I.C.E. uses whatever model OpenClaw already has configured. Nothing extra to set up.
- Node.js is available via `npx` (comes with Node.js ≥ 14, which OpenClaw requires anyway).

---

## Install

Run the installer from your terminal:

```bash
npx @robbiesrobotics/alice-agents
```

The installer will:
1. Detect your OpenClaw/NemoClaw runtime
2. Install the A.L.I.C.E. agent files into your workspace
3. Prompt for a license key if you have a Pro license (or accept `--license-key` in automation)
4. Install the bundled `coding-agent` skill with a provider-aware preference
5. Confirm which agents are active

To skip all prompts and accept defaults:

```bash
npx @robbiesrobotics/alice-agents --yes
```

To install Pro non-interactively:

```bash
npx @robbiesrobotics/alice-agents --yes --tier pro --license-key YOUR_KEY
```

---

## First Run Walkthrough

Once installed, open a new OpenClaw session. Olivia is now your entry point for everything.

**Say hello:**
> "Hey Olivia, who's on the team?"

Olivia will introduce the active agents and summarize what each one does.

**Try a task:**
> "Olivia, I need a code review of my auth middleware."

Olivia will route this to Dylan (engineering) automatically. You don't need to address specialists directly — but you can if you want to.

**Address a specialist directly:**
> "Devon, set up a GitHub Actions CI pipeline for a Node.js project."

Specialists respond in their domain without needing Olivia to route it.

---

## Verifying Agents Are Working

Run the built-in health check:

```bash
npx @robbiesrobotics/alice-agents --doctor
```

This will:
- Confirm OpenClaw is detected
- List all installed agents and their status
- Validate your license tier (Starter or Pro)
- Check Docker accessibility when Docker is installed
- Flag any missing files or configuration issues

You can also ask Olivia directly in a session:
> "Olivia, run a status check on the team."

---

## Upgrading

To pull the latest version of A.L.I.C.E.:

```bash
npx @robbiesrobotics/alice-agents --update
```

This updates agent files in place. Your license and configuration are preserved.

---

## Uninstalling

To remove A.L.I.C.E. from your OpenClaw workspace:

```bash
npx @robbiesrobotics/alice-agents --uninstall
```

This removes agent files but does not affect OpenClaw itself. Your OpenClaw setup, model configuration, and other workspace files are untouched.

---

## CLI Reference

| Flag | What It Does |
|------|--------------|
| `--yes` | Accept all defaults, skip prompts |
| `--tier` | Force Starter or Pro during install |
| `--license-key` | Provide a Pro license key for automation |
| `--coding-tool` | Override the bundled coding-agent preference |
| `--update` | Update to the latest version |
| `--uninstall` | Remove A.L.I.C.E. agents |
| `--doctor` | Run health check and diagnostics |
| `--version` | Print the installed version |

---

## Next Steps

- Browse the [Agent Roster](../ROSTER.md) to see what each agent specializes in
- Read the [FAQ](./faq.md) for common questions
- Check [Licensing](./licensing.md) if you're upgrading to Pro
