# Week 1 — A.L.I.C.E. Self-Sustaining Business

**Sprint goal:** Get the foundation live so agents have something to operate.  
**Dates:** Week of 2026-03-17  
**Coordinator:** Parker  
**Status:** 🔴 Not started

---

## Critical Path

Week 1 has a hard dependency chain. This order matters:

```
Rob: Stripe setup → Dylan: webhook handler → Dylan: license API → Clara: welcome email → ✅ End-to-end purchase flow
Rob: License decision → Dylan: README + LICENSE → ✅ Repo polished
Rob: Cloud decision → Morgan: pricing copy → ✅ Site updated
```

Everything downstream of Rob's decisions cannot start until those decisions are made.

---

## Rob's Tasks (Must Complete by EOD Monday)

These are blocking everything else. Rob needs to do these first.

| # | Task | Done When | Estimated Time |
|---|------|-----------|----------------|
| R1 | Decide: MIT license or commercial license? | Decision made, communicated to team | 15 min |
| R2 | Decide: Cloud add-on launch with v1 or waitlist? | Decision made | 10 min |
| R3 | Decide: Which features are Pro-gated vs free? | Short list written | 30 min |
| R4 | Create Stripe account + "A.L.I.C.E. Pro" product ($49 one-time) | Product ID and price ID shared with Dylan | 45 min |
| R5 | Create Stripe "Cloud Add-on" product ($20/mo, requires Pro) — or skip if waitlisted | Price ID shared, or confirmed skip | 15 min |
| R6 | Confirm: Use existing Supabase instance for license DB? | Yes/no + connection string shared | 10 min |
| R7 | Confirm: Resend account and API key available? | API key shared with Dylan + Clara | 10 min |

**Total Rob time Monday:** ~2.5 hours  
**If Rob can't do all of this Monday:** R1, R3, R4 are the must-haves. R2, R5-R7 can slip to Tuesday.

---

## Dylan's Tasks

**Unblocked immediately (start Monday):**

| # | Task | Blocked By | Done When | Notes |
|---|------|-----------|-----------|-------|
| D1 | Add issue templates to GitHub (bug, feature request) | Nothing | Templates live in `.github/` | Copy from GitHub's defaults, adapt |
| D2 | Enable GitHub webhook (issues, PRs) → placeholder endpoint | Nothing | Webhook registered, handler scaffolded | Real handler comes after Stripe |
| D3 | Scaffold license API structure (routes, DB schema) | Nothing | Code written, not yet wired | Can build against mock until Stripe keys arrive |
| D4 | Create Supabase `licenses` table (schema) | R6 | Table exists: id, key, email, purchased_at, revoked | Darius to verify schema |
| D5 | Build Stripe webhook handler | R4 (keys) | Handler receives + processes `checkout.session.completed` | Test with Stripe CLI locally first |
| D6 | Wire license generation on purchase | D4 + D5 | Purchase → key in DB | Format: `ALICE-XXXX-XXXX-XXXX` |
| D7 | Wire Resend: send license key email on purchase | R7 + D6 | Email delivered in < 5 min of purchase | Use Clara's copy once written |
| D8 | Update README (value prop, install, pricing) | R1 (license type), R3 (Pro features) | PR opened | Morgan to review copy |
| D9 | Add LICENSE file to repo | R1 | File committed to main | MIT = just drop the file |

**Dylan's Week 1 Definition of Done:**  
- [ ] Issue templates live
- [ ] Stripe webhook receiving events (tested with Stripe CLI)
- [ ] License generation working end-to-end (purchase → key in DB → email sent)
- [ ] README PR open for review

---

## Clara's Tasks

**Blocked until R4 + R7 + D7:**

| # | Task | Blocked By | Done When | Notes |
|---|------|-----------|-----------|-------|
| C1 | Write license delivery email copy | Nothing (start now) | Copy doc complete | Subject, body, key formatting, getting started link |
| C2 | Write welcome sequence (3 emails) | Nothing (start now) | Copy doc complete, Rob reviewed | Day 0, Day 3, Day 7 |
| C3 | Write waitlist nurture sequence (2 emails) | Nothing (start now) | Copy doc complete | Email 1 (signup), Email 2 (Day 14) |
| C4 | Load sequences into Resend | R7 + copy approved | Sequences queued in Resend, not yet sending | Requires Resend access |
| C5 | Export current waitlist from Darius | Darius D1 | CSV or Resend audience uploaded | Don't send yet — just prep |

**Clara's Week 1 Definition of Done:**  
- [ ] All 3 email sequence copy docs written
- [ ] Sequences loaded into Resend (ready to send, holding for Rob go-ahead)
- [ ] License delivery email wired to Dylan's webhook

---

## Darius's Tasks

| # | Task | Blocked By | Done When | Notes |
|---|------|-----------|-----------|-------|
| Da1 | Export waitlist data from Supabase | Nothing | CSV exported + count shared with team | Report signups count to Olivia |
| Da2 | Review + confirm licenses table schema with Dylan | D4 | Schema approved | Darius owns data integrity |
| Da3 | Verify Supabase backup schedule is active | Nothing | Confirm backups enabled | Before we start writing license data |
| Da4 | Set up Supabase monitoring alert (new signups, anomalies) | Nothing | Alert configured | So Darius can catch spam/anomalies |

**Darius's Week 1 Definition of Done:**  
- [ ] Waitlist exported and count reported
- [ ] License table schema confirmed
- [ ] Backups verified

---

## Morgan's Tasks

| # | Task | Blocked By | Done When | Notes |
|---|------|-----------|-----------|-------|
| M1 | Review + update pricing copy (site/landing page) | R2 (cloud decision), R3 (Pro features) | Copy updated on site | If site is static, open PR to Dylan |
| M2 | Write "Why one-time pricing?" FAQ entry | R2 | Published or queued | Supports conversion |
| M3 | Audit existing blog post cron — is it working? | Nothing | Confirm last post published date + next scheduled | If broken, flag to Dylan |
| M4 | Draft this week's blog post topic | Nothing | Topic approved by Olivia | Publish Tuesday per schedule |

**Morgan's Week 1 Definition of Done:**  
- [ ] Pricing copy updated
- [ ] Cron confirmed working (or fixed)
- [ ] Blog post for Week 1 published

---

## Parker's Tasks

| # | Task | Done When |
|---|------|-----------|
| P1 | Create this WEEK1.md | ✅ Done |
| P2 | Create PROJECT.md | ✅ Done |
| P3 | Track blocker status daily | Daily check-in with Olivia |
| P4 | Flag to Olivia if Rob's decisions slip past Tuesday | Immediate escalation |

---

## End-of-Week-1 Checklist

By EOD Friday 2026-03-21:

**Must have (blocks Week 2):**
- [ ] Stripe products created (R4)
- [ ] License API live (D6)
- [ ] License email delivery working (D7)
- [ ] Pro feature list defined (R3)

**Should have:**
- [ ] README PR open (D8)
- [ ] All email copy written (C1–C3)
- [ ] Waitlist exported (Da1)
- [ ] Pricing page updated (M1)

**Nice to have:**
- [ ] Sequences loaded in Resend (C4)
- [ ] Blog post published (M4)
- [ ] GitHub issue templates live (D1)

---

## Daily Standup Format (for Olivia's Monday review)

Each agent reports to Olivia by EOD each day:
- ✅ What I completed today
- 🔄 What I'm working on tomorrow
- 🚧 Any blockers (tag who needs to unblock)

---

*Week 1 plan created: 2026-03-17 | Parker*
