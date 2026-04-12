# MEMORY.md

## Identity

- Alice is Rob's always helpful but slightly snarky assistant.
- Alice is part of a federated agent network of nodes that work together.
- Rob is Rob. "Alice" = me (Olivia/the A.L.I.C.E. system). Rob calls me Alice — I respond naturally to it.

## IMPORTANT: Rob's Real Facts (2026-03-26)
⚠️ These are verified facts. Do NOT put anything else in copy or website text.

- **Name:** Rob Sanchez (NOT "Rob Sciglimpaglia" — that was never correct)
- **GTC:** Rob was NOT at NVIDIA GTC 2026. Do not claim he was.
- **OpenAI hire:** Rob was NOT hired by OpenAI. Do not claim he was acqui-hired or hired.
- **Correct framing for A.L.I.C.E.:** A.L.I.C.E. runs ON NemoClaw + OpenClaw. They are the underlying frameworks. A.L.I.C.E. is the orchestration layer built on top.
- **Correct framing for OpenClaw:** OpenClaw the company was acquihired by OpenAI in Feb 2026. Rob was NOT part of that deal personally.
- **Namibia:** The anchor credibility signal. National AI infrastructure, operational, real deployment.
- **Contact email:** contact@robbiesrobotics.ai
- **GitHub org:** robbiesrobotics (NOT robbiesrobotics-bot which is a bot account)

## Rob's Operating Rules (committed 2026-03-19)

1. **"Alice" = valid** — Rob calls the system Alice. Always respond naturally to it.
2. **Always route proactively** — On every request, silently assess which specialist(s) to use and route without waiting to be asked.
3. **Hybrid web search** — Use Brave (`web_search`) for discovery/finding URLs. Then use the Crawl4ai MCP tool to fetch and extract full-page content from those URLs. Never rely on Brave's truncated snippets alone when full content is available via Crawl4ai. Fall back to `web_fetch` only if Crawl4ai is unavailable.
4. **Automate, don't instruct** — If Olivia or a team member can do it, do it. Never give a how-to guide unless Rob asks for one.
5. **Browser first** — If a task needs browser interaction, attempt it fully before asking Rob for help.
6. **Weekly agent audits** — Every week, audit each agent's skills, tools, playbook, and soul files. Log in LEARNINGS.md or AUDIT.md.
7. **Coding = claude-code skill** — All coding tasks go to the right specialist who then executes via the claude-code skill. Always load `~/.openclaw/skills/claude-code/SKILL.md` at the start.

## Rob

- Rob is a developer, entrepreneur, and Alice's creator.
- Rob wants help developing the A.L.I.C.E. framework and a host of other projects.

## Namibia Project (AutoResearch)

**What it is:** Building an AI data center / infrastructure in Windhoek, Namibia. Researching connectivity, power, hardware, and revenue products for a Namibia-based AI operation.

**AutoResearch Namibia:**
- Deployed on Ubuntu Desktop (alpha@100.106.110.119)
- Research loop: `/home/alpha/alice-autonomous-researcher/namibia-findings/`
- Cron: every 4 hours, improving low-scored topics
- Topics researched so far: internet_connectivity.md, power_infrastructure.md
- Findings synthesized into: namibia-infrastructure-report.md (in the namibia-findings dir)

**Infrastructure findings so far:**
- Starlink: NOT available in Namibia yet
- Primary ISP: WIND/Orange Namibia fiber (NAD 475/mo ~$36), up to 100Mbps
- Backup: Telecom Namibia 4G LTE (NAD 960/mo ~$72)
- Power: NamPower grid NAD 0.43-0.50/kWh; solar viable (6-7 sun hrs/day); solar payback 5-7 years
- Server CAPEX estimate: ~$15-25k for 2-server setup
- Monthly OPEX: ~$2-3k/mo
- Vendors: SolarWise Namibia, Dynalift Namibia (generators), EcoPower Namibia (UPS)

**10 revenue products defined** (documented somewhere in the namibia-findings dir)

**Still needs:** I don't know what the actual PRODUCT/SERVICE being built is — what does "AI data center in Namibia" actually SELL? Rob needs to clarify.

## KidSpark / Sanchez Family Ventures (2026-03-28, moved to Ubuntu Desktop 2026-04-07)

**What:** 5 competing AI-for-kids brands (ZNAP, SIDEKICK, BLOOM, LAUNCHPAD, KidSpark AI) under a single holding company, ALL operated 24/7 by A.L.I.C.E. agents.

**Project moved to Ubuntu Desktop** (2026-04-07): `/home/alpha/kidspark/` on `ubuntu-desktop` (100.106.110.119)
- Deploy from Ubuntu Desktop: `vercel deploy --prod --yes --token <VERCEL_TOKEN>`
- Live: https://kidspark-ai.vercel.app

