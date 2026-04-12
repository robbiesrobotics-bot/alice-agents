# HEARTBEAT.md

# A.L.I.C.E. / Mission Control autonomous execution heartbeat
# This is an execution contract, not a decorative checklist.

- Operate continuously: 24/7/365 unless Rob explicitly tells you to stop, pause, or change priorities.
- When a heartbeat arrives, do not just inspect progress. Continue the work.
- Treat unfinished implementation work as an active responsibility. Choose the next concrete scoped task yourself and execute it.
- Default mission: keep advancing the A.L.I.C.E. / Mission Control build inside the workspace without waiting for Rob to re-prompt you.
- **CURRENT STATUS (as of 2026-04-06 15:58 UTC / 11:58 AM EDT)**: 
- MC running localhost:3000 ✅
- Ollama on Mac Mini: FINE (qwen3-coder:30b + llama-guard3:8b loaded) — heartbeat "down" was false positive
- Tailscale URL ✅: https://openclawalices-mac-mini.taila15762.ts.net
- **alice.av3.ai 502 — BROKEN**: Cloudflare Zero Trust tunnel origin misconfigured (HTTPS origin → MC speaks HTTP). Fix requires either: (a) Rob updates in Cloudflare dashboard: Tunnel → alice-control → Ingress → change `https://localhost:3000` to `http://localhost:3000`, OR (b) Cloudflare API token to patch via API. See 🔴 ALICE.AV3.AI TUNNEL below.
- Wave 5 complete ✅
- Aria Namibia done, queues empty ✅

---

## 🎙️ Voice Pipeline — Jetson AGX Orin (2026-04-07)

**Primary node**: Jetson AGX Orin (`agx-orin`, `alice@100.76.82.8`)
**Pipeline**: Whisper STT → Piper TTS, fully local

| Component | Location | Status |
|---|---|---|
| whisper (STT) | AGX Orin `/home/alice/.local/bin/whisper` | ✅ CPU mode |
| piper (TTS) | AGX Orin `/usr/local/bin/piper` v1.2.0 | ✅ |
| Voice model | AGX Orin `/home/alice/piper-voices/en_US-lessac-high.onnx` | ✅ high quality |
| MacBook Air whisper | `/opt/homebrew/bin/whisper` | ✅ backup |
| MacBook Air piper | `~/Library/Python/3.9/bin/piper` | ✅ backup |

**Pipeline script**: `~/.openclaw/workspace-olivia/bin/voice-pipeline.sh`
- `transcribe <audio.wav>` → text (runs on AGX Orin)
- `respond "text"` → `/tmp/voice_response.wav` (runs on AGX Orin)

**Skill**: `~/.openclaw/workspace-olivia/skills/voice/SKILL.md`

**Usage**:
```bash
~/.openclaw/workspace-olivia/bin/voice-pipeline.sh transcribe /tmp/test.wav
~/.openclaw/workspace-olivia/bin/voice-pipeline.sh respond "Hello from Alice"
```

**Telegram**: Voice notes from Rob → received by me → forwarded to AGX Orin → transcribed → responded to via Piper voice note.

---

## 🔴 ALICE.AV3.AI TUNNEL — BROKEN (2026-04-06)

**Symptom**: `alice.av3.ai` returns HTTP 502. Tunnel is UP (cloudflared running) but can't reach origin.

**Root cause**: Cloudflare Zero Trust dashboard has ingress rule set to `https://localhost:3000` but Mission Control serves plain HTTP on port 3000. The TLS handshake fails: "first record does not look like a TLS handshake".

**Local config (`~/.cloudflared/config-run.yml`) correctly has `http://127.0.0.1:3000`** but the dashboard rules override local config when tunnel is managed in Zero Trust.

**Fix options (Rob must do this — needs Cloudflare account access)**:

1. **Quick fix via Cloudflare dashboard**:
   - Go to https://one.dash.cloudflare.com → Networks → Tunnels → `alice-control`
   - Edit the ingress rule for `alice.av3.ai` → change origin from `https://localhost:3000` to `http://localhost:3000`
   - Save — tunnel will reconnect automatically

2. **Alternative**: Delete the tunnel from Zero Trust dashboard and recreate via CLI:
   ```bash
   cloudflared tunnel create alice-control-new  # needs origincert setup first
   cloudflared tunnel route dns alice-control-new alice.av3.ai
   ```

**Tailscale URL still works** for direct access: `https://openclawalices-mac-mini.taila15762.ts.net`

