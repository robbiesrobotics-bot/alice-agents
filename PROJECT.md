# A.L.I.C.E. Self-Sustaining Business — Project Plan

**Owner:** Rob (decisions) + Olivia (execution coordination)  
**Created:** 2026-03-17  
**Horizon:** 8 weeks  
**Status:** Planning

---

## 1. Project Overview

### What We're Building

A.L.I.C.E. (Autonomous Local Intelligence for Coordinated Execution) will operate itself as a real business — using the same agent team that is the product to run marketing, sales, support, feature shipping, and analytics. This is simultaneously:

1. **A real business** — generating revenue via Pro licenses and cloud subscriptions
2. **A proof of concept** — the strongest possible demo of what A.L.I.C.E. can do

The business model is simple:
- **Pro License:** $49 one-time (unlimited installs, license key required)
- **Cloud Add-on:** $20/mo (Supabase sync + hosted Mission Control — requires active Pro license, activate when infrastructure is ready)

### Why This Works as a PoC

When a prospect asks "what can A.L.I.C.E. actually do?" the answer is: *it runs this entire company.* Morgan wrote the blog post you found. Dylan shipped the feature you requested. Clara sent you this email. That's the pitch — and it's true.

### Success Metrics — What "Self-Sustaining" Looks Like

By Week 8, the following must be true **without Rob manually doing them**:

