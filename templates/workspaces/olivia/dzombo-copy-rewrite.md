# EDITORIAL BRIEF — Robbies Robotic → Dzombo Partnership Site
**To:** Rob (Robbie Sanchez)
**From:** Senior Copywriter (subagent)
**Re:** Full voice and structural rewrite of dzombo-site
**Date:** March 26, 2026

---

## THE ONE-SENTENCE BRIEF

This site should read like one competent operator (Robbies Robotic) writing a honest letter to another competent operator (Japsie at Dzombo) proposing to build something real together — not like a vendor brochure.

---

## WHAT'S WRONG WITH THE CURRENT COPY

### 1. The headline kills it immediately
"AI Will Change Your Business" is a generic AI vendor pitch. Every chatbot vendor in the world uses some version of this. It signals we're trying to sell something, not proposing a partnership.

**Fix:** Lead with the partnership frame. We're not here to change anyone's business. We're here to build an AI operation together that makes Dzombo more effective at what it already does well.

### 2. The hero reads like a brochure
"Transforming Dzombo's operations with purpose-built AI tools" is marketing language that could apply to any SaaS product. It tells Japsie nothing about what we're actually proposing.

**Fix:** State clearly: we want to partner with Dzombo. Here's what we'd build together. Here's what it costs. Here's how we'd operate.

### 3. Service tabs on the home page create a price-list feel
Five services × four tiers each = 20 decisions for the reader before they've even decided if they trust us. The home page should tell the story. The pricing page should carry the detail.

**Fix:** Home page shows 2–3 sentences per service (what it is, why it matters for Dzombo) and a link to /pricing for the full tiers. The home page is a proposal letter, not a menu.

### 4. The money story is backwards
The current "Why Now" section leads with opportunity ("Africa is ready for this") and buries the N$340,000 hardware cost in an infobox. The reader finishes the section thinking about opportunity before encountering the cost.

**Fix:** Infrastructure truth comes FIRST. Here's what it costs to build. Here's what our ongoing fee covers. Here's why the total makes sense.

### 5. "We" vs "you" is inconsistent
Sections like "Vision / Understanding" do use "we" and "you" well. But the hero and CTAs slip into impersonal "AI will change your business" language.

**Fix:** Every paragraph uses "we" for Robbies Robotic and "you/Dzombo" for the client. No passive AI-vendor voice.

### 6. Testimonials are placeholder
Both testimonials are anonymous composites ("Safari operator, Zambia"). These should be flagged clearly as needing real quotes — ideally from Japsie himself, or from real operators.

### 7. Buzzwords still present
"Cuts admin burden" is fine. But the overall tone has remnants of AI vendor enthusiasm. We need to strip anything that sounds like it's trying to excite rather than inform.

### 8. The CTA "Extraordinary" is too much
"Ready to Build Something Extraordinary?" is sales copy. "Let's talk about whether this makes sense for Dzombo" is honest.

---

## WHAT TO KEEP

- The infrastructure facts (N$0.86/kWh, 0% SACU import duty, N$340,000, ~3.5kW) — these are real and should be prominent
- The "built for Africa / built for the bush" framing — it's specific and true
- The process page structure (5 steps) — it's clear and honest
- The FAQ — solid, well-written content

---

## WHAT TO FLAG FOR ROB (NEEDS REAL INPUT)

1. **Testimonials** — Need real quotes. If Japsie has any operator contacts who have done this, great. Otherwise we should remove the section or replace with something honest ("We'd love to add Dzombo's story here once we've built something together.")
2. **What specific pain is worst?** — The copy assumes the admin burden on PHs is the main pain point. Is that actually Japsie's biggest issue? Needs confirmation.
3. **What's the actual goal for Year 1?** — We assume client experience + internal efficiency. Is that right?
4. **Dzombo team size** — How many staff would actually use the AI tools? This affects pricing tier recommendations.
5. **Budget conversation** — The N$340,000 CAPEX is a real number. Has Japsie already indicated he's comfortable with this? Is there a lower entry point he's expecting?

---

## TONE RULES FOR ALL THREE PAGES

**Use:**
- "We" for Robbies Robotic Inc.
- "You" / "Dzombo" / "Japsie" for the client
- Specific, grounded language
- Honest cost framing
- "Partnership" language (shared risk, long-term, we answer to you)
- Numbers that mean something

**Never use:**
- "Transform" / "revolutionize" / "game-changing" / "cutting-edge"
- "AI-powered" (it's redundant and sounds like a pitch)
- "Next-generation"
- Generic enthusiasm ("extraordinary", "unlock your potential")

**Lead with:** What it costs → What we charge → What you get

---

## PAGE-BY-PAGE STRUCTURAL CHANGES

### HOME (app/page.tsx)
1. **Hero:** New headline — partnership frame, not AI vendor pitch. State the deal clearly.
2. **Remove service tabs** — Replace with 2–3 sentence descriptions of 2–3 core services, link to /pricing
3. **Infrastructure section:** Lead with cost truth. N$340,000 hardware. What the ongoing electricity costs. What our partnership fee covers.
4. **Why this makes sense:** Reframe from "why AI now" to "why we think this partnership makes sense for Dzombo specifically"
5. **CTA:** Honesty-first. "If this looks like it might work, let's talk."

### PRICING (app/pricing/page.tsx)
1. **Page header:** Reframe from "what you pay" to "how this works financially" — separate hardware (your cost) from our partnership fee (our charge)
2. **Tier cards:** Keep the structure, rewrite the framing copy in each tier to sound like a partnership offer, not a SaaS subscription
3. **Add clarity box:** N$340,000 is YOUR hardware purchase — you own it. Our fees are separate and cover our time managing and optimizing the system.
4. **ROI section:** Reframe from "what AI saves" to "what this actually returns" — honest, grounded numbers

### PROCESS (app/process/page.tsx)
1. **Hero copy:** Reframe as "how we work with you" not "how we deliver to you"
2. **Step descriptions:** Rewrite each to emphasize collaboration, not handoff
3. **Principles section:** Keep but tighten — these are good and honest
4. **CTA:** "If this sounds like how you'd want to work, let's talk."

---

*End of editorial brief.*
