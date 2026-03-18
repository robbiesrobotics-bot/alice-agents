# A.L.I.C.E. Pricing Strategy — v2 Recommendation
**Author:** Morgan (Marketing Specialist)  
**Date:** 2026-03-17  
**Status:** ✅ CONFIRMED — Rob approved 2026-03-17

> **CONFIRMED PRICING: Free / Pro $49 one-time / Cloud Add-on $20/mo (requires Pro)**
> This is the canonical pricing. All other files, copy, and references should match this.

---

## 1. Honest Product Analysis

**Is A.L.I.C.E. a SaaS or a software product?**

Right now? It's a software product cosplaying as SaaS.

`npx @robbiesrobotics/alice-agents` installs config files and an orchestration layer locally. There's no server Rob is running, no database Rob is maintaining, no uptime Rob is responsible for. The runtime (OpenClaw/NemoClaw) is free. The value delivered is: a well-designed set of agent configurations that work on top of a free runtime.

**What would justify ongoing billing?**
- Active cloud infrastructure Rob operates (Supabase memory sync, managed hosting, etc.)
- Continuous new agent releases with real value
- An active dashboard, API, or connected service with uptime
- Ongoing support SLA

**What's actually there today?**
- 28 agent config files
- A CLI installer
- Presumably documentation and maybe a license key system

That's a product. A good one, potentially. But it's not a service. Charging $29/mo for config files is a trust-killer with developers — and developers talk.

**Rob's instinct is correct.** The subscription model doesn't match what's being delivered. Continuing it without genuine ongoing service value creates churn, chargebacks, and bad-faith perception in the dev community. Fix it before it costs more than the MRR.

---

## 2. Option A — One-Time Purchase Model

| Tier | Price | What You Get |
|------|-------|--------------|
| Starter | Free | 10 agents, local only |
| Pro | $49 one-time | 28 agents, license key, lifetime updates |
| Cloud Add-on | $20/mo (requires Pro) | Hosted Mission Control, Supabase memory sync, cloud backup |
| Team | Coming soon | — |

### Pros
- **Developer trust is immediate.** One-time purchase signals confidence in the product and respect for the buyer. Developers will recommend it, not resent it.
- **Lower purchase friction.** $49 one-time is an impulse buy. $29/mo requires justification every month.
- **Honest.** Matches what's actually being delivered.
- **Cloud add-on creates recurring revenue without deception** — you're charging for infrastructure you're actually running.
- **Founder pricing psychology:** early buyers get "lifetime" — a strong conversion lever.
- **$20/mo cloud add-on is a natural upsell** after the user sees value locally — requires Pro, so it's a two-step ascension.

### Cons
- **Revenue is lumpy.** No predictable MRR floor — hard for cashflow planning, optics with investors.
- **Lifetime updates is a long-term commitment.** If the product pivots significantly, you're still obligated. Define "lifetime updates" carefully (v1.x? v2.x?).
- **Cloud add-on needs real infrastructure.** Don't offer it until Supabase sync actually works end-to-end.
- **Team tier is coming soon.** Not yet priced or available.

---

## 3. Option B — Hybrid Model

| Tier | Price | What You Get |
|------|-------|--------------|
| Starter | Free | Local, 10 agents |
| Pro | $49 one-time | 28 agents, local, license key |
| Cloud Add-on | $20/mo (requires Pro) | Cloud memory, sync, hosted Mission Control |
| Team | Coming soon | — |

### Pros
- **Best of both worlds** — serves the "just give me the tool" segment AND the "I want the full cloud stack" segment
- **$19/mo is defensible** if cloud memory sync, dashboard, and sync are genuinely running
- **Team cloud at $15/seat/mo** is realistic for SMB teams who expense software
- **Separates local vs. cloud clearly** — transparent and fair

### Cons
- **More complexity to communicate.** Two Pro SKUs confuse conversion funnels. Most landing pages work better with a cleaner hierarchy.
- **$19/mo is still a recurring charge** — will still face skepticism until cloud features are substantial enough to justify
- **Dashboard and cloud features need to ship** before Pro Cloud goes live — if you launch it on promises, you'll get burned
- **SSO for Team tier** is an enterprise feature that requires real engineering — don't promise it without timeline

### Key insight: Option B is where you build TOWARD, not where you start.

---

## 4. Option C — Current Subscription (Status Quo)

| Tier | Price |
|------|-------|
| Starter | Free |
| Pro | $29/mo |
| Team | $99/mo |

### Honest Critique

**What justifies $29/mo right now?**

Unless there's active cloud infrastructure, an AI model API being proxied, continuous new agent development, or an always-on dashboard — not much.

The developer community will forgive a lot, but they don't forgive "you're charging me monthly for config files." This is the thing that kills word-of-mouth and generates negative HackerNews threads.

