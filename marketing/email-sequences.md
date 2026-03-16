# A.L.I.C.E. — Email Sequences

> Two sequences. Short, human, not corporate. Rob's voice throughout.
> Triggered by CLI installer (if user provides email) or linked account.

---

## Sequence 1: Welcome Email

**Trigger:** User runs `npx @robbiesrobotics/alice-agents` and completes install

**Send timing:** Immediately after install (or within 5 minutes)

---

**Subject:** You just installed a team

**Body:**

Hey —

You just ran the command. A.L.I.C.E. is up.

A quick orientation before you dive in:

**Olivia** is your starting point. Tell her what you're working on — a project, a problem, a question. She'll route it to whoever's best suited.

Your **Starter tier** includes 10 agents: Olivia, Morgan, Clara, Rex, Dev, Selena, Finn, Nova, Aria, and Zara. That's orchestration, marketing, communication, research, engineering, security, finance, product, design, and ops. Not bad for a free install.

A few things worth knowing:
- Agents work in your terminal, Telegram, or iMessage — your call
- The system doesn't remember between sessions on Starter (that's a Pro feature)
- There's no right way to use this — just start asking

When you're ready to unlock the full 28-agent roster and persistent memory, Pro is $20/mo. Or grab Founder pricing at $99/year — it won't last long.

For now: go talk to Olivia.

— Rob

P.S. If something breaks or feels off, reply to this email. I actually read these.

---

## Sequence 2: Pro Upgrade Nudge

**Trigger:** 3 days after Starter install (no Pro conversion yet)

**Send timing:** Day 3, 10am user local time (or best-guess timezone)

---

**Subject:** Three things Starter can't do

**Body:**

Hey —

You've been using A.L.I.C.E. for a few days. Hope it's been useful.

A few people asked me why they should upgrade to Pro. Honest answer: you don't have to. Starter is real and it's free.

But here are the three moments where Starter starts to feel like it's holding you back:

**1. You restart and your team forgot everything.**
Starter is session-only. Every new conversation, your agents start fresh. No memory of your projects, your preferences, your past work. Pro gives you persistent memory — your team *remembers*.

**2. You need a specialist Starter doesn't have.**
Starter gives you 10 agents. Pro unlocks 28. The ones you're probably missing: Lex (legal), Sam (sales), Harper (HR), Dash (data), Dex (DevOps), and 13 more. If you've hit a task and thought "I wish there was an agent for this" — there probably is, in Pro.

**3. You want your whole team in one place.**
Starter works for solo exploration. Pro (and Team) is where A.L.I.C.E. starts feeling like infrastructure — something you build on top of, not just something you open when you need a quick answer.

**Pro is $20/mo.** Or — if you want to lock in a deal before it's gone — Founder pricing is $99/year. First 500 customers only. We're moving through those.

[Upgrade to Pro →]
[Get Founder Pricing →]

No pressure. Just didn't want you to hit a wall without knowing there's a door.

— Rob

---

*Notes for implementation:*
- *Welcome email: fire on successful install event from CLI. Email capture optional at install — don't gate the product behind it.*
- *Upgrade nudge: suppress if user converts to Pro between install and Day 3. Suppress if user has explicitly dismissed.*
- *Both emails: plain text preferred. No heavy HTML. Developer audience responds poorly to overly designed emails.*
- *Reply-to: Rob's actual email address. These aren't no-reply.*
