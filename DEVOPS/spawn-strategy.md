# A.L.I.C.E. Agent Spawn Strategy
**Author:** Devon (DevOps/Infra)  
**Date:** 2026-04-23  
**Status:** Design Draft — for Rob's review and implementation

---

## 1. Current State

### How Olivia Spawns Agents Today

Olivia uses a **static, hardcoded domain map** in `workspace-olivia/AGENTS.md`:

```
UI/design    → Nadia → Felix → Quinn
Product/copy → Morgan
Backend/API  → Dylan
Security     → Selena
Ops/infra    → Owen
QA           → Quinn
Docs         → Daphne
Research     → Uma
```

**Spawn mechanism:** `sessions_spawn` with `maxConcurrent` enforced at the OpenClaw level:
- `agents.defaults.maxConcurrent: 4` — max parallel agents for the orchestrator
- `agents.defaults.subagents.maxConcurrent: 4` — max parallel subagents per agent
- `agents.defaults.subagents.runTimeoutSeconds: 1800` — 30-minute hard timeout

### Bottlenecks & Gaps

| Problem | Impact |
|---|---|
| Hardcoded single-primary routing | If Felix is busy, UI tasks queue behind him; no failover |
| No concept of agent pools | 33 agents exist but only 5–6 get work; 27 sit idle |
| No load-aware routing | A burst of 3 UI tasks all route to Felix/Quinn serially |
| Pro agents almost never used | Nadia, Felix, Quinn are the only UI-path agents; MaxxiPro, AccuScope, etc. are ghosts |
| Blind rotation | Round-robin doesn't account for task fit or agent specialty |
| No affinity override | A task that's 80% backend / 20% security always goes to Dylan even though it needs Selena too |
| Subagent timeout is global (30 min) | Long-running research or infra tasks hit the wall with no per-type override |

### What the OpenClaw Config Actually Controls Today

```json
// agents.defaults.subagents
{
  "maxConcurrent": 4,           // hard cap, all types
  "archiveAfterMinutes": 120,
  "runTimeoutSeconds": 1800     // same for research, CI, and bug triage
}
```

The `acp.dispatch.enabled: true` flag exists but ACP itself is disabled (`acp.enabled: false`), so dispatch routing is not yet active.

---

## 2. Proposed Strategy

### 2.1 Agent Pools (Domain Groups)

Replace single-primary routing with **named pools**. Each pool has a primary and one or more backup agents. Olivia routes to a pool, and the pool decides which agent gets the task.

| Pool | Primary | Backups | Task Types |
|---|---|---|---|
| `ui` | Felix | Nadia (spec), Quinn (QA) | UI implementation, component work |
| `design` | Nadia | Felix | Design specs, wireframes, design system |
| `backend` | Dylan | Isaac (integrations) | API, data model, backend logic |
| `frontend` | Felix | — | CSS, JS, React components |
| `qa` | Quinn | SmokeTestAgent | Test writing, bug verification, regression |
| `security` | Selena | Logan (legal/compliance) | Security review, audits, compliance |
| `devops` | Devon | Owen (ops), Avery (automation) | CI/CD, infra, deployment, pipelines |
| `docs` | Daphne | Parker (project docs) | API docs, runbooks, guides |
| `research` | Rowan | Uma (UX research), Aria (deep research) | Web research, competitive intel, surveys |
| `data` | Darius | Aiden (analytics), Alex (extraction) | Pipelines, ETL, dashboards |
| `marketing` | Morgan | Clara (comms), Sloane (sales) | Campaigns, content, positioning |
| `operations` | Owen | Avery (automation), Parker (PM) | Business ops, workflows, vendor |
| `product` | Morgan | Eva (exec ops) | Roadmap, prioritization, briefs |
| `crm` | Caleb | Sophie (support) | CRM config, data hygiene, records |
| `financial` | Audrey | Elena (estimation) | Budgets, forecasts, invoices |
| `legal` | Logan | Selena (security/compliance) | Contracts, GDPR, terms |
| `hr` | Hannah | Clara (comms) | Onboarding, policy, feedback |
| `integration` | Isaac | Alex (crawling), Nate (n8n) | Webhooks, API connections, n8n workflows |
| `autonomous-research` | Aria | Rowan | Long-running research projects |
| `construction` | MaxxiPro | AccuScope | Roofing, remodeling, construction CRM, dealer systems |
| `travel` | Tommy | Uma (UX research), Rowan (intel) | Travel logistics, booking, itinerary research |