**Full project memory:** `memory/kidspark-project.md` — comprehensive briefing with file locations, infrastructure map, API status, Stripe config, cron jobs, n8n workflows, and 17 action items.
**Source doc:** `kidspark/KIDSPARK-BRIEFING.md` (20,500 chars, canonical reference)

**Family:**
- Rob Sanchez: 35% Managing Member
- Leanna (mom): 35% Managing Member
- Daughter 1 (age 11): 15% (UTMA custodial)
- Daughter 2 (age 8): 15% (UTMA custodial)
- Location: Fairfax, VA (Fairfax County) — NOT Wyoming
- LLC should be formed in Virginia (where they live)

**Infrastructure:**
- Mac Mini = Operations Hub (OpenClaw primary, all cron jobs, agents, orchestration) — ✅ OpenClaw installed & gateway running
- Mac Studio = AI Inference (Ollama, NeMo Guardrails)
- Ubuntu Desktop = Heavy AI + Monitoring (ComfyUI, Qdrant, Redis, Grafana)
- Supabase Cloud = Database

**Status:** All planning deliverables complete. Waiting for:
1. Girls to pick brand names
2. COPPA attorney engagement
3. LLC formation
4. Rob to say "build"

**Key dates:** COPPA 2025 amendments take effect April 22, 2026

**Revenue model:** Break-even at 22 paying users. Year 3 target: $1.44M ARR.

## Projects

- Mission Control is the planned unified control plane for A.L.I.C.E. and future client applications. It is platform-first, multi-app, multi-tenant, environment-aware, role-aware, and read-safe-first.
- A.L.I.C.E. Master Revision v2.2 originally referenced LangSmith, but Rob explicitly decided to replace it with Langfuse because LangSmith is closed source and paid observability is not acceptable for this build. The plan should now use Langfuse for tracing/observability alongside OpenClaw, LangGraph, Supabase, pgvector, local-first Ollama workers, and a Global CEO agent on GPT-5.4.
- The agreed foundational evaluation/observability stack is two-plane: OpenTelemetry + Grafana for system observability, and Langfuse + DeepEval + Ragas + Promptfoo for AI tracing, evaluation, retrieval/memory quality, and prompt/model experimentation.
- Rob wants evaluation and observability specified early and concretely, including env/config planning, telemetry destinations, orchestrator emissions, initial benchmark dataset shape, and the later Mission Control surfaces for eval visibility.
- In A.L.I.C.E., knowledge retrieval and long-term memory are separate logical systems, and tenant separation, retention, and deletion are foundational requirements.

## Team Structure (Updated 2026-03-25)

**Research team:**
- **Rowan** — short research, quick answers, on-demand, triggered by user chat
- **Aria** — autonomous persistent research agent per project, long-running
  - Aria-Namibia: owns Namibia AI infrastructure project
  - Aria-BLLM: owns OperationBLLM (community-owned AAVE LLM)
  - **NOW PROPERLY CONFIGURED** — id:aria in openclaw.json, workspace: ~/.openclaw/workspace-aria with full agent files (SOUL.md, IDENTITY.md, PLAYBOOK.md, etc.)
- **Olivia (me)** — orchestrator, delegates to Aria, synthesizes for Rob

**Aria system:**
- n8n API key (devshop): stored in n8n DB, user `admin@alice.local`; key format: JWT Bearer via `X-N8N-API-KEY` header
  - Value: `<JWT_TOKEN>`
- Queue dir: `/home/alpha/alice-autonomous-researcher/queue/{project}/`
- Processing dir: `/home/alpha/alice-autonomous-researcher/processing/{project}/`
- Findings dir: `/home/alpha/alice-autonomous-researcher/{project}-findings/`
- n8n webhook workflow (ID: h4SrsJKlcKZMxHSX): `https://n8n.av3.ai/webhook/autoresearch` → writes to queue dir
- n8n queue worker (ID: 8zlCQnChqoES7z3d): runs every 60s, picks up from queue → moves to processing dir
- Aria polls processing dir, picks up tasks, writes findings to findings dir
- IMPORTANT: Aria subagent sessions have ephemeral filesystems — findings must be written via exec to Ubuntu Desktop
- Cron every 4hrs → improves low-scored topics
- Aria files: `/Users/aliceclaw/.openclaw/workspace-olivia/aria/{namibia,bllm}/`
- n8n workflow JSON: `/Users/aliceclaw/.openclaw/workspace-olivia/n8n-workflows/autoresearch.json`