**Specific problems with the status quo:**
1. **High churn risk.** Monthly subscribers constantly re-evaluate. One-time buyers don't.
2. **Support burden.** Monthly payers feel entitled to ongoing support. You'll be buried in tickets.
3. **Mismatched trust signal.** Subscription implies ongoing service delivery. If the product is CLI + configs, devs will feel deceived when they realize the scope.
4. **Competitive threat.** The moment an open-source alternative appears with similar agents, you lose your recurring subscribers fast. A one-time buyer is already "paid and happy."

**The only scenario where $29/mo is defensible today:** if you're shipping meaningful new agents or capabilities monthly, actively maintaining cloud infrastructure, and have a support tier baked in. If that's not happening yet, change the model before the community defines the narrative for you.

---

## 5. Recommendation

### TODAY: Launch Option A
### BUILD TOWARD: Option B (when cloud features exist)

**For immediate launch:**

```
Starter:        Free                  — 10 agents, local
Pro:            $49 one-time          — 28 agents, license key, lifetime v1.x updates
Cloud Add-on:   $20/mo (requires Pro) — Hosted Mission Control, Supabase sync
Team:           Coming soon
```

**Why Option A now:**
- It's honest
- Developer goodwill is the only marketing flywheel that costs $0
- $49 one-time × 1,000 users = $49,000 — a solid v1 revenue number, and a customer list of people who bought and stay
- You're not locked into delivering ongoing service before you're ready
- Early adopter "lifetime" pricing is a conversion lever you only get to pull once

**Migration path to Option B:**
Once Supabase memory sync, cloud backup, and the Mission Control dashboard are real and working:
- Keep $49 Pro one-time as evergreen
- Cloud Add-on at $20/mo — clear feature differentiation, requires Pro
- Consider grandfathering early adopters at a discounted cloud rate (loyalty move)
- Add Team tier when SSO and audit logs are built

**The NemoClaw enterprise angle:**
This is where real recurring revenue hides. Enterprise customers on NemoClaw will pay for:
- Managed agent hosting
- Team memory sync
- Security controls (SSO, audit logs, RBAC)
- SLA and priority support

That's a legit $99-$500/mo product — but it requires infrastructure. Build toward it explicitly. Don't charge enterprise prices for a solo dev tool.

---

## 6. Investor Framing

**If you go one-time, here's how you talk about it:**

> "We're following the Sublime Text / Raycast / Paw model — a premium developer tool sold as a one-time purchase, with an optional cloud services layer for recurring revenue. The one-time model builds trust with a developer audience that's deeply skeptical of subscription creep. Our recurring revenue comes from infrastructure we actually run: cloud memory sync, managed hosting, and enterprise team features. This gives us a defensible wedge into enterprise accounts via the NemoClaw ecosystem, where deal sizes are $500–$5,000/month."

**Comparable models investors recognize:**
- **Sublime Text** — $99 one-time, perpetual license, optional upgrade pricing. Bootstrapped profitably for years.
- **Raycast Pro** — Free core + $8/mo for AI features. One-time for the tool, recurring for the service layer. (This is actually your Option B.)
- **Paw (RapidAPI)** — $49 one-time for the HTTP client. No subscription.
- **TablePlus** — $79 one-time, license-based, wildly loved by developers.
- **Proxyman** — $49–$99 one-time, developer tool, strong NPS.

**The honest investor pitch:**
"Our TAM isn't just individual developers paying $29/mo. It's teams on NemoClaw paying $500/mo for enterprise memory and managed hosting. The one-time model is the acquisition layer. The cloud services are the monetization layer. We're building a land-and-expand motion where $49 gets someone into the ecosystem and $9–$500/mo keeps them there."

**Revenue modeling for investors:**
| Scenario | Customers | Revenue |
|----------|-----------|---------|
| 500 Pro one-time | 500 × $49 | $24,500 |
| 200 Cloud add-on | 200 × $20/mo | $4,000/mo MRR |
| **Year 1 total** | | **~$25K + $48K ARR** |

Scale to 5,000 Pro buyers + 1,000 cloud subscribers: $245K one-time + $240K ARR. That's a real business that compounds.

---

## Summary

| | Option A (One-time) | Option B (Hybrid) | Option C (Status quo) |
|--|--|--|--|
| **Honest today?** | ✅ Yes | ⚠️ Partially | ❌ No |
| **Dev trust** | ✅ High | ✅ High | ⚠️ Eroding |
| **Revenue predictability** | ⚠️ Lumpy | ✅ Good | ✅ Good |
| **Investor optics** | ✅ Explainable | ✅ Strong | ⚠️ Requires justification |
| **Build complexity** | ✅ Low | ⚠️ Medium | ✅ Low |
| **Recommended now?** | ✅ **Yes** | 🔜 Build toward | ❌ Change it |

**Bottom line:** Rob's instinct is right. Switch to Option A now. Start building Option B's cloud infrastructure. Don't let the subscription model define the brand before cloud services can back it up.

---

*Morgan — Marketing Specialist, A.L.I.C.E. Team*