### 2.2 Routing Logic: Pool → Agent Selection

Olivia routes to a **pool name**, not an agent ID. The selection order within a pool:

1. **Primary specialist** — route to the specialist whose SOUL.md/skills best match the task domain
2. **Check agent availability** — is the specialist currently active (handling another task)?
3. **Route on expertise, not rotation** — pick the best-fit agent, don't round-robin blindly
4. **Spin up duplicates freely** — if parallel work is needed (e.g., 3 UI components at once), spawn N copies of the specialist. OpenClaw handles concurrent sessions of the same agent type. Never serialize parallelizable work.
5. **If all specialists busy → queue with timeout** — wait up to `busyBackoffMs` (60s) before escalating to Rob
6. **Affinity override** — if a task is a continuation, stick with the same agent

### 2.3 Concurrent Spawn Limits (Per Task Type)

Not all task types have the same parallelism profile. Add a `taskTypes` config:

| Task Type | Max Concurrent | Timeout | Examples |
|---|---|---|---|
| `quick` | 8 | 5 min | Factual lookups, single-file edits |
| `standard` | 4 | 30 min | Feature work, bug fixes, doc writing |
| `complex` | 2 | 90 min | Multi-file features, architecture decisions |
| `deep-research` | 1 | 240 min | Aria-class autonomous research |
| `infra-change` | 1 | 60 min | Terraform apply, kubectl, deployment |
| `review` | 4 | 20 min | PR reviews, security audits |
| `qa-pass` | 3 | 45 min | Full regression, test execution |

These override the global `maxConcurrent: 4` based on task classification.

### 2.4 Agent Affinity vs. Rotation

**Affinity (stick with specialist) when:**
- Task is a direct continuation of previous work by the same agent
- Task requires deep context only that agent has (e.g., "continue the OAuth work Dylan started")
- Task is security-sensitive (Selena should own security-related code reviews)

**Load-aware expertise routing (not round-robin):**
- Route to the specialist whose domain/skills best match the task — not by rotation order
- Check active session count before assigning; if specialist has >3 active sessions, try the next-best match
- If no specialists available → queue 60s → escalate to Rob
- **Spin up duplicates** if parallel work is needed. OpenClaw supports concurrent sessions of the same agent type.

**Implementation:** Each pool tracks:
- `activeSessions`: count of currently running sessions per specialist
- `specialtyScore`: how well each agent's SOUL.md/skills match the current task's domain
- Selection picks highest specialtyScore specialist with <3 active sessions

### 2.5 Multi-Agent Tasks (Parallel Handoffs)

When a task spans multiple pools, Olivia spawns agents from each pool **in parallel** rather than sequentially:

```
Request: "Build a new landing page section with a form"
  → Nadia (design pool)     — parallel
  → Dylan (backend pool)    — parallel (form handler API)
  → Quinn (qa pool)         — parallel (test plan)
  → A.L.I.C.E. synthesizes when all complete
```

**Rule:** Always spawn independent agents in parallel. Only sequence when there's a dependency.

---

## 3. Configuration

### Option A: Extend `openclaw.json` (runtime-enforced)

