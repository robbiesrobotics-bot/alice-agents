# NVIDIA ISV Partner Program — Application Draft
**Applicant:** Robbies Robotics (av3.ai)
**Product:** A.L.I.C.E. (Automated Language Intelligence for Cooperative Execution)
**Version:** 1.2.5 — NemoClaw-compatible, published March 2026
**Prepared:** March 16, 2026

---

## NVIDIA ISV Partner Program Application

### Section 1 — Company Overview

Robbies Robotics (operating as av3.ai) is an AI infrastructure company building the next generation of multi-agent orchestration tooling for developers, startups, and enterprise teams. Our flagship product, **A.L.I.C.E.** (`@robbiesrobotics/alice-agents`), is a 28-agent AI orchestration framework designed to run on the OpenClaw runtime — and as of today, fully verified as NemoClaw-compatible. We build in the open, ship fast, and we are committed to the NVIDIA agentic AI ecosystem from day one.

---

### Section 2 — Product Description

**A.L.I.C.E.** (Automated Language Intelligence for Cooperative Execution) is a plug-and-play multi-agent orchestration framework that gives developers a team of 28 specialized AI agents — accessible in under 60 seconds via:

```
npx @robbiesrobotics/alice-agents
```

Each agent is a domain specialist: coding, marketing, research, operations, DevOps, finance, legal, and more. Agents communicate through a structured orchestration layer managed by **Olivia**, A.L.I.C.E.'s central orchestrator agent, which routes tasks to the right specialist and aggregates results back to the user.

A.L.I.C.E. runs natively on the **OpenClaw** runtime and executes agent workloads inside the **OpenShell** sandboxed environment — the same secure execution layer that powers NemoClaw. This means every A.L.I.C.E. agent session benefits from NemoClaw's isolation guarantees, execution policies, and security posture without any extra configuration from the developer.

**Key product facts:**
- 28 specialist agents, orchestrated by a central routing agent (Olivia)
- Two tiers: **Starter** (free, 10 agents) and **Pro** ($29/mo, full 28-agent suite)
- NemoClaw-compatible as of v1.2.5 — verified day-one
- Available via npm: `@robbiesrobotics/alice-agents`
- GitHub: https://github.com/robbiesrobotics-bot/alice-agents
- Product site: https://getalice.av3.ai

---

### Section 3 — NVIDIA Technology Used

A.L.I.C.E. is built on and verified against the following NVIDIA technologies:

| Technology | How A.L.I.C.E. Uses It |
|---|---|
| **NemoClaw** | Core security and execution runtime that hosts A.L.I.C.E. agent sandboxes. A.L.I.C.E. v1.2.5 is NemoClaw-compatible day-one. |
| **OpenClaw** | The agent host runtime. A.L.I.C.E. is distributed as an OpenClaw skill package and leverages OpenClaw's tool dispatch, session management, and channel integrations. |
| **OpenShell** | The sandboxed shell execution environment inside NemoClaw. All A.L.I.C.E. agents that run code, commands, or file operations do so inside OpenShell's isolated runtime. |
| **NVIDIA Agent Toolkit** | A.L.I.C.E.'s agent architecture aligns with NVIDIA's agent design patterns — specialist agents with defined tool access, structured handoff, and an orchestrator model compatible with NVIDIA Agent Toolkit conventions. |

We are actively tracking NemoClaw's roadmap and intend to maintain day-one compatibility with future NemoClaw releases.

---

### Section 4 — Target Market & Use Cases

**Primary audiences:**

1. **Individual developers & AI builders** — Developers who want a full AI team without building one from scratch. A.L.I.C.E.'s Starter tier (free, 10 agents) gives them instant access to a coding agent, research agent, and more, running locally via npx.

2. **Startups** — Small teams that need leverage. A.L.I.C.E. Pro ($29/mo) gives a 2-person startup the operational bandwidth of a larger team: marketing copy, investor research, DevOps scripts, and legal summaries — all from a single CLI.

3. **Enterprise AI teams** — Enterprises building internal AI tooling on NemoClaw who need a proven orchestration layer on top. A.L.I.C.E. provides a reference architecture for multi-agent systems that runs inside their existing NemoClaw deployment.

**Representative use cases:**
- *"Ship this feature"* — Developer routes a GitHub issue to A.L.I.C.E.; the coding agent implements, the QA agent reviews, the DevOps agent deploys.
- *"Prep for this investor meeting"* — Founder tells A.L.I.C.E.; the research agent pulls market data, the finance agent models projections, the marketing agent drafts the deck narrative.
- *"Launch this product"* — A.L.I.C.E. coordinates PR copy, launch checklist, social posts, and competitive analysis in parallel.

---

### Section 5 — Integration with the NVIDIA Stack

A.L.I.C.E. is designed as the **orchestration layer** that sits on top of NemoClaw's **security and execution runtime**. The relationship is additive — not competitive.

**Stack diagram (text):**

