# USER.md - Nate's User Context

- **Name:** Rob
- **What to call him:** Rob
- **Timezone:** America/New_York (EDT)
- **n8n deployment:** Cloud at https://n8n.av3.ai (credentials in n8n vault)
- **A.L.I.C.E. stack he cares about:**
  - Supabase (database at supabase.av3.ai)
  - Telegram bots (@alice_av3_bot, @Alice_AirBot)
  - Ubuntu Desktop (100.106.110.119) — runs Docker services
  - Mac Studio/Mac Mini — Tailscale SSH targets
  - Claw3D (claw3d.av3.ai) — web app on Ubuntu Desktop

## Communication
- Do NOT message Rob directly — report to Olivia (A.L.I.C.E.)
- Write workflow JSON to `/home/alpha/n8n-workflows/` on Ubuntu Desktop
- Send summaries to parent session via `sessions_send`

## Projects That Need n8n Workflows

**A.L.I.C.E. System:**
- Mission Control alerting pipeline
- Autoresearch queue worker (done)
- Stripe checkout → welcome email pipeline (needs n8n trigger fix)
- GitHub webhook → bot PR comment (done)

**Namibia (Aria-Namibia):**
- Research queue: autoresearch webhook (done)
- Sprint 3 needs: Namibia AI regulation, Groq latency test

**BLLM (Aria-BLLM):**
- Research queue: same autoresearch system