| Metric | Target |
|--------|--------|
| Weekly blog posts published | 1/week (Morgan, cron'd) |
| Weekly social posts live | 3–5/week (Morgan) |
| Waitlist nurture emails sent | Automated sequence (Clara) |
| New purchase → license delivered | < 5 minutes (automated) |
| GitHub bugs triaged + PRs opened | Within 48h (Dylan) |
| Weekly metrics report to Olivia | Every Monday (Aiden) |
| Competitive intel report | Every Monday (Rowan) |
| Support drafts ready for Rob approval | Same day (Sophie) |
| Revenue | ≥ 10 Pro licenses sold by Week 8 |
| Rob's weekly time on operations | < 2 hours (approvals + decisions only) |

---

## 2. Phase 1 — Foundation (Week 1–2)

**Goal:** Everything that must exist before agents can operate. No automation runs on a broken foundation.

**Blocker:** All items in this phase require Rob decisions or credentials before the team can execute.

### 2.1 Pricing & Business Model

| Task | Owner | Rob Decision Required? | Done When |
|------|-------|----------------------|-----------|
| Finalize pricing page copy ($49 Pro, $20/mo cloud) | Parker + Morgan | ✅ Confirmed ✓ | Live on site |
| Update README and docs with new pricing | Dylan | No | PR merged |
| Draft "why one-time?" FAQ entry | Morgan | No | Written + published |

**Blocker:** Rob must confirm: Is cloud add-on live at launch or waitlisted?

### 2.2 Payment Processing

| Task | Owner | Rob Decision Required? | Done When |
|------|-------|----------------------|-----------|
| Stripe account configured (products, prices) | Rob | ✅ Rob must set up Stripe | Products live in Stripe |
| One-time product: "A.L.I.C.E. Pro" ($49) | Rob | ✅ | Price ID confirmed |
| Subscription product: "Cloud Add-on" ($20/mo, requires Pro) | Rob | ✅ | Price ID confirmed |
| Stripe webhook endpoint configured | Dylan | Needs Stripe keys | Webhook receiving events |
| Payment link or checkout page live | Dylan | Needs design decision | Page live, accepts payment |

**Blocker:** Stripe setup is Rob-only. Dylan can build the webhook handler in parallel if given test keys.

### 2.3 License Key Generation & Delivery

| Task | Owner | Rob Decision Required? | Done When |
|------|-------|----------------------|-----------|
| License key API (generate UUID-based key on purchase) | Dylan | No | API endpoint live |
| Stripe webhook → license generation trigger | Dylan | No | End-to-end tested |
| Resend email integration (send key to customer) | Dylan + Clara | ✅ Resend API key | Email delivered in < 5 min |
| License key stored in DB (Supabase or simple) | Darius | ✅ DB choice | Key queryable |

**Blocker:** Need decision on license DB — Supabase (already in stack) is the obvious choice.

### 2.4 Waitlist → Customer Conversion

| Task | Owner | Rob Decision Required? | Done When |
|------|-------|----------------------|-----------|
| Export current waitlist from Supabase | Darius | No | CSV in hand |
| Draft waitlist conversion email sequence (3 emails) | Clara | No | Copy written |
| Load sequence into Resend | Clara | Needs Resend access | Sequence queued |
| Send first conversion email to waitlist | Clara + Rob | ✅ Rob approves send | Sent, opens tracked |

**Blocker:** Clara needs Resend access. First send needs Rob approval.

### 2.5 GitHub Repo Polish

| Task | Owner | Rob Decision Required? | Done When |
|------|-------|----------------------|-----------|
| README rewrite (clear value prop, install, pricing) | Dylan + Morgan | No | PR merged |
| CONTRIBUTING.md created | Dylan | No | File exists |
| LICENSE file confirmed (MIT or commercial?) | Rob | ✅ License decision | File committed |
| Issue templates (bug, feature request) | Dylan | No | Templates live |
| GitHub Discussions enabled | Rob | ✅ | Enabled |

**Blocker:** Rob must decide on license type before repo polish is "done."

---

## 3. Phase 2 — Agent-Driven Operations (Week 3–4)

**Goal:** Each agent has a defined automated weekly task, a cron or trigger, and reports to Olivia.

### 3.1 Morgan — Marketing

**Function:** Top-of-funnel awareness  
**Automated Tasks:**
- Blog post published every Tuesday (already cron'd — verify it's working)
- 3–5 social posts/week (Twitter/X + LinkedIn)
- One Reddit post/week in relevant communities (r/selfhosted, r/MachineLearning, r/SideProject)
- Product Hunt launch prep (one-time, Week 4 target)

**Trigger:** Weekly cron (Monday night → Tuesday publish)  
**Reports to Olivia:** Post performance, top-performing content, recommendations  
**Needs Rob:** Product Hunt requires manual account + Rob to be present for launch day  

### 3.2 Rowan — Competitive Research

**Function:** Market intelligence  
**Automated Tasks:**
- Monitor NemoClaw release notes, changelog, GitHub stars weekly
- Monitor OpenClaw releases
- Track "AI agent framework" keywords on HN, Reddit, Twitter
- Summarize competitive moves in weekly report

**Trigger:** Monday morning cron  
**Reports to Olivia:** Competitive delta, threats, positioning opportunities  
**Needs Rob:** No regular approval needed — pure intelligence gathering

### 3.3 Clara — Customer Communications

**Function:** Relationship and retention  
**Automated Tasks:**
- Welcome email sequence (3 emails, triggered on purchase)
- Waitlist nurture sequence (2 emails/week until converted)
- Product update announcements (triggered by Dylan shipping a release)
- Monthly "what's new" digest

**Trigger:** Purchase webhook (welcome), cron (nurture), release webhook (updates)  
**Reports to Olivia:** Open rates, reply threads needing human response  
**Needs Rob:** Rob approves any batch email before first send to waitlist

### 3.4 Sloane — Sales

**Function:** Conversion and expansion  
**Automated Tasks:**
- Monitor GitHub stars (spikes = interest signal)
- Monitor issues from users who haven't converted to Pro
- Identify "upgrade opportunity" signals (power users on free tier)
- Draft personalized outreach for Rob to approve and send

**Trigger:** Daily GitHub monitor + weekly summary  
**Reports to Olivia:** Conversion pipeline, hot leads, outreach queue  
**Needs Rob:** All outreach requires Rob approval before sending

### 3.5 Aiden — Analytics

**Function:** Business intelligence  
**Automated Tasks:**
- Pull npm download stats weekly
- Pull GitHub stars/forks/traffic
- Pull Supabase waitlist signups
- Pull Stripe MRR/revenue
- Compile into Mission Control dashboard + weekly summary

**Trigger:** Monday morning cron (report ready by 9am EST)  
**Reports to Olivia:** Full metrics summary + week-over-week delta  
**Needs Rob:** Dashboard URL decision (where does Mission Control live?)

### 3.6 Dylan — Feature Shipping

**Function:** Product development  
**Automated Tasks:**
- Monitor GitHub issues labeled `bug` or `enhancement` daily
- Triage: assign priority, reproduce bugs, draft fix plan
- Open PRs for bugs with clear reproduction
- Ship patches for P0/P1 bugs without approval (within defined scope)

**Trigger:** GitHub webhook on issue creation/label  
**Reports to Olivia:** Issues triaged, PRs opened, blockers  
**Needs Rob:** PRs require Rob merge approval; new features need spec sign-off

### 3.7 Darius — Data

**Function:** Data stewardship and monitoring  
**Automated Tasks:**
- Monitor Supabase waitlist table for anomalies (spam signups, conversion rate drops)
- Track license key issuance (ensure no duplicate or invalid keys)
- Flag data quality issues to Olivia
- Maintain backup schedule for critical tables

**Trigger:** Daily check + weekly report  
**Reports to Olivia:** Data health, anomalies, waitlist trends  
**Needs Rob:** Any data deletion or migration requires Rob sign-off

### 3.8 Sophie — Support

**Function:** Customer satisfaction  
**Automated Tasks:**
- Monitor contact form submissions (daily)
- Classify: bug report → route to Dylan, billing → route to Sloane, general → draft response
- Draft responses using context from docs + prior tickets
- Queue drafts for Rob review

**Trigger:** Contact form webhook  
**Reports to Olivia:** Ticket volume, common issues, resolution rate  
**Needs Rob:** All external responses need Rob approval before sending

---

## 4. Phase 3 — Revenue Infrastructure (Week 5–6)

**Goal:** Payment flows are bulletproof, license system is production-ready.

### 4.1 Stripe Integration (Full)

| Component | Owner | Notes |
|-----------|-------|-------|
| Webhook handler (checkout.session.completed) | Dylan | Triggers license gen + Clara welcome email |
| Webhook handler (invoice.payment_failed) | Dylan | Triggers Clara dunning email |
| Webhook handler (customer.subscription.deleted) | Dylan | Disables cloud access |
| Stripe Customer Portal link | Dylan | For self-serve billing management |
| Test coverage (happy path + failure) | Dylan | Required before go-live |

### 4.2 License Key System

| Component | Owner | Notes |
|-----------|-------|-------|
| Key generation: UUID v4, stored in Supabase | Dylan + Darius | Format: ALICE-XXXX-XXXX-XXXX |
| Key validation API endpoint | Dylan | `GET /api/validate-license?key=...` |
| Installer license check | Dylan | CLI prompts for key on first run |
| Key tied to email (not hardware) | Dylan | Allows reinstalls |
| Revocation endpoint | Dylan + Darius | For refunds |

### 4.3 Pro Tier Gate

| Component | Owner | Notes |
|-----------|-------|-------|
| Installer detects Pro vs Free | Dylan | Check `~/.alice/license` |
| Pro features list finalized | Rob | ✅ Rob must define what's gated |
| Grace period for key entry (7 days) | Dylan | Don't break new installs |
| Upgrade prompt in CLI | Dylan | Point to payment page |

**Blocker:** Rob must define which features are Pro-only before Dylan can implement the gate.

### 4.4 Cloud Add-on

| Component | Owner | Notes |
|-----------|-------|-------|
| Supabase sync architecture defined | Rob + Dylan | ✅ Design decision needed |
| Subscription triggers cloud provisioning | Dylan | On `invoice.paid` event |
| Cloud add-on requires active Pro license | Dylan | Validation logic |
| Launch timing | Rob | ✅ Launch with v1 or waitlist it? |

**Recommendation:** Waitlist the cloud add-on at launch. Collect intent, ship when ready. Avoids support debt.

### 4.5 Customer Portal

| Component | Owner | Notes |
|-----------|-------|-------|
| Stripe Customer Portal (hosted) | Dylan | Fastest path — Stripe handles this |
| Link from license email | Clara | "Manage your subscription" CTA |
| Custom portal page (optional) | Dylan | Only if Stripe portal insufficient |

---

## 5. Phase 4 — Self-Improvement Loop (Week 7–8)

**Goal:** Agents don't just execute — they observe, propose, and improve.

### 5.1 Metric-Driven Agent Feedback

Each agent now reviews their own performance metrics and proposes changes:

| Agent | Self-Review Task | Proposes To |
|-------|-----------------|-------------|
| Morgan | Which content drove signups? Double down. | Olivia |
| Rowan | What competitive moves should change our roadmap? | Olivia → Rob |
| Clara | Which emails have low open rates? Rewrite. | Olivia |
| Sloane | Which outreach patterns convert? | Olivia |
| Aiden | What metrics are we not tracking that we should be? | Olivia |
| Dylan | What bugs keep coming back? Structural fix needed? | Olivia → Rob |

### 5.2 Dylan — Automated Improvement Shipping

- Dylan monitors user feedback in GitHub issues + support tickets (via Sophie)
- Identifies patterns: same request from 3+ users = ship it
- Small improvements (docs, UX copy, minor features) shipped without approval
- Larger features: spec to Olivia → Rob decision

**Gate:** Dylan operates within a defined "safe to ship" scope. Anything outside requires sign-off.

### 5.3 Morgan — Trend-Based Content

- Morgan monitors HN, Reddit, and competitor content weekly
- Identifies trending topics in the ecosystem
- Adjusts content calendar to capture search/social momentum
- Reports content plan to Olivia weekly (Rob can veto topics)

### 5.4 Weekly Business Review (Cron)

Every Monday at 9am EST, Olivia runs:

1. Collect reports from all agents (Aiden, Morgan, Rowan, Sloane, Clara, Sophie, Darius, Dylan)
2. Synthesize into "Weekly Business Review" document
3. Surface top 3 decisions Rob needs to make
4. Surface top 3 wins from the week
5. Flag any blockers or anomalies

**Deliverable:** Weekly Business Review posted to Rob's preferred channel (Telegram / file) by 10am Monday.

---

## 6. Agent Ownership Map

| Agent | Business Function | Weekly Automated Task | Reports to Olivia |
|-------|-----------------|----------------------|------------------|
| **Morgan** | Marketing | Blog post + social posts + Reddit | Content performance, content calendar |
| **Rowan** | Competitive Intel | Competitor monitoring + delta report | Competitive threats, positioning notes |
| **Clara** | Customer Comms | Email sequences + announcements | Open rates, reply threads |
| **Sloane** | Sales | GitHub monitoring + outreach drafts | Pipeline, hot leads, conversion rate |
| **Aiden** | Analytics | Full metrics pull + Mission Control | Weekly metrics summary, anomalies |
| **Dylan** | Feature Shipping | Issue triage + PRs + patches | Issues shipped, blockers, PR queue |
| **Darius** | Data | Supabase monitoring + data health | Data anomalies, waitlist trends |
| **Sophie** | Support | Ticket classification + draft responses | Ticket volume, common issues |
| **Olivia** | Orchestration | Weekly Business Review synthesis | (reports to Rob directly) |
| **Parker** | Project Management | Phase tracking, milestone monitoring | Project health, phase blockers |

---

## 7. Technical Dependencies

### 7.1 Stripe + License API

```
stripe-webhook-handler/
  POST /webhooks/stripe
    → checkout.session.completed → generate license → send via Clara/Resend
    → invoice.payment_failed → trigger Clara dunning sequence
    → customer.subscription.deleted → revoke cloud access

license-api/
  POST /licenses/generate   (internal, called by webhook)
  GET  /licenses/validate   (called by installer)
  POST /licenses/revoke     (internal, Rob-only)
```

**Infrastructure:** Vercel Functions or existing Node server  
**DB:** Supabase `licenses` table  
**Owner:** Dylan  
**Needs:** Stripe secret key, Supabase service key  

### 7.2 GitHub Webhook → Dylan Task Queue

```
github-webhook-handler/
  POST /webhooks/github
    → issues.labeled(bug) → add to Dylan's triage queue
    → issues.labeled(enhancement) → add to Dylan's review queue
    → pull_request.merged → trigger Clara update announcement
```

**Infrastructure:** Same webhook server  
**Owner:** Dylan  
**Needs:** GitHub webhook secret, write access to repo  

### 7.3 Resend Email Sequences

**Sequences to build:**
1. **Welcome sequence** (3 emails): Triggered by purchase
   - Email 1 (immediate): License key + getting started
   - Email 2 (Day 3): Tips + feature highlights
   - Email 3 (Day 7): "How's it going?" + community invite

2. **Waitlist nurture** (3 emails): Triggered by signup
   - Email 1 (immediate): "You're on the list" + what's coming
   - Email 2 (Day 5): Social proof + feature preview
   - Email 3 (Day 14): "Launching soon" + early access offer

3. **Dunning sequence** (2 emails): Triggered by payment failure
   - Email 1 (immediate): "Payment failed" + update card link
   - Email 2 (Day 3): Final notice

**Owner:** Clara (copy) + Dylan (Resend integration)  
**Needs:** Resend API key, domain DNS configured for email  

### 7.4 Aiden Analytics Dashboard (Mission Control)

**Data sources:**
- npm: `npm info @alice/cli` (downloads)
- GitHub API: stars, forks, traffic, issues
- Supabase: waitlist count, conversion rate
- Stripe API: MRR, new customers, churn

**Output:** Markdown report + (optional) simple HTML dashboard  
**Delivery:** Posted to Olivia weekly, stored in `workspace-aiden/reports/`  
**Owner:** Aiden  
**Needs:** GitHub token, Stripe restricted key (read-only), Supabase read access  

### 7.5 Cron Jobs — Agent Automation Schedule

| Agent | Schedule | Task |
|-------|----------|------|
| Morgan | Monday 8pm EST | Generate + schedule blog post for Tuesday |
| Morgan | Wednesday 8am EST | Social posts for the week |
| Rowan | Monday 7am EST | Competitive research pull |
| Aiden | Monday 7am EST | Metrics pull + report |
| Olivia | Monday 9am EST | Weekly Business Review synthesis |
| Darius | Daily 6am EST | Supabase data health check |
| Sophie | Daily 9am EST | Contact form ticket check |
| Dylan | On GitHub webhook | Issue triage |
| Sloane | Daily 8am EST | GitHub signal monitoring |

**Infrastructure:** OpenClaw cron system (existing)  
**Owner:** Parker coordinates, Dylan implements  

---

## 8. Definition of Done

**"Self-sustaining" is achieved when all of the following are true on Week 8:**

### Revenue
- [ ] Stripe is live and accepting payments
- [ ] At least 10 Pro licenses sold ($490 revenue)
- [ ] License delivery is fully automated (< 5 min from purchase)
- [ ] Zero manual payment processing by Rob

### Marketing
- [ ] Morgan has published 4+ blog posts without Rob writing anything
- [ ] 3+ social posts/week publishing automatically
- [ ] Product Hunt launched (even if not #1)
- [ ] Waitlist conversion campaign sent

### Operations
- [ ] Weekly Business Review delivered to Rob every Monday
- [ ] All 8 agents have run their automated tasks at least twice
- [ ] Rob's operational time < 2 hours/week
- [ ] Support tickets being triaged and drafted same day

### Product
- [ ] GitHub issues being triaged within 48h
- [ ] At least 1 Dylan-shipped bug fix that Rob didn't initiate
- [ ] License gate live in installer

### Infrastructure
- [ ] All webhooks tested and monitored
- [ ] Cron jobs running reliably (Aiden tracking uptime)
- [ ] No single point of failure that requires Rob to fix manually

---

## Rob's Decision Queue

These require Rob's explicit input before work can proceed:

| Decision | Blocking | Priority |
|----------|----------|----------|
| License type (MIT vs commercial) | GitHub polish, legal clarity | 🔴 P0 |
| Which features are Pro-gated | Dylan can't build the gate | 🔴 P0 |
| Stripe setup (account, products) | All payment work | 🔴 P0 |
| Cloud add-on: launch with v1 or waitlist? | Clara's messaging | 🟡 P1 |
| Resend domain + API key | Clara's email sequences | 🟡 P1 |
| Supabase DB for licenses (use existing?) | Dylan's license API | 🟡 P1 |
| GitHub Discussions enabled? | Community building | 🟢 P2 |
| Mission Control dashboard: where does it live? | Aiden's output format | 🟢 P2 |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Stripe setup delayed → no revenue | Medium | High | Rob prioritizes this in Week 1 |
| License DB gets corrupted | Low | High | Darius monitors + Supabase backups |
| Agent crons fail silently | Medium | Medium | Aiden monitors all cron health |
| Dylan ships breaking change | Low | High | All Dylan PRs require Rob merge |
| Email sequences marked spam | Medium | Medium | Proper SPF/DKIM setup before sending |
| Waitlist is smaller than expected | Low | Medium | Rowan surfaces competitive channels |

---

*Last updated: 2026-03-17 | Owner: Parker*