Add per-agent and pool-level fields to the `agents` section.

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "maxConcurrent": 4,
        "archiveAfterMinutes": 120,
        "runTimeoutSeconds": 1800,
        "taskTypes": {
          "quick":         { "maxConcurrent": 8,  "runTimeoutSeconds": 300 },
          "standard":     { "maxConcurrent": 4,  "runTimeoutSeconds": 1800 },
          "complex":      { "maxConcurrent": 2,  "runTimeoutSeconds": 5400 },
          "deep-research": { "maxConcurrent": 1,  "runTimeoutSeconds": 14400 },
          "infra-change":  { "maxConcurrent": 1,  "runTimeoutSeconds": 3600 },
          "review":       { "maxConcurrent": 4,  "runTimeoutSeconds": 1200 },
          "qa-pass":      { "maxConcurrent": 3,  "runTimeoutSeconds": 2700 }
        }
      }
    },
    "pools": {
      "ui":          { "primary": "felix",  "backups": ["nadia", "quinn"],     "taskTypes": ["standard", "complex"] },
      "backend":     { "primary": "dylan",  "backups": ["isaac"],               "taskTypes": ["standard", "complex", "infra-change"] },
      "qa":          { "primary": "quinn",  "backups": ["smoketestagent"],      "taskTypes": ["qa-pass", "standard"] },
      "security":    { "primary": "selena", "backups": ["logan"],               "taskTypes": ["review", "standard"] },
      "devops":      { "primary": "devon",  "backups": ["owen", "avery"],       "taskTypes": ["infra-change", "standard"] },
      "research":    { "primary": "rowan",  "backups": ["uma", "aria"],         "taskTypes": ["deep-research", "standard"] },
      "data":        { "primary": "darius", "backups": ["aiden", "alex"],       "taskTypes": ["standard", "complex"] },
      "docs":        { "primary": "daphne", "backups": ["parker"],             "taskTypes": ["standard", "quick"] },
      "marketing":   { "primary": "morgan", "backups": ["clara", "sloane"],    "taskTypes": ["standard"] },
      "integration": { "primary": "isaac",  "backups": ["alex", "nate"],       "taskTypes": ["standard", "complex"] },
      "operations":  { "primary": "owen",   "backups": ["avery", "parker"],     "taskTypes": ["standard", "quick"] },
      "product":     { "primary": "morgan", "backups": ["eva"],                "taskTypes": ["standard"] },
      "crm":         { "primary": "caleb",  "backups": ["sophie"],             "taskTypes": ["standard", "quick"] },
      "financial":   { "primary": "audrey", "backups": ["elena"],              "taskTypes": ["standard"] },
      "legal":       { "primary": "logan",  "backups": ["selena"],             "taskTypes": ["review", "standard"] },
      "hr":          { "primary": "hannah", "backups": ["clara"],             "taskTypes": ["standard", "quick"] },
      "design":      { "primary": "nadia",  "backups": ["felix"],              "taskTypes": ["standard", "complex"] },
      "frontend":    { "primary": "felix",  "backups": [],                     "taskTypes": ["standard", "complex"] },
      "construction": { "primary": "maxxipro", "backups": ["accuscope"],        "taskTypes": ["standard", "complex"] },
      "travel":        { "primary": "tommy",   "backups": ["uma", "rowan"],     "taskTypes": ["standard", "deep-research"] }
    },
    "routing": {
      "loadBalanceMode": "expertise-first",
      "busyBackoffMs": 60000,
      "maxQueueDepth": 5,
      "spinUpDuplicates": true,
      "maxPerAgentConcurrent": 3
    }
  }
}
```

### Option B: Separate `spawn-policy.md` (human-editable, iterative)

**Recommended for initial implementation.** Keep the config in `workspace-olivia/alice-agents/spawn-policy.md` as a structured document that Olivia reads at startup and refreshes periodically.

```markdown
# A.L.I.C.E. Spawn Policy

## Agent Pools
| Pool | Primary | Backups |
|---|---|---|
| ui | felix | nadia, quinn |
| backend | dylan | isaac |
| qa | quinn | smoketestagent |
| security | selena | logan |
| devops | devon | owen, avery |
| research | rowan | uma, aria |
| data | darius | aiden, alex |
| docs | daphne | parker |
| marketing | morgan | clara, sloane |
| integration | isaac | alex, nate |
| operations | owen | avery, parker |
| product | morgan | eva |
| crm | caleb | sophie |
| financial | audrey | elena |
| legal | logan | selena |
| hr | hannah | clara |
| design | nadia | felix |
| frontend | felix | |
| construction | maxxipro | accuscope |
| travel | tommy | uma, rowan |

## Task Type Limits
| Type | Max Concurrent | Timeout |
|---|---|---|
| quick | 8 | 5m |
| standard | 4 | 30m |
| complex | 2 | 90m |
| deep-research | 1 | 240m |
| infra-change | 1 | 60m |
| review | 4 | 20m |
| qa-pass | 3 | 45m |

