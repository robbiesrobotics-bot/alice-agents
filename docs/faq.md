# Frequently Asked Questions

---

## General

### What is A.L.I.C.E.?
A.L.I.C.E. (Autonomous Learning Intelligence Coordination Engine) is a multi-agent AI team that runs inside OpenClaw. It gives you 28 specialized AI agents — each with a defined role — coordinated by Olivia, the orchestrator. Instead of prompting one general-purpose AI, you get specialists: engineers, designers, analysts, a lawyer, a controller, a project manager, and more.

### Do I need an API key?
No. A.L.I.C.E. does not require any API keys. It uses whatever model OpenClaw already has configured on your machine. If OpenClaw is working, A.L.I.C.E. will work.

### What runtime does A.L.I.C.E. run on?
A.L.I.C.E. runs on the OpenClaw runtime (and NemoClaw, its companion). OpenClaw is the only dependency.

### Is A.L.I.C.E. a separate app?
No. It's an agent pack that installs into your existing OpenClaw setup via `npx`. There's no separate app, dashboard, or login portal for core functionality.

### How do I talk to the agents?
Through your normal OpenClaw session. Address Olivia (or any specialist directly) in natural language. Olivia routes your request to the right agent automatically.

---

## Pricing & Licensing

### What's the difference between Starter and Pro?

| | Starter | Pro |
|---|---------|-----|
| **Price** | Free | $49 one-time |
| **Agents** | 10 | 28 |
| **License** | None required | License key via email |
| **Updates** | Included | Included |

Starter gives you the 10 core operational agents: Olivia, Dylan, Selena, Devon, Quinn, Felix, Daphne, Rowan, Darius, and Sophie. Pro unlocks all 28, adding specialists in analytics, automation, CRM, legal, finance, HR, marketing, travel, and more.

### Is the Pro license a subscription?
No. Pro is a one-time payment of $49. You pay once and own it. Updates to A.L.I.C.E. are included.

### Is the Cloud add-on required?
No. Cloud ($20/month) is an optional hosted runtime add-on for teams that don't want to self-host OpenClaw. If you're running OpenClaw locally or on your own server, you don't need it.

### Is the license key tied to one machine?
No. Your Pro license key is tied to you, not to a specific machine. You can install A.L.I.C.E. on multiple machines you own and use with the same key.

### What happens if I reinstall?
Nothing is lost. Run `npx @robbiesrobotics/alice-agents` again and enter your license key when prompted. Your Pro tier will be restored. Agent files are re-installed fresh, but your license remains valid.

### What if I lose my license key?
Contact support and we'll look it up by your email address. Keys are issued via Stripe checkout, so your purchase is always on record.

---

## Agents

### How many agents are there?
28 total — 10 in Starter, 28 in Pro. See the [full roster](../ROSTER.md) for names, titles, and responsibilities.

### Who routes my requests?
Olivia, the Chief Orchestration Officer, is the default entry point. She reads your request, determines which specialist is best suited, and hands it off. You can also address any specialist directly by name.

### Can I customize what agents do?
Agent behavior is shaped by their SOUL.md and domain instructions. Power users can edit these files to adjust tone, priorities, or constraints. Changes persist across sessions.

### Can agents work together on a single task?
Yes. Olivia coordinates multi-agent workflows. For example, a request to "build and deploy a new feature" might involve Dylan (code), Quinn (QA), Devon (deployment), and Selena (security review) in sequence.

### Can I add my own custom agents?
Custom agents beyond the A.L.I.C.E. roster are not officially supported in the current release. Stay tuned — this is on the roadmap.

---

## Technical

### What models do the agents use?
Whatever model you have configured in OpenClaw. A.L.I.C.E. doesn't specify or lock a model — it inherits your setup.

### Does A.L.I.C.E. store data anywhere?
No external data storage. Agents operate within your OpenClaw session and local workspace. Nothing is sent to A.L.I.C.E. servers unless you're using the Cloud add-on.

### Does A.L.I.C.E. work offline?
It depends on your OpenClaw model configuration. If your configured model works offline (e.g., a local model), A.L.I.C.E. works offline. If your model requires internet (e.g., Claude, GPT-4), then internet access is needed for inference — but A.L.I.C.E. itself has no additional network requirements.

### How do I check which version of A.L.I.C.E. I have?

```bash
npx @robbiesrobotics/alice-agents --version
```