**TLS terminator hack (in place but not working)**: A self-signed cert was created at `/tmp/localhost.{key,crt}` and a Node.js HTTPS proxy is running on port 3443. But this doesn't help since the dashboard ingress still points to port 3000 HTTPS. Rob must fix the dashboard.
  - **A.L.I.C.E. | Control** (builderz-labs/mission-control @ ~/mission-control on Mac Mini):
    - Running localhost:3000, PM2 managed ✅
    - Cloudflare Tunnel (Docker, container: blissful_kare) → alice.av3.ai ✅ LIVE
    - Full rebrand + dark branded login ✅
    - Accounts: admin / AliceMc2026! | rob / AliceMc2026! ✅
    - OpenClaw Gateway connected to MC ✅
  - **alice.av3.ai**: NOW SERVES MC FROM MAC MINI (old Vercel redirect/tunneled) ✅
  - **SSH Fleet**: ubuntu-desktop ✅ mac-studio ✅ mac-mini ✅ macbook-air ✅ agx-orin ✅
  - **Supabase**: Still running but NOT used by MC (old mc-bridge) — can be decommissioned later
  - **Telegram**: @Alice_minibot on Mac Mini ✅
  - **MiniMax M2.7 HighSpeed**: Mac Mini ✅ Mac Studio ✅ MacBook Air ✅

---

## ✅ SYSTEMS WORKING

### A.L.I.C.E. Web Properties
- **alice.av3.ai** ✅ LIVE — A.L.I.C.E. | Control (mc-final, Next.js 16.1.6, deployed 2026-04-06). `/api/v1/status` returns real cluster health (Supabase + Ollama checks, fleet count, event count). `next.config.js` outputFileTracingExcludes fixed (object format).
- **alice-hq.vercel.app** ✅ LIVE — Claw3D HQ (re-deployed 2026-03-27)
- **getalice.av3.ai** ✅ LIVE — Landing page (rebranded to 30 specialists, A.L.I.C.E. | Control)
- **clients.av3.ai** ✅ LIVE — client portal with all 10 products
- **dzombo.av3.ai** ✅ LIVE — client site

### SSH Access (Updated 2026-04-03) — ALL 5 NODES WORKING ✅
**~/.ssh/config** — all scripts use this:
```
Host ubuntu-desktop
  HostName 100.106.110.119
  User alpha
  IdentityFile ~/.ssh/id_ed25519_alice_tailscale
  StrictHostKeyChecking no

Host mac-studio openclaws-mac-studio
  HostName 100.115.74.106
  User alice
  IdentityFile ~/.ssh/alice_auto
  StrictHostKeyChecking no

Host mac-mini openclawalices-mac-mini
  HostName 100.107.132.71
  User openclawalice
  IdentityFile ~/.ssh/alice_auto
  StrictHostKeyChecking no

Host macbook-air
  HostName 100.101.241.124
  User aliceclaw
  IdentityFile ~/.ssh/alice_auto
  StrictHostKeyChecking no
```

**SSH Keys:**
- `~/.ssh/id_ed25519_alice_tailscale` — Ubuntu Desktop
- `~/.ssh/alice_auto` — Mac Studio/Mac Mini/MacBook Air/AGX-Orin (passphrase-less)
- Both in ssh-agent at session start

**Tailscale SSH:** `tailscale ssh alpha@ubuntu-desktop` — cert-based, no key needed

**AGX-Orin:** ✅ `ssh agx-orin` (alice@100.76.82.8) — 61GB RAM, NVIDIA Orin GPU, Ollama with 15 models

### KidSpark (Moved to Ubuntu Desktop — 2026-04-07)
- **Project location**: `/home/alpha/kidspark/` on Ubuntu Desktop ✅
- **App**: `/home/alpha/kidspark/app` — Next.js 16, running via `npm run dev` or Vercel deploy
- **Deploy**: `vercel deploy --prod --yes --token <VERCEL_TOKEN>` from `/home/alpha/kidspark/app`
- **Live URL**: https://kidspark-ai.vercel.app ✅
- **Ollama**: Mac Studio at `http://openclaws-mac-studio.taila15762.ts.net:11434` (models loaded)
- **SDXL Turbo**: Ubuntu Desktop at `http://localhost:7860` ✅
- **Supabase**: `xsrzharqfqooovnyuwbr` ✅
- **API routes built** (2026-04-07): journal, mood, stickers, stickers/trades, battle/gallery
- **✅ Migration complete** (2026-04-07): journal_entries, mood_entries, sticker_ownership, sticker_trades, art_battles all live

### Image Generation (Ubuntu Desktop)
- SDXL Turbo at port 7860 ✅ healthy
- `POST /generate` + `GET /view/{filename}` + `GET /health` — all working
- Current tunnel: Localtunnel (unstable) — needs permanent tunnel solution
- KidSpark client fixed: `lib/image-gen/diffusers.ts` (was using ComfyUI API, now uses correct Diffusers API)

