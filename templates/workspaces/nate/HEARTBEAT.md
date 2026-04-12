# HEARTBEAT.md - N8N Agent

## Active Workflows (as of 2026-03-26)

Known n8n workflows on n8n.av3.ai:
- **autoresearch** (ID: h4SrsJKlcKZMxHSX) — webhook: `https://n8n.av3.ai/webhook/autoresearch` → writes to queue dirs
- **Queue Worker** (ID: 8zlCQnChqoES7z3d) — runs every 60s, picks up from processing dirs
- **Stripe checkout handler** — E2E tested (2026-03-24)
- **GitHub PR webhook → bot comment** — E2E tested (2026-03-24)
- **Image Generation (ComfyUI)** — workflow at `/home/alpha/n8n-workflows/image-generation.json`

## n8n Health Indicators

- n8n URL: https://n8n.av3.ai (cloud)
- Database: `postgres://localhost:5432/n8n` on Ubuntu Desktop
- Redis: `redis://localhost:6379`
- Known issue (2026-03-24): DB had 1453 stuck executions — purged, WAL cleaned
- Known issue (2026-03-24): JSON error in DB — fixed

## Credentials Stored in n8n
- Supabase (postgres connection)
- Redis
- Telegram bot (@alice_av3_bot)
- GitHub (alice-do)
- Various webhook URLs

## Workflow Storage
All workflow JSON files should be saved to: `/home/alpha/n8n-workflows/{workflow-name}/`
Version subdirectories: `/home/alpha/n8n-workflows/{workflow-name}/v1/`, `v2/`, etc.

## SSH
- Key: `~/.ssh/id_ed25519`
- Host: `alpha@100.106.110.119`
