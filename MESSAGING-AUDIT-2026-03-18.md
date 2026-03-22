# A.L.I.C.E. Messaging Audit — 2026-03-18

**Auditor:** Morgan (Marketing specialist)  
**Scope:** getalice.av3.ai (landing), alice.av3.ai (Mission Control), admin.av3.ai (Admin portal)  
**Sources reviewed:** Hero.tsx, pricing/page.tsx, README.md, live site (https://getalice.av3.ai)

---

## TL;DR

The bones are good. The hero headline lands. The pricing structure is smart. But three things are quietly killing credibility: (1) the npm package name `@robbiesrobotics/alice-agents`, (2) a FAQ answer that directly contradicts the README on API key requirements, and (3) zero social proof beyond "28 specialists, 1 command." Fix those and this goes from "promising side project" to "serious product."

---

## 1. Clarity of Value Prop — Score: **7/10**

**What works:** A developer landing on the homepage immediately gets the "28 AI agents, one command" pitch. The terminal animation presumably reinforces it. The "Stop duct-taping prompts together. Get an organization." line is excellent — specific, resonant, and scratches a real pain.

**What doesn't:** The site assumes the visitor knows what OpenClaw or NemoClaw is. For a developer who arrived via npm, a tweet, or a search, "Runs on OpenClaw and NemoClaw" is a dead-end. There's no one-sentence explanation of the runtime requirement. The full product story only clicks once you read the README — it shouldn't require a README.

**The hidden blocker:** `npx @robbiesrobotics/alice-agents`. That package name is the single biggest credibility gap on the entire site. A developer's first instinct will be "who is robbiesrobotics?" A brand-owned namespace (`@alice-agents/cli`, `@getaliice/install`, etc.) signals this is a product, not a personal project.

**Suggested fix for the sub-headline:**
> Current: "drops 28 specialized AI agents onto your machine — each with a name, a job, and the expertise to actually do it."
> 
> Better: "deploys 28 specialized AI agents — each with a name, a role, and domain-specific expertise. Olivia orchestrates. You get results."

---

## 2. Messaging Consistency — **Fragmented in one critical place**

**Passes:** Landing → Pricing → CTA buttons are coherent. "Start free. Buy once. Add cloud when you need it." is a clean 3-step mental model.

**Critical inconsistency — API key requirement:**

The README says clearly:  
> *"There's no required API key — just use what you've got."*  
> *"works with whatever model you already have configured in OpenClaw/NemoClaw"*

The live site FAQ says:  
> *"Yes, you'll need at least one LLM API key (OpenAI, Anthropic, or compatible). The Starter plan works with a single key."*

These are contradictory. The README is probably the accurate one (it uses existing runtime config). The FAQ answer appears to be leftover boilerplate. A developer who reads both will not trust either. **Fix the FAQ immediately.**

**Minor inconsistency — agent naming:**
- Live site lists "📣 Clara — Comms & PR" under Pro agents
- README lists "📣 Morgan — Marketing" as a Pro agent  
- The live site also shows Morgan separately as "Marketing"
- Clara is listed as "Communication" in README but "Comms & PR" on the site

The overlap between Clara (Comms & PR) and Morgan (Marketing) isn't explained. To a prospect, it raises "do I need both? what's the difference?" — a question that shouldn't exist.

---

## 3. Hero Copy Analysis

**Headline:**
> "Your entire AI team. One command."

**Verdict: Good, but not quite punchy enough.** The word "entire" softens it. Compare:
- ❌ "Your entire AI team. One command." (current)
- ✅ "Your AI team. One command." (tighter)
- ✅ "28 AI specialists. One command." (more concrete)

The Hero.tsx actually renders "Your entire AI team. / One command." — the landing page title meta is "A.L.I.C.E. — Your AI Team. One Command." (without "entire"), which is stronger. Align them.

**Sub-headline:**
> "Stop duct-taping prompts together. Get an organization."

This is the best line on the site. It should be the hero sub-headline, not buried in the body paragraph. Currently it appears *after* the `npx` command in a dense paragraph. Elevate it.

**Badge copy:**
> "Open source · Free to start"

Clean, correct, builds trust. Keep it.

**Social proof strip:**
> "28 specialists · 1 command · Open source · MIT"

This is placeholder-level proof. "28 specialists" is a product spec, not social proof. No user numbers, no GitHub stars, no testimonials. Even "Used by 500+ developers" (if true) would be vastly more persuasive.

**Recommended hero restructure:**
```
[Badge] Open source · Free to start

Your AI team.
One command.

Stop duct-taping prompts together.
npx @robbiesrobotics/alice-agents deploys 28 specialists — 
each with a name, a role, and the expertise to actually do it.

[Install free] [View on GitHub]

★ 1,200 GitHub stars · Used by 800+ developers · MIT licensed
```

---

## 4. Pricing Page Analysis

**Structure: Good.** Three tiers (Starter/Free, Pro/$49 one-time, Cloud/$20/mo) is clean and the one-time Pro pricing is a genuine differentiator. "Buy once. Own it forever." is strong.

**What works:**
- "Simple, honest pricing" — exactly right tone
- "Start free. Upgrade when you need the full team." — clear upgrade path
- The comparison table is comprehensive

**What doesn't work:**

**Issue 1 — Cloud add-on placement in the table:**

The comparison table shows:
```
Cloud memory sync | ✗ (Free) | Cloud add-on ($20/mo) (Pro)
Team sharing      | ✗ (Free) | Cloud add-on ($20/mo) (Pro)
```

This reads as if Cloud is a Pro feature, which is confusing since Cloud is its own separate tier shown in the pricing cards above the table. A developer reads this as "Pro includes cloud for $20/mo extra" which is technically true but cognitively jarring against the three-tier card layout. 

**Fix:** Add a third column to the table for Cloud, or add a note row: `† Requires Cloud Add-on ($20/mo) — available with Pro`.

**Issue 2 — "requires Pro" discoverability:**

The Cloud card says "Requires Pro license" as a subtitle. That's good. But a developer scanning quickly might click "Add Cloud" without realizing they need to buy Pro first. Add a "Prerequisites: Pro ($49)" line inside the Cloud feature list, or a visual dependency arrow.

**Issue 3 — Missing FAQ on pricing page:**

The main landing page has an FAQ. The /pricing page doesn't. Common questions like "Can I use my own Supabase?" or "What counts as a seat?" or "Is the $49 truly lifetime?" should live on the pricing page itself, not require scrolling to the homepage FAQ.

**Issue 4 — The hero subtitle for pricing:**
> "Start free. Upgrade when you need the full team."

Good, but "the full team" is vague. Consider:
> "Start free with 10 agents. Upgrade to unlock all 28."

---

## 5. README / npm Listing Analysis

**Does the README sell A.L.I.C.E. to a developer browsing npm? Verdict: Partially.**

**What works:**
- Clean quick start (one command)
- Full agent table with tiers clearly labeled
- Model flexibility section — smart to lead with "works with what you have"
- Upgrade/uninstall instructions — professional

**What needs work:**

**The title:**
> "🧠 A.L.I.C.E. — AI Agent Framework for NemoClaw & OpenClaw"

The dots in A.L.I.C.E. make it clunky in every context. The brand choice to spell it with periods is a constant friction. On npm, the first thing a developer reads is a title with periods-in-acronym. Consider whether "ALICE" (no dots) would serve better everywhere except formal contexts.

**The NemoClaw/NVIDIA positioning:**

The README leads heavily with NemoClaw:
> *"NemoClaw compatible — A.L.I.C.E. v1.2.7+ runs natively on NVIDIA NemoClaw, the secure open-source agent runtime."*

If NemoClaw is real and shipping, this is a strong trust signal — NVIDIA adds enterprise credibility. If it's aspirational, this is a liability. A developer who clicks through and finds NemoClaw isn't shipping will immediately lose trust in every other claim on the page. **Verify this claim is accurate before it ships widely.**

**Missing from README:**
- No screenshot or GIF of agents in action
- No "Why A.L.I.C.E.?" or comparison to AutoGPT/CrewAI/LangGraph (developers will ask)
- No badge row (npm version, license, build status) — these are low-effort trust signals
- The "How It Works" section is buried below a long agent table — consider moving it up

**Suggested README restructure:**
```markdown
# ALICE — Your AI Team, One Command

> 28 specialized AI agents. One orchestrator. Zero config.

[![npm](badge)] [![license: MIT](badge)] [![OpenClaw](badge)]

npx @robbiesrobotics/alice-agents

## What is ALICE?
[2-3 sentence pitch here]

## How it works
[existing 4-step flow]

## The team
[existing table]
```

---

## 6. Missing Content — Conversion Gaps

These are the content gaps most likely to cost conversions right now, ranked by impact:

| Priority | Missing Content | Impact |
|----------|----------------|--------|
| 🔴 Critical | **Demo video / GIF** — not a single visual of agents working | High — "show don't tell" for a tool like this |
| 🔴 Critical | **Docs site** — no link to docs anywhere on the landing page | High — developers want to read before buying |
| 🟠 High | **Use-case pages** — "ALICE for solo devs", "ALICE for small teams", "ALICE for enterprise" | Medium-High — different buyers need different stories |
| 🟠 High | **Comparison page** — vs. AutoGPT, CrewAI, LangGraph, Custom GPTs | Medium-High — "how is this different?" is the #1 question |
| 🟡 Medium | **Changelog / what's new** — signals active development | Medium — trust signal for serious buyers |
| 🟡 Medium | **Testimonials / case studies** — even 3 developer quotes would help | Medium — social proof is absent entirely |
| 🟡 Medium | **Agent detail pages** — what can Olivia actually do? click-through from grid | Medium — conversion for mid-funnel |
| 🟢 Low | **Blog / updates** — any content SEO surface | Low-Medium — growth lever |
| 🟢 Low | **Discord/community link** — signals living project | Low |

The biggest missing piece is a **30-second screen recording** of Olivia in action. "Stop duct-taping prompts together" is a great claim — prove it in 30 seconds and conversion will measurably improve.

---

## 7. Overall Brand Impression

**Current feel: 7/10 — "Promising open-source project by a skilled developer."**

**What reads as serious:**
- Dark theme, clean typography — professional
- Terminal component (likely animated) — on-brand for dev tools
- Three-tier pricing with "buy once" — thoughtful product thinking
- 28 agents with detailed specializations — signals real effort
- MIT license prominently featured

**What reads as side project:**
- `@robbiesrobotics` package namespace — personal account = personal project
- No social proof numbers (stars, installs, users)
- FAQ answer contradicts README — editorial inconsistency = rushed
- No docs link anywhere
- "More runtimes coming" without a roadmap link

**What would make it feel more credible:**

1. **Move to a brand npm namespace.** `@alice-agents/cli`, `@getaliice/install`, anything that isn't `robbiesrobotics`. This is the #1 change.

2. **Add one real number.** GitHub stars, npm weekly downloads, number of installs — whatever's most impressive. Even "Join 200+ developers" is better than nothing.

3. **Ship a docs site.** Even a minimal Mintlify or Docusaurus site at `docs.getalice.av3.ai` signals this is a maintained product, not a weekend project.

4. **The A.L.I.C.E. full acronym expansion** ("Adaptive Learning & Intelligent Coordination Engine") — it reads forced. Only use it once, if at all. Let the product name do the work.

5. **Fix the FAQ contradiction** (API key required vs. not required) before it hits HN/Reddit.

---

## Quick Wins (Fix This Week)

| Fix | Effort | Impact |
|-----|--------|--------|
| Rewrite FAQ API key answer to match README | 5 min | Eliminates a trust-breaking inconsistency |
| Add third "Cloud" column to comparison table | 1 hr | Pricing page clarity |
| Elevate "Stop duct-taping prompts together" to hero sub-headline | 15 min | Better first impression |
| Add npm badges to README | 15 min | Free trust signal |
| Record a 30-second Loom/GIF of Olivia in action | 2 hrs | Biggest conversion lift available |

---

*Audit completed: 2026-03-18 by Morgan (Marketing specialist)*  
*Next: Share with Dylan (Dev) for README/FAQ fixes; Olivia to prioritize demo video timeline*