```
┌─────────────────────────────────────────────────────────┐
│                  USER / DEVELOPER                        │
│              npx @robbiesrobotics/alice-agents           │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│               A.L.I.C.E. ORCHESTRATION LAYER             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Olivia  │→ │  Coding  │  │Marketing │  │Research │  │
│  │(Router)  │  │  Agent   │  │  Agent   │  │  Agent  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│              [ + 24 more specialist agents ]              │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   OpenClaw RUNTIME                       │
│         (Session management, tool dispatch,              │
│          channel integrations, skill routing)            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              NemoClaw SECURITY RUNTIME                   │
│   OpenShell Sandbox │ Execution Policies │ Isolation     │
│                 (NVIDIA-powered)                         │
└─────────────────────────────────────────────────────────┘
```

From NVIDIA's perspective, A.L.I.C.E. is a high-visibility **NemoClaw workload** — a production multi-agent framework that validates and showcases the NemoClaw security runtime in a real-world developer product. Every A.L.I.C.E. user is a NemoClaw user.

---

### Section 6 — Co-Marketing Opportunities

**What we're asking for:**

- **NemoClaw partner listing** — Feature A.L.I.C.E. as a NemoClaw-compatible ISV partner on the NVIDIA developer site / NemoClaw ecosystem page
- **GTC 2026 presence** — A booth mention, lightning talk slot, or demo feature in the NemoClaw sessions
- **NVIDIA Blog / Developer Blog feature** — A co-authored post covering A.L.I.C.E. as a real-world NemoClaw orchestration use case
- **NemoClaw launch day coverage** — If NemoClaw has future milestone releases, include A.L.I.C.E. as a day-one compatible partner showcase
- **Social amplification** — NVIDIA Developer Twitter/LinkedIn post introducing A.L.I.C.E. to the NemoClaw community

**What we bring in return:**

- **Lighthouse customer story** — A.L.I.C.E. is one of the first independent products to ship NemoClaw-compatible, giving NVIDIA a compelling ecosystem proof point
- **Developer community reach** — We'll publish the NemoClaw integration story on our blog, npm page, GitHub, and social channels — reaching the developer audience NVIDIA wants to grow
- **Forum presence** — We are actively engaging in the NVIDIA Developer Forum NemoClaw thread (see Section 8 below) and will continue to advocate for the NemoClaw ecosystem
- **Product roadmap alignment** — We commit to maintaining NemoClaw compatibility on every major A.L.I.C.E. release, keeping the partnership current
- **Joint webinar / demo** — We can co-host a live demo showing the full A.L.I.C.E. + NemoClaw stack for developer audiences

---

### Section 7 — Business Metrics

| Metric | Value |
|---|---|
| Product name | A.L.I.C.E. (`@robbiesrobotics/alice-agents`) |
| Current version | 1.2.5 (released March 16, 2026) |
| Agent count | 28 specialist agents |
| NemoClaw compatibility | Verified day-one (v1.2.5) |
| Pricing tiers | Starter (free, 10 agents) / Pro ($29/mo, 28 agents) |
| Distribution | `npx @robbiesrobotics/alice-agents` (npm) |
| Company | Robbies Robotics / av3.ai |
| Founder | Rob Sanchez |
| Product site | https://getalice.av3.ai |
| npm | https://www.npmjs.com/package/@robbiesrobotics/alice-agents |
| GitHub | https://github.com/robbiesrobotics-bot/alice-agents |

*Note: We are in active growth. Metrics available upon request for NDA discussions.*

---

### Section 8 — Contact Information

**Primary Contact:**
- **Name:** [Your Name]
- **Title:** [Your Title]
- **Email:** [Email]
- **Phone:** [Phone]
- **Company:** Robbies Robotics / av3.ai
- **Company Website:** https://getalice.av3.ai
- **Product URL:** https://www.npmjs.com/package/@robbiesrobotics/alice-agents

---

---

## NVIDIA Developer Forum Post

*For: https://forums.developer.nvidia.com/t/introducing-nvidia-nemoclaw/363701*
*Thread: Introducing NVIDIA NemoClaw*

---

**Subject: A.L.I.C.E. — a 28-agent orchestration framework, NemoClaw-compatible day-one**

Hey NemoClaw team and community —

Just shipped A.L.I.C.E. v1.2.5 today and wanted to share it here because the NemoClaw compatibility angle is real and worth talking about.

**What is A.L.I.C.E.?** It's a multi-agent orchestration framework — 28 specialist agents (coding, research, marketing, DevOps, finance, etc.) coordinated by a central orchestrator named Olivia. You get a full AI team, not just a single LLM assistant.

**How it relates to NemoClaw:** The stack is clean. NemoClaw handles security and sandboxed execution (via OpenShell). A.L.I.C.E. is the orchestration layer on top — it doesn't try to do what NemoClaw does, it builds on it. Every agent that runs code or shell commands does so inside the OpenShell sandbox. NemoClaw's isolation is the foundation; A.L.I.C.E. is what you build on top of it.

**Try it in 30 seconds:**
```
npx @robbiesrobotics/alice-agents
```

Starter tier is free (10 agents). Pro is $29/mo (full 28-agent suite).

If you're building on NemoClaw and want to see what agent orchestration looks like on top of the runtime, this is a practical starting point. Happy to answer questions or dig into integration details here.

— Rob Sanchez, Robbies Robotics
https://getalice.av3.ai | https://github.com/robbiesrobotics-bot/alice-agents

---

*End of document — v1.0 draft, March 16, 2026*
