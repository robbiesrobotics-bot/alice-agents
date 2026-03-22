# A.L.I.C.E. Business Operating System — Master Project Plan

**Owner:** Rob (decisions) | Parker (delivery) | Olivia (orchestration)  
**Created:** 2026-03-17  
**Horizon:** 12 weeks across 4 sprints  
**Narrative:** *"We run A.L.I.C.E. using A.L.I.C.E." — every agent has receipts.*  
**Status:** 🟢 Active Planning

---

## Executive Summary

This plan deploys all 28 A.L.I.C.E. agents to run the A.L.I.C.E. business end-to-end. The Owners Section (`admin.av3.ai`) is the command center — a separate admin subdomain (not inside Mission Control) where Rob sees every automated job running, with evidence. The goal: by Sprint 4 completion, Rob's operational role is approvals-only. Agents do the rest.

---

## Architecture Overview

```
admin.av3.ai          — Owners Section (Rob-only, SSO-gated)
  ├── Morning Brief   — Eva's daily digest (DONE)
  ├── CRM             — Caleb's pipeline from Stripe webhooks
  ├── Support Queue   — Sophie's triage + drafts
  ├── Revenue         — Aiden's dashboard (Stripe + MRR)
  └── Agent Status    — All 28 agents: last run, last output, health

Mission Control       — Client-facing product (existing)
  └── Avery's Workflows → deployed here in Sprint 3

av3.ai                — Public site + payment flows
```

---

## Sprint 1 — Foundation
**Duration:** Weeks 1–2  
**Theme:** Build the shell. Get data flowing. Establish the Owners Section.

### Goals
- `admin.av3.ai` scaffold live with SSO
- All 5 Owners Section modules wired up (even if some show placeholder data)
- Stripe webhooks feeding Caleb's CRM
- Sophie expanded to Slack + Discord
- Eva morning brief confirmed running (already done ✅)

---

### Sprint 1 Tasks

#### 1.1 admin.av3.ai — Scaffold & SSO

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 1.1.1 | Register `admin.av3.ai` subdomain + DNS | Devon | S | Domain access | 🔴 Rob must configure DNS |
| 1.1.2 | Scaffold Next.js app at admin.av3.ai | Felix | M | Domain live | — |
| 1.1.3 | SSO integration (Clerk or Auth.js with GitHub OAuth) | Dylan | M | Scaffold | 🔴 Rob decides: Clerk vs Auth.js |
| 1.1.4 | Lock all routes to `rob@` email only | Dylan | S | SSO | — |
| 1.1.5 | Deploy to Vercel (or existing infra) | Devon | S | Scaffold | — |
| 1.1.6 | TLS cert + health check | Devon | S | Deploy | — |

**Sprint 1.1 Dependencies:** DNS first → scaffold → SSO → deploy

---