## Routing Rules
- loadBalanceMode: expertise-first (not rotation)
- busyBackoffMs: 60000 (60s then ask Rob)
- spinUpDuplicates: true (parallel work → parallel agents)
- maxPerAgentConcurrent: 3 (cap before queuing)
- Always spawn independent tasks in parallel from different pools
```

**Recommendation:** Start with Option B. When the routing logic stabilizes, migrate to Option A so OpenClaw can enforce the limits at runtime rather than relying on Olivia to self-impose them.

---

## 4. Implementation Notes

### 4.1 Changes to OpenClaw Config

1. **Increase global `maxConcurrent`** from 4 → **20**. Rob wants to spin up multiple teams in parallel. With pool-based routing and duplicate agent support, the orchestrator needs real headroom.

2. **Task-type timeouts** — currently `runTimeoutSeconds: 1800` is global. Needs per-type overrides so `deep-research` gets 4 hours and `infra-change` gets 60 minutes without blocking `quick` tasks.

3. **Enable ACP dispatch** — `acp.enabled: false` → `true` once pool routing is implemented in Olivia. The `acp.dispatch.enabled: true` flag is already set; it needs the `acp` subsystem enabled to take effect.

4. **Per-agent session tracking** — OpenClaw doesn't currently expose per-agent active session counts to the orchestrator. Olivia needs a way to query this (via `sessions_list` filtered by agent, or a dedicated `agents_stats` tool). Without it, routing falls back to expertise-only mode (no load awareness).

### 4.2 Changes to Olivia's AGENTS.md

**Replace the static routing map with:**
```
Pool routing: look up domain → select best-fit available specialist (spin up duplicates if needed)
Task type: classify request → apply taskType concurrency limit and timeout
Multi-pool: spawn in parallel; sequence only when there's a dependency
```

Olivia needs three new internal capabilities:
1. **Pool resolver** — given a domain/task, return the appropriate pool name
2. **Agent selector** — given a pool, return the best available specialist (expertise score + load + affinity)
3. **Task classifier** — estimate task complexity/type from keywords and context to apply the right limits

### 4.3 Implementation Order

| Phase | What | Owner | Effort | Notes |
|---|---|---|---|---|
| 0 | Define `spawn-policy.md` — expand current 5-6 agent map to all 33 | Devon writes, Rob reviews | 2h | This doc; Rob approves pool assignments |
| 1 | Pool resolver + agent selector as Olivia's internal logic (no OpenClaw changes) | Dylan | 4h | Reads spawn-policy.md at startup |
| 2 | Task type classifier heuristics (keyword + complexity hints) | Dylan | 3h | Maps request → taskType |
| 3 | Expertise-based selection + load tracking in Olivia's session context | Dylan | 3h | Per-pool specialtyScore + activeSessions state |
| 4 | Enable ACP (`acp.enabled: true`) and verify dispatch routing | Devon | 1h | Flip the flag; monitor |
| 5 | Tune `taskTypes` limits based on observed runtimes | Devon + data | 2h | Adjust based on actual timing |
| 6 | Migrate `spawn-policy.md` → `openclaw.json agents.pools` (optional) | Devon | 3h | Runtime enforcement of pools |

### 4.4 Immediate Benefits After Phase 1

- **Devops pool** (currently just Owen) spreads to Devon + Avery for automation work
- **Research pool** (currently just Rowan) gains Uma for UX research + Aria for deep autonomous work
- **Integration pool** (currently unused Isaac) gains Alex + Nate for webhook/crawl/n8n work
- **QA pool** adds SmokeTestAgent as a true parallel to Quinn
- **21 pools** covering all 33 agents — the "ghost agents" problem is solved by construction

### 4.5 Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Backup agent lacks context from primary | Agent reads their workspace's `LEARNINGS.md` and `PLAYBOOK.md` on spawn; Olivia includes relevant context in spawn prompt |
| Rotation causes inconsistency in long tasks | Affinity override — if task has an `inheritedFrom` tag, route to same agent |
| Aria spawns unbounded subagents | `deep-research` task type hard-capped at `maxConcurrent: 1` — Olivia enforces before spawning |
| Pro agents still ignored if Rob doesn't assign them to pools | Pool config is a file Rob can edit at any time — no code change needed to rebalance |
| OpenClaw doesn't expose per-agent session counts | Fall back to expertise-only mode (no load tracking); upgrade to `agents_stats` tool in Phase 5 |