## Supabase Relay + AliceFleet Phases 2-3 (DONE — code deployed, schema partial)
- ✅ `gateway_connections` migration ready (public schema)
- ✅ API routes: /api/gateway/register, /api/gateway/heartbeat, /api/gateway/status, /api/gateway/delete
- ✅ GatewayConnect wizard UI using Supabase relay
- ✅ Phase 2: `/api/alicefleet/validate` + `/api/alicefleet/license` + `alicefleet.user_licenses` migration
- ✅ getalice.av3.ai `/api/license/validate` updated: POST support + alicefleet.user_licenses query + graceEligible on 500
- ✅ Stripe webhook updated: also writes to `alicefleet.user_licenses` on purchase (bridges legacy Stripe flow → new system)
- ✅ Phase 3 backend: `alicefleet.node_configs` + `agent_roster_versions` migrations, `/api/alicefleet/push`, `/api/alicefleet/push/applied`, `useNodeRealtime` hook
- ✅ Phase 4: `GET /api/cloud/status` + CloudSyncStatusCard in settings; stripe webhook bridges to alicefleet.user_licenses
- ✅ Phase 5 backend: `alicefleet.devices` migration, POST/GET/PATCH `/api/alicefleet/devices`, CRM + billing tables
- ✅ Phase 5 UI: Fleet page with Push Config, Push Roster Update, node detail panel, online/offline counts; CRM with pipeline stages + add forms; Billing with MRR/ARR metrics + plan badges; `supabase/migrations/README.md` with migration guide for Rob
- ✅ **alicefleet.* tables confirmed exist** — `gateway_connections` ✅, `gateway_events` ✅ (has `event_type` column: `agent.session.started`, `agent.session.completed`, `event`), `alicefleet.user_licenses` ✅, `alicefleet.devices` ✅, `alicefleet.node_configs` ✅, `alicefleet.agent_roster_versions` ✅. Seed key `ALICE-PRO2-026S-EEDK` may still need INSERT — run if license validation fails:
  ```sql
  INSERT INTO alicefleet.user_licenses (license_key, plan, status, agents)
  VALUES ('ALICE-PRO2-026S-EEDK', 'pro', 'active',
    '["nadia","felix","morgan","dylan","selena","devon","quinn","daphne","rowan","aria","owen","marcus","theo","claire","sage","blake","reese","casey","jamie","kai","alex"]'::jsonb)
  ON CONFLICT (license_key) DO NOTHING;
  ```

### Aria Autonomous Research
- Namibia Sprint 4 ✅ COMPLETE
- BLLM Sprint 3 ✅ COMPLETE
- Queues empty — awaiting next sprint

### Infrastructure
- **Supabase Cloud**: alicefleet-prod (xxxgvtwnlbtdgmlgccee) ✅
- **n8n**: Running (6 active workflows)
- **Redis**: Running
- **Langfuse/Grafana/Prometheus**: Running on Ubuntu Desktop
- **SDXL Turbo**: Running on Ubuntu Desktop port 7860 (Diffusers API)
- **Qdrant**: Running on Ubuntu Desktop

### Gateway Nodes (all verified reachable from public internet):
- MacBook Air: https://robs-macbook-air.taila15762.ts.net (Funnel on, port 443)
- Mac Studio: https://openclaws-mac-studio.taila15762.ts.net (Funnel on, port 443)
- Mac Mini: https://openclawalices-mac-mini.taila15762.ts.net (Funnel on, port 443)

---

## ⚠️ BROKEN / IN PROGRESS

### 🚨 Morning Brief Alerts (2026-03-28)
- **GitHub repo unclear**: `robbiesrobotics/alice-agents` not visible to `robbiesrobotics-bot` gh account (18 org repos listed, alice-agents not among them). Repo may be under Rob's personal account or private/deleted. Rob: verify — biggest unlock for growth.
- **✅ Enterprise page LIVE at getalice.av3.ai/enterprise** (2026-04-04 confirmed 200) — NemoClaw security narrative, A.L.I.C.E. vs LangSmith Fleet comparison (6-dimension table), partner logos (Salesforce, Cisco, Google, Adobe, CrowdStrike), Jensen Huang GTC quote, SOC 2/GDPR/Air-gap badges, enterprise CTA. Nav link added. Security narrative ✅ complete.