#### 1.2 Owners Section Shell — 5 Modules

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 1.2.1 | Navigation shell (sidebar + routing) | Felix | S | Scaffold |
| 1.2.2 | Module: Morning Brief (embed Eva's output) | Felix | S | Eva cron ✅ |
| 1.2.3 | Module: CRM (Caleb's pipeline view) | Felix | M | 1.3.x Caleb tasks |
| 1.2.4 | Module: Support Queue (Sophie's triage view) | Felix | M | 1.4.x Sophie tasks |
| 1.2.5 | Module: Revenue (Aiden's Stripe summary) | Felix | M | Sprint 2 Aiden tasks |
| 1.2.6 | Module: Agent Status Board (all 28 agents, last run + health) | Felix + Darius | L | Agent cron telemetry |
| 1.2.7 | Shared UI component library (cards, status badges, tables) | Felix | M | Scaffold |
| 1.2.8 | Mobile-responsive layout | Felix | S | Shell |

---

#### 1.3 Caleb — CRM Auto-Population from Stripe

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 1.3.1 | Define CRM data model: Contact, Company, Deal, Stage | Caleb | S | — | 🔴 Rob confirms CRM scope |
| 1.3.2 | Create Supabase `crm_contacts` + `crm_deals` tables | Darius | S | 1.3.1 | — |
| 1.3.3 | Stripe webhook handler: `checkout.session.completed` → new CRM contact + deal | Dylan | M | Tables, Stripe keys | — |
| 1.3.4 | Stripe webhook: `customer.subscription.updated` → update deal stage | Dylan | S | 1.3.3 | — |
| 1.3.5 | Caleb cron: enrich contacts daily (company, role via Clearbit or manual) | Caleb + Alex | M | 1.3.2 | 🔴 Rob: use Clearbit API? |
| 1.3.6 | CRM view in Owners Section (contact list, deal pipeline, stage filters) | Felix | M | 1.3.2 | — |
| 1.3.7 | Caleb weekly: flag churned or stale contacts to Olivia | Caleb | S | 1.3.2 | — |

---

#### 1.4 Sophie — Multi-Channel Support (Expand to Slack + Discord)

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 1.4.1 | Existing: Contact form intake ✅ | — | — | Done | — |
| 1.4.2 | Existing: GitHub issue intake ✅ | — | — | Done | — |
| 1.4.3 | Add Slack channel intake (webhook → Sophie queue) | Isaac | M | Slack workspace | 🔴 Rob: which Slack workspace + channel? |
| 1.4.4 | Add Discord intake (bot in A.L.I.C.E. Discord server) | Isaac | M | Discord bot token | 🔴 Rob: create Discord server / bot? |
| 1.4.5 | Unified support queue schema in Supabase | Darius | S | — | — |
| 1.4.6 | Sophie triage: classify all sources into queue (bug / billing / general) | Sophie | M | 1.4.5 | — |
| 1.4.7 | Support Queue view in Owners Section (all channels, status, draft responses) | Felix | M | 1.4.5 | — |
| 1.4.8 | Sophie daily cron: sweep new tickets, draft responses, flag urgent | Sophie | S | 1.4.6 | — |

---

#### 1.5 Eva — Morning Brief (ALREADY RUNNING ✅)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.5.1 | Eva morning brief cron | ✅ DONE | Running daily |
| 1.5.2 | Wire Eva output to Morning Brief module in Owners Section | Felix | M — wire existing output to UI |
| 1.5.3 | Format brief for Owners Section display | Eva | S — minor formatting pass |

---

#### 1.6 Agent Status Board — Telemetry Foundation

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 1.6.1 | Define agent telemetry schema: `agent_runs` table (agent_id, run_at, status, summary, output_url) | Darius | S | — |
| 1.6.2 | Each agent writes telemetry record on cron completion | Dylan (framework) | M | 1.6.1 |
| 1.6.3 | Agent Status Board UI: grid of all 28 agents, last run, status badge, link to output | Felix | M | 1.6.1 |
| 1.6.4 | Alert if agent hasn't run in >24h over its expected schedule | Devon | S | 1.6.1 |

---

### Sprint 1 Rob Decisions Required 🔴

| Decision | Blocking | Priority |
|----------|----------|----------|
| DNS configuration for admin.av3.ai | 1.1.1 — nothing starts without this | P0 |
| Auth provider: Clerk vs Auth.js | 1.1.3 | P0 |
| CRM scope (contacts + deals only, or full pipeline?) | 1.3.1 | P1 |
| Slack workspace + support channel for Sophie | 1.4.3 | P1 |
| Discord server + bot creation | 1.4.4 | P1 |
| Clearbit enrichment (paid API) or manual only? | 1.3.5 | P2 |

---

### Sprint 1 Definition of Done

- [ ] admin.av3.ai loads, requires SSO, only Rob can enter
- [ ] All 5 module routes exist (even if some show "coming soon")
- [ ] Eva's morning brief displays in Morning Brief module
- [ ] Stripe webhooks creating CRM records in Supabase
- [ ] Sophie receiving tickets from 4 channels (form, GitHub, Slack, Discord)
- [ ] Agent Status Board shows at least Eva + Sophie + Caleb with real telemetry

---

## Sprint 2 — Revenue + Sales Intelligence
**Duration:** Weeks 3–4  
**Theme:** Follow the money. See the pipeline. Close the loop.

### Goals
- Aiden's revenue dashboard live in Owners Section
- Audrey tracking expenses + P&L
- Sloane's pipeline view populated from Caleb's CRM
- Alex enriching leads automatically
- Logan's legal queue active
- Isaac's Slack/Discord bot integrations serving customers

---

### Sprint 2 Tasks

#### 2.1 Aiden — Revenue Dashboard

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 2.1.1 | Connect Stripe read-only API key to Aiden's data pull | Aiden + Darius | S | Stripe keys | 🔴 Rob: generate Stripe restricted key |
| 2.1.2 | Build revenue data pipeline: MRR, ARR, new customers, churn, LTV | Darius | M | 2.1.1 |
| 2.1.3 | Aiden weekly analytics report: revenue + product metrics | Aiden | M | 2.1.2 |
| 2.1.4 | Revenue module in Owners Section: MRR chart, customer count, recent transactions | Felix | M | 2.1.2 |
| 2.1.5 | Aiden Monday cron: full metrics pull + delta vs prior week | Aiden | S | 2.1.3 |
| 2.1.6 | Wire npm download stats + GitHub stars into same dashboard | Aiden | S | 2.1.3 |

---

#### 2.2 Audrey — Expense Tracking + P&L

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 2.2.1 | Define expense categories (infra, tools, APIs, marketing) | Audrey | S | — | 🔴 Rob reviews + approves categories |
| 2.2.2 | Create `expenses` table in Supabase | Darius | S | 2.2.1 |
| 2.2.3 | Manual expense entry form in Owners Section (Rob-facing) | Felix | S | 2.2.2 |
| 2.2.4 | Audrey weekly: reconcile expenses vs revenue → P&L summary | Audrey | M | 2.2.2, 2.1.2 |
| 2.2.5 | P&L summary card in Revenue module | Felix | S | 2.2.4 |
| 2.2.6 | Audrey monthly close: full P&L report to Olivia | Audrey | M | 2.2.4 |
| 2.2.7 | Stripe fee tracking (auto-populate infra costs from Stripe data) | Audrey + Dylan | S | 2.1.1 |

---

#### 2.3 Sloane — Pipeline View + Alex Lead Enrichment

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 2.3.1 | Sloane daily: monitor GitHub signals (new stars, forks, issues from non-customers) | Sloane | S | GitHub token |
| 2.3.2 | Sloane: identify "upgrade signal" users (power users, multiple issues filed) | Sloane | M | 2.3.1, Caleb CRM |
| 2.3.3 | Alex: enrich lead profiles (GitHub → company, role, email via public signals) | Alex | M | Sloane's signal list |
| 2.3.4 | Sloane: draft outreach for Rob-approved contacts | Sloane | M | 2.3.3 | 🔴 Rob approves all outreach before send |
| 2.3.5 | Pipeline view in Owners Section: lead list, stage, enrichment data, outreach status | Felix | M | Caleb CRM, 2.3.3 |
| 2.3.6 | Sloane weekly summary: pipeline health, conversion opportunities, outreach queue | Sloane | S | 2.3.2 |

---

#### 2.4 Logan — Legal Queue

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 2.4.1 | Define legal queue scope: ToS reviews, inbound contract requests, compliance flags | Logan | S | — | 🔴 Rob confirms Logan's authority level |
| 2.4.2 | `legal_queue` table in Supabase (item_type, priority, status, Logan_notes) | Darius | S | 2.4.1 |
| 2.4.3 | Logan reviews av3.ai ToS + Privacy Policy for gaps | Logan | M | Current docs | 🔴 Rob: any changes need approval |
| 2.4.4 | Logan flags any enterprise inquiry with contract/NDA requirements | Logan | S | Sophie's queue |
| 2.4.5 | Legal Queue card in Owners Section (items, status, Rob action needed) | Felix | S | 2.4.2 |
| 2.4.6 | Logan weekly: sweep support + CRM for compliance-relevant items | Logan | S | 2.4.2 |

---

#### 2.5 Isaac — Slack/Discord Bot Integrations

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 2.5.1 | Slack bot: `/alice` command → routes to Sophie for support | Isaac | M | Slack app token | 🔴 Rob: approve Slack app creation |
| 2.5.2 | Discord bot: `!support` command → Sophie queue | Isaac | M | Discord bot token | 🔴 Rob: approve bot permissions |
| 2.5.3 | Slack bot: post weekly metrics summary to #metrics channel | Isaac + Aiden | S | 2.1.5 |
| 2.5.4 | Discord bot: post release announcements to #announcements | Isaac + Clara | S | GitHub webhook |
| 2.5.5 | Bot health monitoring: alert Devon if bot goes offline | Isaac + Devon | S | 2.5.1, 2.5.2 |

---

### Sprint 2 Rob Decisions Required 🔴

| Decision | Blocking | Priority |
|----------|----------|----------|
| Stripe restricted key (read-only for Aiden) | 2.1.1 | P0 |
| Expense categories approval | 2.2.1 | P1 |
| Logan's authority: flag-only vs draft changes | 2.4.1 | P1 |
| All outreach drafted by Sloane | 2.3.4 | P1 — Rob sends or doesn't |
| Slack app creation approval | 2.5.1 | P1 |
| Discord bot permissions scope | 2.5.2 | P1 |

---

### Sprint 2 Definition of Done

- [ ] Revenue module in Owners Section shows live Stripe MRR
- [ ] Aiden's Monday report runs automatically and posts to Olivia
- [ ] Audrey producing P&L summary weekly
- [ ] Sloane pipeline view populated with real leads
- [ ] Alex enriching at least new leads weekly
- [ ] Logan has reviewed ToS/Privacy Policy and filed any gaps
- [ ] Slack + Discord bots live and routing to Sophie

---

## Sprint 3 — Avery's Workflows
**Duration:** Weeks 5–7  
**Theme:** Automate the operating system. Felix + Dylan build. Avery specifies.

### Goals
- Avery designs 6 core business automation workflows
- Felix + Dylan implement each in Mission Control
- Workflows replace the remaining manual Rob tasks

---

### Sprint 3 Tasks

#### 3.1 Avery's Workflow Specifications

Avery writes a full spec for each workflow before Felix/Dylan touch code. Each spec includes: trigger, steps, agents involved, outputs, error handling, and success criteria.

| # | Workflow | Owner (Spec) | Complexity | Key Agents |
|---|----------|-------------|-----------|------------|
| 3.1.1 | **New Customer Onboarding** | Avery | M | Clara, Caleb, Daphne, Sophie |
| 3.1.2 | **Support Ticket Routing** | Avery | M | Sophie, Dylan, Logan, Caleb |
| 3.1.3 | **Weekly Reporting** | Avery | S | Aiden, Morgan, Rowan, Eva, Olivia |
| 3.1.4 | **Competitive Alert** | Avery | S | Rowan, Morgan, Clara |
| 3.1.5 | **Content Publishing** | Avery | M | Morgan, Clara, Dylan |
| 3.1.6 | **Enterprise Inquiry Routing** | Avery | L | Sophie, Logan, Sloane, Clara, Rob |

---

#### 3.2 Workflow: New Customer Onboarding

**Trigger:** Stripe `checkout.session.completed`  
**Steps:**
1. Dylan's license API generates key
2. Clara sends welcome email (immediate) with key + getting started guide
3. Caleb creates CRM contact + sets stage to "Onboarding"
4. Daphne queues a "has the customer read the docs?" follow-up check (Day 3)
5. Sophie monitors for any inbound question within first 72h (priority flag)
6. Clara sends Day 3 + Day 7 follow-up emails
7. Caleb updates CRM stage to "Active" at Day 7 if no churn signal

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.2.1 | Avery writes onboarding workflow spec | Avery | S | — |
| 3.2.2 | Felix implements workflow UI + trigger in Mission Control | Felix | M | Spec |
| 3.2.3 | Dylan wires Stripe webhook → workflow trigger | Dylan | S | 3.2.2 |
| 3.2.4 | Test end-to-end with test Stripe purchase | Quinn | S | 3.2.3 |

---

#### 3.3 Workflow: Support Ticket Routing

**Trigger:** New ticket arrives (any channel: form, GitHub, Slack, Discord)  
**Steps:**
1. Sophie classifies: bug / billing / legal / general
2. Bug → route to Dylan's queue + flag severity
3. Billing → route to Audrey + Caleb (update CRM)
4. Legal/compliance → route to Logan's queue
5. General → Sophie drafts response, queues for Rob approval
6. All tickets: Sophie updates Owners Section queue with status

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.3.1 | Avery writes routing workflow spec | Avery | S | Sophie multi-channel (Sprint 1) |
| 3.3.2 | Felix implements routing workflow in Mission Control | Felix | M | 3.3.1 |
| 3.3.3 | Dylan implements routing logic + queue integrations | Dylan | M | 3.3.2 |
| 3.3.4 | Quinn: test routing with synthetic tickets across all channels | Quinn | M | 3.3.3 |

---

#### 3.4 Workflow: Weekly Reporting

**Trigger:** Monday 7am EST cron  
**Steps:**
1. Aiden pulls metrics (revenue, users, signups, churn)
2. Morgan pulls content performance (traffic, engagement, social)
3. Rowan pulls competitive intel (competitor updates, market signals)
4. Eva synthesizes into Morning Brief format
5. Olivia compiles Weekly Business Review with top 3 decisions for Rob
6. Posted to Owners Section Morning Brief module + Telegram to Rob

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.4.1 | Avery writes weekly reporting workflow spec | Avery | S | Sprint 2 Aiden/Morgan/Rowan running |
| 3.4.2 | Felix implements workflow orchestration in Mission Control | Felix | S | 3.4.1 |
| 3.4.3 | Wire Olivia synthesis step (already partially exists) | Dylan | S | 3.4.2 |

---

#### 3.5 Workflow: Competitive Alert

**Trigger:** Rowan detects a significant competitive event (new launch, major feature, pricing change)  
**Steps:**
1. Rowan flags event with severity: low / medium / high
2. High severity → immediate Telegram alert to Rob via Olivia
3. Morgan receives positioning brief: "here's what changed, here's our response angle"
4. Clara drafts talking points for any inbound press/customer inquiry
5. Parker logs to competitive risk register

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.5.1 | Avery writes competitive alert spec | Avery | S | — |
| 3.5.2 | Dylan implements alert trigger + severity classifier | Dylan | M | 3.5.1 |
| 3.5.3 | Felix implements alert panel in Owners Section | Felix | S | 3.5.2 |

**Context note:** NemoClaw (OpenClaw + NVIDIA) launched March 16, 2026. Rowan is already monitoring this. This workflow needs to be live before the next major competitive event.

---

#### 3.6 Workflow: Content Publishing

**Trigger:** Morgan generates a new blog post (Monday 8pm cron)  
**Steps:**
1. Morgan writes post (title, body, meta description, suggested tags)
2. Clara reviews for brand voice + edits (automated review pass)
3. Dylan's webhook publishes to blog CMS (or direct file commit)
4. Morgan schedules 3–5 social posts promoting the article
5. Isaac posts to Slack #content + Discord #announcements
6. Aiden tracks traffic/performance data starting Day 3

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.6.1 | Avery writes content publishing workflow spec | Avery | S | Morgan cron already running |
| 3.6.2 | Felix implements publishing workflow UI in Mission Control | Felix | M | 3.6.1 |
| 3.6.3 | Dylan implements CMS integration (Markdown → published post) | Dylan | M | 3.6.2 | 🔴 Rob: which CMS? (Ghost, MDX files, Contentful?) |
| 3.6.4 | Isaac implements social + community distribution step | Isaac | S | 3.6.3 |

---

#### 3.7 Workflow: Enterprise Inquiry Routing

**Trigger:** Support ticket or contact form submission flagged as "Enterprise" (company size signals, pricing questions, custom terms)  
**Steps:**
1. Sophie classifies as Enterprise (signals: custom pricing ask, compliance questions, team/org context)
2. Logan reviews for any legal/NDA requirements
3. Sloane creates deal in Caleb's CRM (stage: Enterprise Prospect)
4. Clara drafts personalized response highlighting enterprise capabilities
5. Rob receives immediate Telegram notification with full context
6. Parker logs to enterprise pipeline tracker

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 3.7.1 | Avery writes enterprise routing spec | Avery | M | — |
| 3.7.2 | Dylan implements classification logic (enterprise signals) | Dylan | M | 3.7.1 |
| 3.7.3 | Felix implements enterprise pipeline view in Owners Section | Felix | M | 3.7.2 |
| 3.7.4 | Logan + Sloane integration: legal flags surface to Sloane's pipeline | Logan + Sloane | S | 3.7.2 |
| 3.7.5 | Immediate Rob notification (Telegram) for any enterprise inquiry | Devon + Olivia | S | 3.7.2 | 🔴 Rob: notification threshold (all enterprise? only above X seats?) |

---

### Sprint 3 Rob Decisions Required 🔴

| Decision | Blocking | Priority |
|----------|----------|----------|
| Blog CMS choice (Ghost / MDX files / Contentful) | 3.6.3 | P0 |
| Enterprise notification threshold (all / size filter) | 3.7.5 | P1 |
| Approve each Avery workflow spec before Felix/Dylan build | All 3.x | P1 — Avery writes, Rob reviews |

---

### Sprint 3 Definition of Done

- [ ] All 6 workflow specs written and Rob-approved
- [ ] All 6 workflows implemented in Mission Control
- [ ] New customer onboarding: tested end-to-end with real Stripe purchase
- [ ] Support routing: tested across all 4 channels
- [ ] Weekly report running automatically every Monday
- [ ] Competitive alert workflow live (Rowan monitoring NemoClaw + others)
- [ ] Content publishing fully automated (Morgan → publish → social → distribution)
- [ ] Enterprise inquiry detected + Rob notified within 15 minutes of submission

---

## Sprint 4 — Enterprise Readiness + Remaining Agents
**Duration:** Weeks 8–12  
**Theme:** Scale the model. Harden everything. Activate remaining agents.

### Goals
- Volume/seat Stripe products live (Team + Business tiers)
- Invoice billing for enterprise customers
- Status page live
- MSA/DPA complete
- Uma, Hannah, Tommy, Devon, Elena all running automated jobs
- A.L.I.C.E. is enterprise-ready

---

### Sprint 4 Tasks

#### 4.1 Volume/Seat Stripe Products

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.1.1 | Morgan validates pricing with market research | Morgan | M | — | 🔴 Rob: confirm Team $199/5-seats, Business $599/20-seats after Morgan's research |
| 4.1.2 | Morgan: competitive pricing analysis (NemoClaw, CrewAI, AutoGen) | Morgan | M | — |
| 4.1.3 | Create Stripe products: Team ($199/mo, 5 seats) + Business ($599/mo, 20 seats) | Rob + Dylan | S | 4.1.1 confirmed | 🔴 Rob creates Stripe products after Morgan validates |
| 4.1.4 | Seat management: track seat count per customer in Supabase | Dylan + Darius | M | 4.1.3 |
| 4.1.5 | Seat limit enforcement: block >N users on plan | Dylan | M | 4.1.4 |
| 4.1.6 | Upgrade flow: Free → Pro → Team → Business | Felix + Dylan | L | 4.1.3 |
| 4.1.7 | Elena pre-scopes seat management complexity + edge cases | Elena | M | 4.1.1 |

---

#### 4.2 Invoice Billing

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.2.1 | Logan: review invoice requirements for B2B customers (net-30 terms, PO numbers) | Logan | S | — | 🔴 Rob: offer net-30? |
| 4.2.2 | Stripe Invoicing setup: manual invoice creation flow | Dylan | M | 4.2.1 |
| 4.2.3 | Audrey: invoice tracking + AR aging report | Audrey | M | 4.2.2 |
| 4.2.4 | Clara: invoice email templates (invoice issued, due, overdue) | Clara | S | 4.2.2 |
| 4.2.5 | Elena: scope custom billing portal (if Stripe Customer Portal is insufficient) | Elena | M | 4.2.2 | 🔴 Rob: build custom portal or use Stripe hosted? |

---

#### 4.3 Status Page

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.3.1 | Devon: evaluate status page options (Instatus, Statuspage.io, self-hosted) | Devon | S | — | 🔴 Rob: self-host or third party? |
| 4.3.2 | Configure status page with all service components | Devon | S | 4.3.1 |
| 4.3.3 | Automated incident creation when Devon's monitoring detects downtime | Devon | M | 4.3.2 |
| 4.3.4 | Clara: incident communication templates (investigating, identified, resolved) | Clara | S | 4.3.2 |
| 4.3.5 | Link status page from av3.ai + admin.av3.ai footer | Felix | S | 4.3.2 |

---

#### 4.4 Logan — MSA + DPA

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.4.1 | Logan drafts Master Service Agreement (MSA) for enterprise customers | Logan | L | — | 🔴 Rob reviews + legal sign-off |
| 4.4.2 | Logan drafts Data Processing Agreement (DPA) for GDPR/CCPA compliance | Logan | L | — | 🔴 Rob reviews + legal sign-off |
| 4.4.3 | Logan: review existing ToS/Privacy Policy alignment with enterprise requirements | Logan | M | 4.4.1, 4.4.2 |
| 4.4.4 | Daphne: publish MSA + DPA to legal page on av3.ai | Daphne | S | 4.4.1, 4.4.2 |
| 4.4.5 | Logan: NemoClaw compatibility note for enterprise customers (A.L.I.C.E. = app layer above NemoClaw infrastructure) | Logan | S | — |

---

#### 4.5 Uma — Customer Insight Synthesis

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 4.5.1 | Uma: build customer persona library from support tickets + CRM | Uma | M | Sprint 1 Sophie, Sprint 1 Caleb |
| 4.5.2 | Uma monthly: synthesize top 5 customer pain points + feature requests | Uma | M | 4.5.1 |
| 4.5.3 | Uma: route insights to Morgan (messaging), Nadia (UX), Parker (roadmap) | Uma | S | 4.5.2 |
| 4.5.4 | Uma quarterly: "Voice of Customer" report to Olivia | Uma | M | 4.5.2 |
| 4.5.5 | Customer Insights card in Owners Section | Felix | S | 4.5.2 |

---

#### 4.6 Hannah — Agent Roster Management

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.6.1 | Hannah: maintain ROSTER.md as living document (any agent changes, new agents) | Hannah | S | — |
| 4.6.2 | Hannah: define agent onboarding checklist (for when new agents join the roster) | Hannah | S | — | 🔴 Rob: any new agents planned? |
| 4.6.3 | Hannah: quarterly agent effectiveness review (are all 28 agents earning their keep?) | Hannah | M | Agent telemetry from 1.6.x |
| 4.6.4 | Hannah: maintain role boundary documentation (who does what, no overlap) | Hannah | M | ROSTER.md |
| 4.6.5 | Agent Roster section in Owners Section (who's active, last task, effectiveness score) | Felix | M | 4.6.3 |

---

#### 4.7 Tommy — Event Logistics

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.7.1 | Tommy: research Product Hunt launch logistics (optimal day, launch checklist) | Tommy | M | — | 🔴 Rob: target launch date? |
| 4.7.2 | Tommy: build Product Hunt launch day runbook (30-min intervals) | Tommy | M | 4.7.1 |
| 4.7.3 | Tommy: identify relevant 2026 conferences (AI, developer, enterprise) | Tommy | M | — |
| 4.7.4 | Tommy + Morgan: conference content strategy (talks, demos, sponsorships) | Tommy + Morgan | M | 4.7.3 | 🔴 Rob: which conferences to target? budget? |
| 4.7.5 | Tommy: travel planning for any conferences Rob attends | Tommy | S | 4.7.4 |

---

#### 4.8 Devon — Infrastructure Hardening

| # | Task | Owner | Complexity | Dependencies | Rob Decision |
|---|------|-------|-----------|--------------|--------------|
| 4.8.1 | Devon: full infrastructure audit (all services, single points of failure) | Devon | M | — |
| 4.8.2 | Devon: implement auto-scaling for webhook handlers (Stripe, GitHub) | Devon | M | 4.8.1 |
| 4.8.3 | Devon: database backup verification + restore testing | Devon | S | — |
| 4.8.4 | Devon: uptime SLA definition (what's our 99.x% target?) | Devon | S | — | 🔴 Rob: SLA commitment to enterprise customers? |
| 4.8.5 | Selena: enterprise security review (secrets management, access controls, audit logging) | Selena | L | 4.8.1 |
| 4.8.6 | Devon: runbook for all critical failure scenarios | Devon | M | 4.8.1 |

---

#### 4.9 Elena — Pre-Scoping All New Features

| # | Task | Owner | Complexity | Dependencies |
|---|------|-------|-----------|--------------|
| 4.9.1 | Elena: establish scoping template (standard format for all future feature estimates) | Elena | S | — |
| 4.9.2 | Elena: pre-scope seat management edge cases (Sprint 4.1 support) | Elena | M | 4.1.1 |
| 4.9.3 | Elena: pre-scope custom billing portal (Sprint 4.2 support) | Elena | M | 4.2.5 |
| 4.9.4 | Elena: build historical estimation database (track actual vs estimated for calibration) | Elena | M | First 3 sprints complete |
| 4.9.5 | Elena: standing process — any feature >M complexity requires Elena pre-scope before Dylan/Felix start | Elena | S | — |

---

### Sprint 4 Rob Decisions Required 🔴

| Decision | Blocking | Priority |
|----------|----------|----------|
| Confirm Team $199/5-seats + Business $599/20-seats (after Morgan validates) | 4.1.3 | P0 |
| Net-30 invoice terms for enterprise? | 4.2.1 | P1 |
| Status page: self-host vs third party | 4.3.1 | P1 |
| MSA + DPA legal review + sign-off | 4.4.1, 4.4.2 | P1 |
| Product Hunt target launch date | 4.7.1 | P1 |
| Conference targets + travel budget | 4.7.4 | P2 |
| Uptime SLA commitment to enterprise | 4.8.4 | P2 |
| New agents beyond 28? | 4.6.2 | P2 |
| Custom billing portal vs Stripe hosted | 4.2.5 | P2 |

---

### Sprint 4 Definition of Done

- [ ] Team + Business Stripe products live (pricing Morgan-validated)
- [ ] Invoice billing working for at least one enterprise customer
- [ ] Status page live and linked from av3.ai
- [ ] MSA + DPA published and Rob-reviewed
- [ ] Uma producing monthly customer insight reports
- [ ] Hannah's agent roster management process running
- [ ] Tommy's Product Hunt launch runbook ready
- [ ] Devon's infrastructure hardened (no single points of failure)
- [ ] Elena's scoping process established for all future features
- [ ] All 28 agents have at least one automated recurring job with telemetry

---

## Agent Job Descriptions
*What every agent actually does, on a schedule, to run the A.L.I.C.E. business. This is the receipts.*

---

### 🧠 Olivia — Chief Orchestration Officer
**Automated Job:** Weekly Business Review  
**Schedule:** Monday 9am EST  
**What she does:** Collects outputs from Aiden, Morgan, Rowan, Sloane, Clara, Sophie, Darius, Dylan. Synthesizes into a 1-page Weekly Business Review with top 3 Rob decisions needed, top 3 wins, and any blockers or anomalies.  
**Output:** Weekly Business Review document → Owners Section Morning Brief + Telegram to Rob  
**Also:** Routes all ad-hoc agent requests throughout the week. Every multi-agent workflow flows through Olivia.

---

### 💻 Dylan — Senior Full-Stack Software Engineer
**Automated Job:** Issue triage + patch shipping  
**Schedule:** On GitHub webhook (issue created/labeled) + daily sweep  
**What he does:** Monitors GitHub issues labeled `bug`. Triages within 2h (priority, reproduction, root cause). Opens PRs for P0/P1 bugs. Ships hotfixes within scope autonomously. Queues P2+ for Rob review.  
**Output:** GitHub PRs (tagged: auto-triaged-by-alice), triage report to Olivia daily  
**Also:** Implements all workflow integrations for Avery's specs. Owns all webhook handlers.

---

### 🛡️ Selena — Director of Security Engineering
**Automated Job:** Weekly security sweep  
**Schedule:** Sunday 11pm EST  
**What she does:** Runs automated security audit on any PRs merged in the prior week. Checks for exposed secrets, access control regressions, dependency vulnerabilities. Files security issues in GitHub with `security` label.  
**Output:** Weekly security report to Olivia. Critical findings → immediate Telegram to Rob.  
**Also:** Reviews all new Stripe/API integrations before they go live.

---

### 🚀 Devon — Principal DevOps & Infrastructure Engineer
**Automated Job:** Infrastructure health monitoring + incident response  
**Schedule:** Continuous monitoring + daily 6am EST health summary  
**What he does:** Monitors all services (admin.av3.ai, av3.ai, webhook handlers, Supabase). Detects downtime, high latency, error rate spikes. Auto-creates status page incidents. Triggers paging to Rob for P0 incidents.  
**Output:** Daily infra health summary to Owners Section Agent Status Board. Incident reports on events.  
**Also:** Sprint 4 infrastructure hardening. Manages CI/CD pipelines for all deployments.

---

### ✅ Quinn — QA Engineering Lead & Test Automation Architect
**Automated Job:** Pre-release test suite + regression validation  
**Schedule:** On every Dylan/Felix PR opened to main  
**What she does:** Runs automated test suite on PRs. Validates critical user flows (purchase → license delivery, support ticket routing, onboarding workflow). Blocks merge if P0/P1 tests fail. Reports coverage gaps weekly.  
**Output:** PR test reports (pass/fail + coverage delta). Weekly test health report to Olivia.

---

### 🖥️ Felix — Frontend Engineer & UI Implementation Specialist
**Automated Job:** Owners Section module maintenance + UI performance monitoring  
**Schedule:** Weekly performance check (Friday 8am EST)  
**What he does:** Runs Lighthouse audit on admin.av3.ai. Flags any modules with >3s load time or broken data feeds. Patches within 48h.  
**Output:** Weekly UI health report. Hot fixes for broken data visualizations.  
**Also:** Implements all Avery workflow UIs. Primary builder of the Owners Section.

---

### 📝 Daphne — Technical Documentation Manager
**Automated Job:** Documentation freshness audit  
**Schedule:** Every 2 weeks (Friday)  
**What she does:** Compares current codebase (from Dylan's latest PRs) against existing documentation. Flags any docs that are stale or missing. Drafts update PRs for README, API docs, workflow docs.  
**Output:** Docs freshness report to Olivia. Draft PRs for stale content.  
**Also:** Publishes MSA/DPA/ToS updates to av3.ai when Logan finalizes them.

---

### 🔍 Rowan — Research & Intelligence Analyst
**Automated Job:** Competitive intelligence sweep  
**Schedule:** Monday 7am EST  
**What he does:** Monitors NemoClaw changelogs + GitHub activity. Tracks CrewAI, AutoGen, LangGraph releases. Scrapes HN, Reddit (r/selfhosted, r/MachineLearning), Twitter for "AI agent framework" signals. Synthesizes into competitive delta report.  
**Output:** Weekly competitive brief → Olivia → Owners Section + Telegram to Rob if high-severity event detected.  
**Also:** Powers the Competitive Alert workflow (Sprint 3.5).

---

### 📊 Darius — Data Engineer & Analytics Infrastructure Lead
**Automated Job:** Data health monitoring + Supabase integrity checks  
**Schedule:** Daily 6am EST  
**What he does:** Validates all Supabase tables (licenses, CRM, expenses, support queue, agent_runs). Checks for duplicate keys, null required fields, anomalous insert rates. Flags issues to Olivia.  
**Output:** Daily data health report to Owners Section Agent Status Board. Anomaly alerts to Olivia on detection.  
**Also:** Maintains all data pipelines. Builds tables for new features on spec from Dylan/Caleb.

---

### 💬 Sophie — Customer Support Operations Specialist
**Automated Job:** Multi-channel ticket triage + response drafting  
**Schedule:** Continuous (webhook on new ticket) + daily 9am sweep  
**What she does:** Receives tickets from contact form, GitHub issues, Slack, Discord. Classifies each (bug / billing / legal / general). Routes appropriately. Drafts responses for general inquiries. Flags urgent tickets with <2h SLA.  
**Output:** Daily ticket digest to Owners Section Support Queue. Draft responses queued for Rob approval.  
**Also:** Powers Support Ticket Routing workflow (Sprint 3.3). Feeds enterprise detection for Sprint 3.7.

---

### 👥 Hannah — Head of People Operations & HR Strategy
**Automated Job:** Agent roster maintenance + effectiveness review  
**Schedule:** Monthly (first Monday)  
**What she does:** Reviews agent_runs telemetry for all 28 agents. Identifies any agent that hasn't run a job in >7 days past schedule. Flags inactive agents. Maintains ROSTER.md as living document with any role/scope changes.  
**Output:** Monthly agent effectiveness summary to Olivia + Owners Section. ROSTER.md PR when changes needed.

---

### 📈 Aiden — Senior Business Analytics & Insights Manager
**Automated Job:** Weekly metrics pull + Business Review contribution  
**Schedule:** Monday 7am EST  
**What he does:** Pulls Stripe MRR/ARR/new customers/churn. Pulls GitHub stars/forks/traffic. Pulls npm download stats. Pulls Supabase waitlist + conversion rate. Computes week-over-week deltas. Generates revenue dashboard data for Owners Section.  
**Output:** Weekly metrics summary → Owners Section Revenue module + Olivia's Weekly Business Review  
**Also:** Powers Aiden's analytics for campaign performance, cohort analysis, retention reporting.

---

### ✉️ Clara — Corporate Communications & Content Strategy Director
**Automated Job:** Customer email sequences + announcement drafting  
**Schedule:** Event-triggered (purchase webhook, release webhook) + weekly review  
**What she does:** Sends automated welcome email sequence (3 emails post-purchase). Manages waitlist nurture sequence. Drafts release announcement emails when Dylan merges to main. Reviews Morgan's content for brand voice weekly.  
**Output:** Email sequences sent (Resend), open rate report to Olivia weekly. Brand voice flags on content.  
**Also:** Drafts enterprise inquiry responses, incident communications, MSA cover letters.

---

### ⚙️ Avery — Workflow Automation & Process Engineering Lead
**Automated Job:** Workflow health monitoring + improvement proposals  
**Schedule:** Weekly (Thursday)  
**What she does:** Reviews all 6 Mission Control workflows for failure rates, step latency, and completion success. Identifies any workflow with >5% failure rate. Proposes fixes. Identifies new automation opportunities from Sophie's recurring ticket patterns.  
**Output:** Weekly workflow health report to Olivia. Improvement proposals when failure threshold hit.  
**Also:** Primary spec writer for all new business workflows.

---

### 🔧 Owen — Director of Business Operations & Process Efficiency
**Automated Job:** Operational bottleneck audit  
**Schedule:** Monthly (second Monday)  
**What he does:** Reviews all cross-agent handoffs from the prior month. Identifies any step that required manual Rob intervention that shouldn't. Proposes automation for any recurring manual step. Tracks vendor/tool costs against budget.  
**Output:** Monthly ops efficiency report to Olivia. Vendor cost summary to Audrey.

---

### 🔗 Isaac — Systems Integration & API Connectivity Engineer
**Automated Job:** Integration health monitoring  
**Schedule:** Daily 7am EST  
**What he does:** Pings all integrations (Stripe webhook, GitHub webhook, Slack bot, Discord bot, Resend). Validates authentication tokens haven't expired. Tests round-trip on non-production endpoints. Alerts Devon if any integration is failing.  
**Output:** Daily integration health report to Owners Section Agent Status Board. Alerts to Devon on failures.  
**Also:** Implements all new integrations on Avery's spec.

---

### ✈️ Tommy — Travel Logistics & Executive Travel Coordinator
**Automated Job:** Conference radar + Product Hunt prep  
**Schedule:** Monthly (third Monday)  
**What he does:** Scans upcoming AI/developer/enterprise conference calendar (6-month horizon). Surfaces relevant events to Rob with attendance recommendation, deadlines, and estimated costs. Maintains Product Hunt launch readiness checklist.  
**Output:** Monthly event radar report to Olivia + Rob. Product Hunt readiness status (countdown + checklist).

---

### 💰 Sloane — Sales Strategy & Revenue Development Manager
**Automated Job:** Lead identification + pipeline management  
**Schedule:** Daily 8am EST  
**What she does:** Monitors GitHub for new stars, forks, issues from non-customers. Identifies power users on free tier (>3 issues filed, >1 discussion thread). Runs signal scoring. Passes hot leads to Alex for enrichment. Drafts personalized outreach for Rob approval.  
**Output:** Daily lead signal report to Owners Section CRM pipeline view. Outreach drafts queued for Rob.

---

### 🎨 Nadia — UX/UI Design Lead & Visual Systems Architect
**Automated Job:** Design system maintenance + new feature design  
**Schedule:** On-demand (triggered by new feature spec from Avery/Elena) + monthly design audit  
**What she does:** Reviews admin.av3.ai and av3.ai monthly for UI consistency against design system. Flags regressions. Designs new UI components for each sprint's features before Felix builds.  
**Output:** Monthly design audit report. Design specs/mockups for all new features before implementation begins.

---

### 📣 Morgan — Digital Marketing & Growth Strategy Manager
**Automated Job:** Content publishing + social distribution  
**Schedule:** Monday 8pm EST (blog) + Wednesday 8am EST (social) + Friday (performance review)  
**What she does:** Generates weekly blog post on Tuesday (researches → writes → publishes via content workflow). Schedules 3–5 social posts (Twitter/X, LinkedIn). Posts weekly Reddit contribution. Reviews prior week's content performance.  
**Output:** 1 blog post/week (published). 3–5 social posts/week. Weekly content performance report to Olivia.  
**Also:** Validates Team/Business pricing in Sprint 4. Runs all marketing campaigns.

---

### 🕷️ Alex — API Integration & Web Data Extraction Engineer
**Automated Job:** Lead enrichment pipeline  
**Schedule:** Daily (triggered by Sloane's signal list)  
**What he does:** Takes Sloane's identified leads (GitHub users, star gazers, issue filers). Enriches profiles using public signals (GitHub profile, company in bio, linked website, LinkedIn via public data). Adds enriched data to Caleb's CRM.  
**Output:** Enriched lead records in CRM daily. Enrichment coverage report weekly to Sloane.

---

### 🧪 Uma — UX Research Lead & User Insights Strategist
**Automated Job:** Customer insight synthesis  
**Schedule:** Monthly (last Friday)  
**What she does:** Analyzes Sophie's support ticket history from prior month. Reviews Caleb's CRM for customer lifecycle notes. Synthesizes top 5 pain points, top 5 feature requests, and top 3 churn signals. Routes findings to Morgan (messaging), Nadia (UX), Parker (roadmap).  
**Output:** Monthly Voice of Customer report → Owners Section Customer Insights card + Olivia.

---

### 🏗️ Caleb — CRM Administrator & Customer Lifecycle Manager
**Automated Job:** CRM hygiene + lifecycle stage updates  
**Schedule:** Daily (event-driven from Stripe webhooks) + weekly Friday review  
**What he does:** Auto-creates contacts on purchase (from Stripe webhook). Updates deal stages based on lifecycle events (active, churned, enterprise prospect). Deduplicates contacts weekly. Flags stale contacts (no activity >60 days) to Sloane.  
**Output:** CRM Owners Section view (always current). Weekly CRM health report to Olivia. Stale contact list to Sloane.

---

### 📐 Elena — Project Estimation & Technical Scoping Analyst
**Automated Job:** Pre-scoping all new features  
**Schedule:** On-demand (triggered when any feature is approved for Sprint backlog)  
**What she does:** Receives feature description from Parker. Produces scoped task breakdown with time estimates (S/M/L), dependencies, risk flags, and "what's not included" clarity. Maintains estimation database to calibrate accuracy over time.  
**Output:** Scoping document per feature → Parker's sprint backlog. Monthly estimation accuracy report (actual vs estimated).

---

### 💹 Audrey — Controller & Financial Operations Manager
**Automated Job:** Weekly expense reconciliation + monthly P&L  
**Schedule:** Weekly (Friday) + Monthly close (last business day)  
**What she does:** Reconciles all Stripe fees, API costs, tool subscriptions against expense categories. Computes gross margin weekly. Produces full P&L monthly. Tracks accounts receivable (invoice billing Sprint 4). Flags any cost overrun to Rob.  
**Output:** Weekly P&L summary to Owners Section Revenue module. Monthly close package to Olivia + Rob.

---

### ⚖️ Logan — General Counsel & Legal Risk Advisor
**Automated Job:** Legal queue monitoring + compliance sweep  
**Schedule:** Weekly (Monday) + on-demand (triggered by enterprise inquiry or flagged ticket)  
**What he does:** Reviews support tickets for legal/compliance flags (data requests, GDPR queries, contract asks). Maintains legal queue. Reviews any enterprise inquiry for NDA/contract requirements. Keeps ToS/Privacy Policy current.  
**Output:** Weekly legal queue report to Owners Section. Compliance alerts to Olivia when triggered.

---

### 📋 Eva — Executive Assistant & Chief of Staff Operations
**Automated Job:** Morning brief synthesis + decision tracking  
**Schedule:** Daily 7:30am EST ✅ (already running)  
**What she does:** Pulls overnight activity (new support tickets, new GitHub issues, any agent alerts, Stripe events). Synthesizes into a crisp Morning Brief (what happened, what needs Rob's attention today, what can wait). Posts to Owners Section Morning Brief module.  
**Output:** Daily Morning Brief → Owners Section + Telegram to Rob. Tracks any open decisions Rob hasn't actioned in >48h.

---

### 📊 Parker — Senior Project Manager & Delivery Lead
**Automated Job:** Sprint health monitoring + blockers sweep  
**Schedule:** Daily (automated) + Weekly sprint review (Friday 4pm EST)  
**What she does:** Monitors task completion across all sprints. Flags any task overdue by >2 days. Identifies blockers (missing Rob decisions, agent dependencies not met). Maintains this BUSINESS-OS-PLAN.md as living document. Runs weekly sprint retrospective.  
**Output:** Daily blocker report to Olivia. Weekly sprint health summary to Owners Section + Rob. Updated plan on every sprint boundary.

---

## Master Timeline

```
Week 1–2:   Sprint 1 — Foundation (admin.av3.ai, SSO, Caleb CRM, Sophie multi-channel)
Week 3–4:   Sprint 2 — Revenue + Sales (Aiden dashboard, Audrey P&L, Sloane pipeline, Isaac bots)
Week 5–7:   Sprint 3 — Avery's Workflows (6 workflows designed + built in Mission Control)
Week 8–12:  Sprint 4 — Enterprise Readiness (volume pricing, MSA, Uma/Hannah/Tommy/Devon/Elena)
```

---

## Rob's Master Decision Queue

All 🔴 items across all sprints, consolidated:

| # | Decision | Sprint | Priority |
|---|----------|--------|----------|
| 1 | DNS configuration for admin.av3.ai | S1 | P0 |
| 2 | Auth provider: Clerk vs Auth.js | S1 | P0 |
| 3 | Stripe restricted key (read-only for Aiden) | S2 | P0 |
| 4 | CRM scope (contacts + deals only, or full pipeline?) | S1 | P1 |
| 5 | Slack workspace + support channel for Sophie | S1 | P1 |
| 6 | Discord server + bot creation | S1 | P1 |
| 7 | Expense categories approval | S2 | P1 |
| 8 | Logan's authority: flag-only vs draft changes | S2 | P1 |
| 9 | All outreach drafted by Sloane — Rob sends or doesn't | S2 | P1 |
| 10 | Slack app creation approval | S2 | P1 |
| 11 | Discord bot permissions scope | S2 | P1 |
| 12 | Blog CMS choice (Ghost / MDX files / Contentful) | S3 | P0 |
| 13 | Approve each Avery workflow spec before build | S3 | P1 |
| 14 | Enterprise notification threshold | S3 | P1 |
| 15 | Confirm Team $199/5-seats + Business $599/20-seats (post-Morgan research) | S4 | P0 |
| 16 | Net-30 invoice terms for enterprise? | S4 | P1 |
| 17 | Status page: self-host vs third party | S4 | P1 |
| 18 | MSA + DPA legal review + sign-off | S4 | P1 |
| 19 | Product Hunt target launch date | S4 | P1 |
| 20 | Conference targets + travel budget | S4 | P2 |
| 21 | Uptime SLA commitment to enterprise | S4 | P2 |
| 22 | New agents beyond 28? | S4 | P2 |
| 23 | Clearbit enrichment (paid API) or manual only? | S1 | P2 |
| 24 | Custom billing portal vs Stripe hosted | S4 | P2 |

---

## Success Criteria — "We Run A.L.I.C.E. Using A.L.I.C.E."

By Sprint 4 completion, every item below must be true with agent-generated evidence:

| Metric | Target | Agent with Receipts |
|--------|--------|---------------------|
| Morning brief delivered daily | 7 days/week, no gaps | Eva — telemetry log |
| Blog posts published | 1/week, agent-written | Morgan — published URLs |
| Social posts live | 3–5/week | Morgan — post IDs |
| New purchase → license delivered | < 5 minutes | Dylan — timestamp log |
| Support tickets triaged | Same day, all channels | Sophie — queue report |
| CRM contacts auto-created | On every purchase | Caleb — CRM records |
| Revenue tracked | Real-time Stripe data | Aiden — dashboard |
| Weekly metrics report | Every Monday | Aiden — report archive |
| Competitive intel | Every Monday | Rowan — brief archive |
| P&L current | Within 48h always | Audrey — reconciliation |
| Legal queue reviewed | Every Monday | Logan — queue log |
| Infrastructure health | 99.9% uptime target | Devon — uptime log |
| Rob's weekly operational time | < 2 hours | Parker — decision log |
| Enterprise inquiries routed | < 15 min from submission | Olivia — routing log |

---

*A.L.I.C.E. Business Operating System Plan — authored by Parker*  
*Last updated: 2026-03-17*  
*Next review: Sprint 1 completion*
