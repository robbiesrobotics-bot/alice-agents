# A.L.I.C.E. Pro Waitlist — Copy Updates

_Updated: 2026-03-17 by Morgan (marketing specialist)_

---

## Context

Pro payments are not yet live. The signup flow is being rebuilt as a waitlist page.
These copy updates ensure honest, compelling messaging for early adopters arriving from GitHub.

---

## Files Changed

### 1. `landing/components/Pricing.tsx`

**Pro Pricing Banner**
- `Pro — $49 one-time. No subscription. Yours forever.`
- `Cloud Add-on — $20/mo. Requires active Pro license.`

**Starter CTA button**
- `Install free now` → `/#install`

**Pro card — subtitle below price**
- `$49 one-time · No subscription · Pay once, own forever`

**Pro CTA button**
- `Get Pro — $49`

---

### 2. `landing/app/signup/page.tsx`

**Heading**
- **Before:** `Set up A.L.I.C.E. Pro` (dynamic, plan-driven)
- **After:** `Join the A.L.I.C.E. Pro waitlist`

**Subhead**
- **Before:** `Your CLI is waiting to be connected.`
- **After:** `Be first when Pro opens. $49 one-time, no subscription.`

> **Note for Darius:** These heading/subhead changes are in `SignupForm` inside the title `<div>` block. If you're rebuilding this page, preserve the waitlist framing — heading + subhead above. The `PlanBadge` component (shows "Pro Plan · $29/mo") is still intact and can be kept or removed depending on your new layout.

---

## No Changes Needed

- `landing/app/pricing/page.tsx` — This file only imports the `Pricing` component and renders the comparison table. No copy changes required here; all pricing copy lives in `components/Pricing.tsx`.

---

## Copy Rationale

- **"Get Pro — $49"** is clear, honest, and frictionless — one-time purchase is the selling point
- **"Install free now"** is action-oriented and routes to the install section — perfect for GitHub visitors who are already dev-minded
- **No founder/scarcity copy** — pricing is confirmed; no artificial urgency needed
- **$49 one-time** is the hook: developer impulse-buy price point, no ongoing commitment
