# Troubleshooting

## The `--doctor` Flag

The fastest way to diagnose problems is to run:

```bash
npx @robbiesrobotics/alice-agents --doctor
```

`--doctor` performs a full health check and reports:
- Whether OpenClaw (or NemoClaw) is detected on the system
- Which agents are installed and active
- License tier validation (Starter or Pro)
- Docker accessibility when Docker is installed
- Any missing agent files or broken configuration

Always run `--doctor` first before trying other fixes. It tells you exactly what's wrong.

---

## Common Errors & Fixes

### ❌ "OpenClaw not found"

**Symptom:** The installer or `--doctor` reports that OpenClaw cannot be detected.

**Causes and fixes:**
- OpenClaw isn't installed → [Install OpenClaw](https://openclaw.dev) first, then re-run the A.L.I.C.E. installer
- OpenClaw is installed but not on your PATH → Make sure the `openclaw` binary is accessible from your terminal. Try `which openclaw` to confirm.
- You're running as a different user than where OpenClaw was installed → Switch to the correct user or reinstall OpenClaw for the current user.

---

### ❌ "Agents missing" or agents don't respond

**Symptom:** You address Olivia or another agent in an OpenClaw session and nothing happens, or the agent is not recognized.

**Causes and fixes:**
- Agent files weren't installed correctly → Run `npx @robbiesrobotics/alice-agents --update` to repair the installation
- You're in a workspace that doesn't have A.L.I.C.E. installed → Check that you're in the correct OpenClaw workspace. A.L.I.C.E. installs into the workspace you were in when you ran the installer.
- The agent is a Pro agent but you have Starter → Check your tier with `--doctor`. Pro agents require a valid license key.

---

### ❌ "License rejected" or Pro agents not unlocking

**Symptom:** You entered a license key but Pro agents are still unavailable, or the installer reports the key is invalid.

**Causes and fixes:**
- Typo in the key → Re-run the installer and carefully re-enter the key. Keys are case-sensitive.
- Key was already used on too many machines → Contact support if you believe this is an error.
- Key is for a different product → Make sure you purchased A.L.I.C.E. Pro (not a different product from Robbiesrobotics).
- Network issue during validation → Ensure you have internet access during install. The installer can store a short grace period, but `--doctor` will keep flagging the license until validation completes.

If the key still fails after verifying the above, email support with your key and purchase email.

---

### ❌ "Model not responding" or agents give empty/error replies

**Symptom:** An agent responds but produces errors, blank output, or complains about a model.

**Causes and fixes:**
- OpenClaw's configured model is unreachable → Test your model directly in a plain OpenClaw session (outside of A.L.I.C.E.). If that fails too, the issue is with your model configuration, not A.L.I.C.E.
- Rate limits → If you're running many agents in parallel, you may hit API rate limits. Slow down and retry.
- Model context length exceeded → Very long conversations can exceed model context limits. Start a fresh session.
- No model configured → Run `openclaw status` to verify a model is active and configured.

---

## How to Reinstall Cleanly

If you need a clean slate:

**Step 1: Uninstall**
```bash
npx @robbiesrobotics/alice-agents --uninstall
```

This removes A.L.I.C.E. agent files from your workspace without touching OpenClaw.

**Step 2: Reinstall**
```bash
npx @robbiesrobotics/alice-agents
```

Enter your Pro license key when prompted (or press Enter for Starter). The installer will lay down fresh agent files.

**Step 3: Verify**
```bash
npx @robbiesrobotics/alice-agents --doctor
```

Confirm all agents are active and the correct tier is shown.

---

## Getting Help

If `--doctor` doesn't resolve your issue and the fixes above don't help:

- **GitHub Discussions:** [github.com/robbiesrobotics-bot/alice-agents/discussions](https://github.com/robbiesrobotics-bot/alice-agents/discussions)  
  Search existing threads first — your issue may already be answered.

- **Bug reports:** Open an issue on the GitHub repo with the output of `--doctor` and a description of what you tried.

- **License issues:** Email support directly (address on your purchase receipt). Include your purchase email and a description of the problem.

When reporting issues, always include:
1. Output of `npx @robbiesrobotics/alice-agents --version`
2. Output of `npx @robbiesrobotics/alice-agents --doctor`
3. Your OS and Node.js version (`node --version`)