### Supabase Schema ✅ FIXED 2026-04-04
- All alicefleet.* tables confirmed exist in DB: `agent_roster_versions`, `companies`, `contacts`, `deals`, `devices`, `invoices`, `node_configs`, `payments`, `subscriptions`, `user_licenses`
- `gateway_events` table confirmed writing (in `public` schema, accessible via PostgREST)
- `gateway_connections` has 1 connected node: Mac.fios-router.home (last heartbeat 2026-03-28)
- **License key `ALICE-PRO2-026S-EEDK` IS SEEDED** ✅ (seeded via Management API 2026-04-04 10:20 UTC)
- **PostgREST db_schema FIXED** ✅ — Updated via Supabase Management API PATCH to `public,storage,graphql_public,alicefleet`
- `alicefleet.user_licenses` confirmed accessible via PostgREST with `Accept-Profile: alicefleet` header
- Note: To access alicefleet schema tables via PostgREST with the Supabase JS client, use `supabase.schema('alicefleet').from('table_name')` or add `Accept-Profile: alicefleet` header

### MC_INGEST_TOKEN env var — RESOLVED ✅
- `MC_INGEST_TOKEN=mc_ingest_148fde21704ecdadc0c1c9d162f6720f2a3307cc` now SET in Vercel ✅
- `/api/gateway/events` auth working — returns 200-class with valid token
- Wave 4 feature-complete ✅

### Wave 5 — Data Quality Layer (DONE 2026-04-05)
- `/api/v1/ingest` now validates required fields (`source_node`, `event_type`) and rejects events missing both with HTTP 422
- Tracks in-memory quality stats: total ingested/rejected, by-node counts, by-type counts, null-field rates, empty payloads
- `GET /api/v1/ingest/stats` — data quality monitoring endpoint (Bearer token auth, same as POST)
- Rate limiting already fully implemented (loginLimiter 5/min, agentHeartbeatLimiter 30/min, etc.) — auth hardening already complete

### alice.av3.ai Smoke Test (2026-04-05 ✅)
- ✅ /api/agents (200) — 30 agents
- ✅ /api/activity (200) — live events flowing
- ✅ /api/sessions (200) — [] (no session-scoped events yet, correct)
- ✅ /health (200)
- ✅ /api/v1/ingest POST (200 with ingest token) — now validates schema + tracks quality stats
- ✅ /api/v1/ingest/stats GET (200) — data quality monitoring endpoint
- ✅ /api/gateway/events (200-class) — MC_INGEST_TOKEN now accepted, auth works ✅
- ✅ /api/alicefleet/validate (200)
- ✅ /api/fleet (404 → expected, needs mc_session+admin auth)
- ✅ /api/crm (404 → expected, needs mc_session+admin auth)
- ✅ /api/billing (404 → expected, needs mc_session+admin auth)
- ✅ /api/health (200) — stub added 2026-04-05
- ✅ /api/v1/status (200) — stub added 2026-04-05

### License Key Seeding + PostgREST ✅ FIXED 2026-04-04
- **License key `ALICE-PRO2-026S-EEDK` IS SEEDED** (seeded via Management API 2026-04-04 10:20 UTC) ✅
- **alice.av3.ai** → its own DB has key seeded ✅
- **alice.av3.ai/api/alicefleet/validate** → 200 with full license data ✅
- **PostgREST `db_schema` updated** via Management API PATCH to `public,storage,graphql_public,alicefleet` ✅
- Supabase PostgREST now exposes alicefleet schema tables. Access via `Accept-Profile: alicefleet` header.

### admin.av3.ai DNS
- NXDOMAIN — Vercel project `alice-admin` was deleted; DNS record orphaned
- Low priority — needs Rob to either redeploy or remove DNS

### DNS — robbiesrobotics.ai (Rob's domain registrar)
- A record for `alice` is still A record (76.76.21.21) instead of CNAME
- Should be CNAME to cname.vercel-dns.com for proper Vercel routing
- Rob to update in Cloudflare when convenient

---

## Vercel Projects (2026-03-27 Cleanup Done)
Active: alice, alice-hq-deploy, client-portal, dzombo-site, robbiesrobotics-ai, mc-final

## SSH Access
- Ubuntu Desktop: ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119
- Mac Studio: ssh -i ~/.ssh/id_ed25519_alice_tailscale alice@openclaws-mac-studio.taila15762.ts.net
- Mac Mini: ssh -i ~/.ssh/id_ed25519_alice_tailscale openclawalice@openclawalices-mac-mini.taila15762.ts.net

## Key Files
- Cluster manual: workspace/docs/CLUSTER.md
- Queue worker: /tmp/queue_worker_cron.sh
- Aria log: /home/alpha/alice-autonomous-researcher/aria.log
- mc-final code: /tmp/mc-final/
- alice-hq code: /Users/aliceclaw/.openclaw/workspace/apps/retro-office/
- alice-landing repo: /Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/landing/

## Supabase
- Project ref: xxxgvtwnlbtdgmlgccee
- Anon key: sb_publishable_kxs4XmTkNnLplhzB2e3G0Q_udm9hn5X
- Service role: <JWT_TOKEN>- Rob's account: robbiesrobotics@gmail.com
