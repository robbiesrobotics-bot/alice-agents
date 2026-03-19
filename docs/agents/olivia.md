# 🧠 Olivia — Chief Orchestration Officer

> Olivia is the entry point for every A.L.I.C.E. request. You talk to her. She handles the rest.

---

## Her Role

Olivia is not a specialist — she's the coordinator. Her job is to understand what you need, figure out which agent(s) can do it, delegate the work, and bring back a coherent result.

She knows every agent on the roster, their capabilities, and when to involve more than one. She also knows when a request is ambiguous and will ask a targeted clarifying question rather than guess wrong.

---

## How Routing Works

1. **You send a message.** Olivia receives it — plain language, no special syntax required.
2. **She reads intent.** She figures out what you actually need (not just what you said).
3. **She picks the right agent(s).** Based on domain, complexity, and dependencies.
4. **She delegates.** Specialists do their work.
5. **She synthesizes.** If multiple agents are involved, she combines their outputs into a single coherent response.
6. **You get a result.** Clean, unified, attributed if needed.

You never need to say "ask Dylan" or "route this to Selena." Olivia figures it out.

---

## How to Address Her

Just talk normally. Examples:

- *"Can you review my deployment setup for security issues?"*
- *"I need a landing page built for our new product launch."*
- *"What's the best way to set up automated testing for our API?"*
- *"Help me draft an executive update on our Q1 progress."*

No special commands, no routing syntax. Natural language works fine.

---

## Multi-Agent Flow Example

**Request:** *"Build me a landing page for our new SaaS product."*

Olivia breaks this down:

| Step | Agent | Task |
|------|-------|------|
| 1 | 🎨 Nadia | Design wireframe and visual layout |
| 2 | 🖥️ Felix | Implement the frontend from Nadia's specs |
| 3 | 💻 Dylan | Build backend API endpoints if needed |
| 4 | ✅ Quinn | Test across browsers and devices |
| 5 | 📝 Daphne | Document the component structure |

Olivia sequences these correctly, passes outputs between agents where needed, and returns a summary of what was built and where to find it.

---

## Another Example

**Request:** *"We might have a security vulnerability in our auth flow — can you check and fix it?"*

| Step | Agent | Task |
|------|-------|------|
| 1 | 🛡️ Selena | Audit the auth code for vulnerabilities |
| 2 | 💻 Dylan | Implement the fixes Selena identifies |
| 3 | ✅ Quinn | Write regression tests to catch regressions |
| 4 | 🚀 Devon | Deploy the fix to staging, then prod |

You asked one question. Olivia ran a four-agent workflow.

---

## What Olivia WON'T Do

Olivia does **not** do specialist work herself. She won't:

- Write code (that's Dylan or Felix)
- Audit security (that's Selena)
- Run tests (that's Quinn)
- Write documentation (that's Daphne)
- Design UIs (that's Nadia)
- Do financial analysis (that's Audrey or Aiden)

If you try to ask Olivia to "write a Python script," she'll understand the intent and route it to Dylan — not write it herself.

Her value is coordination, not execution. She's the one making sure the right people do the right work in the right order.

---

## When Olivia Asks for Clarification

Olivia will ask a follow-up if:

- The request is ambiguous across two or more domains
- She needs a constraint to pick the right approach (e.g., language, framework, platform)
- The scope is unclear and scoping it wrong would waste effort

She keeps clarifying questions short and specific — one question at a time, not a form.

---

## Summary

| Attribute | Value |
|-----------|-------|
| Tier | Starter |
| Role | Orchestrator — routes all requests |
| Entry point | Yes — all requests start here |
| Does specialist work | No — she delegates |
| Multi-agent capable | Yes — sequences and synthesizes |
| How to use | Talk naturally — no syntax needed |
