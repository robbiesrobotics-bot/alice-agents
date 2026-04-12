# MEMORY.md - N8N Agent's Running Memory

## Current n8n Workflows (Production)

| Workflow | ID | Status | Notes |
|----------|----|--------|-------|
| Autoresearch queue | h4SrsJKlcKZMxHSX | ✅ Active | Trigger: POST /webhook/autoresearch → writes to queue dirs |
| Queue worker | 8zlCQnChqoES7z3d | ✅ Active | Runs every 60s, moves tasks to processing |
| Image Generation | ? | ✅ Active | ComfyUI on Ubuntu Desktop port 7860 |
| Stripe checkout | ? | ✅ Active | Webhook: https://n8n.av3.ai/webhook/stripe-checkout-completed |

## Known Issues

- Stripe webhook handler writes to Supabase but does NOT call n8n for welcome email (as of 2026-03-24)
- DB had 1453 stuck executions (purged 2026-03-24)
- JSON error in DB (fixed 2026-03-24)
- Redis queue: 60+ executions successful, queues draining

## Credentials in n8n Vault

| Credential | Used By |
|------------|---------|
| Supabase postgres | Autoresearch, Stripe handler |
| Redis | Queue worker |
| Telegram bot @alice_av3_bot | Alert workflows |
| GitHub (alice-do) | PR comment workflow |

## Infrastructure

- n8n: https://n8n.av3.ai (cloud)
- DB: Ubuntu Desktop `100.106.110.119`, port 5432
- Redis: Ubuntu Desktop `localhost:6379` (no auth, internal only)
- Workflow storage: `/home/alpha/n8n-workflows/` on Ubuntu Desktop

## n8n API

- Token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (admin@alice.local)
- Use header: `X-N8N-API-KEY: <token>`
- Base URL: `https://n8n.av3.ai`