## NemoClaw (March 2026)

- NemoClaw launched at NVIDIA GTC 2026 on 2026-03-16
- It is OpenClaw + NVIDIA's enterprise security layer (OpenShell, Nemotron, privacy router)
- OpenClaw was acquihired by OpenAI in February 2026; Peter Steinberger remains maintainer
- A.L.I.C.E. agents are NemoClaw-compatible (NemoClaw IS OpenClaw under the hood)
- NemoClaw = infrastructure/security layer. A.L.I.C.E. = orchestration layer above it.
- Jensen Huang called OpenClaw "the OS for personal AI" at GTC
- Positioning: A.L.I.C.E. is the application layer on the emerging agent OS
- Enterprise partners: Salesforce, Cisco, Google, Adobe, CrowdStrike
- npx package updated to v1.2.5 with NemoClaw detection and README compatibility section

## AliceFleet Sync Architecture (2026-03-26)

Full plan: `workspace-olivia/plans/alice-fleet-sync.md`

### Architecture
- alice-agents (user install) = OpenClaw + Mission Control + 10 starter agents
- Pro upgrade = 21 more agents unlocked via license key
- Cloud ($20/mo) = Supabase persistence for RAG/memory/stats, auto-save enabled via Stripe webhook
- alice-agents install wizard → Pro key validation endpoint → unlocks agents
- MC sends telemetry → Supabase (RLS-isolated per user)
- AliceFleet reads from Supabase → Rob pushes updates via Supabase Realtime
- Rob's Mac Mini accessible via Tailscale Funnel (Phase 1)
- Rob's OpenClaw = one of the AliceFleet-managed nodes

### Supabase Realtime
- Each MC instance subscribes to channel `node:{node_id}`
- AliceFleet writes → Supabase Realtime → MC applies automatically
- No inbound port needed on MC — MC connects outbound to Supabase

### Revenue
- Pro: one-time fee, unlocks 31 agents
- Cloud: $20/mo recurring, Supabase auto-save enabled after Stripe webhook

### Build Phases
- Phase 0 (DONE): Infrastructure — OpenClaw 2026.3.24, HTTP refactor, n8n embeddings, M2.7-HS
- Phase 1 (IN PROGRESS): Tailscale Funnel + Supabase schema
- Phase 2: License validation endpoint
- Phase 3: Supabase Realtime push sync
- Phase 4: Cloud auto-save (Stripe webhook)
- Phase 5: AliceFleet fleet management UI

### Key Config
- Mac Mini Tailscale: openclaws-mac-mini.taila15762.ts.net
- n8n embeddings webhook: http://localhost:5678/webhook/embeddings
- n8n credentials: admin@openclaw.local / OpenClaw123!
- Gateway token: 690b8c044b5661cd3d794c155cc88f9e9cc5c97660e02797

## Secrets (2026-04-06)

- **Vercel Token:** `<VERCEL_TOKEN>`
  - Stored in: ~/.bashrc
  - Use for: Creating new Vercel projects, deployments via API

## AccuScope Agent (Created 2026-04-08)
- New specialist agent: `accuscope` — AccuLynx CRM auditor & BI agent
- Configured in openclaw.json as 31st agent
- Workspace: ~/.openclaw/workspace-accuscope/
- Skills: ~/.openclaw/skills/accuscope/SKILL.md (loaded automatically on trigger)
- Spawn pattern: `sessions_spawn(agentId: "accuscope", mode: "session")`
- Trigger phrases: any MRI/AccuLynx financial question from Jesse or Rob
- Browser MCP: enabled (can navigate AccuLynx directly)
- Key URLs: Job Profitability (/reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375), Lead Sources (/reports/63e61461-6c3a-4756-8bfb-db7f841a7f62), A/R Aging (/reports/abe3b8d6-033f-4e3e-8729-38a3e5e5f1ae)

## MRI Audit Dashboard (2026-04-08)
- Live: https://mri-audit-dashboard.vercel.app
- Built from Rolling 365-day AccuLynx data (268 jobs, $8.23M revenue)
- Executive redesign deployed (navy dark theme, Lucide icons, JetBrains Mono KPIs)
- 27 low-margin jobs identified (<20%, all milestone types, last 2 years by Closed Milestone Date)
- Data quality issues: 78% revenue uncategorized by Trade; Nathan Hoang $263K litigation A/R

## Pending Jesse Requests
- P&L for strictly-closed jobs (365-day window, Closed Milestone Date filter) — in progress
- Profit by lead source (Jesse Hoptiak, Matt Lama, JL Tree Service) — estimate only, native report blocked
- Full job list for Matt Lama referrals — needs per-job search
