# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._
_Olivia periodically reviews these and promotes the best patterns into PLAYBOOK.md._

<!-- Entries below, newest first -->

### 2026-03-20 — Mission Control port/process audit on mixed dev+PM2 host
- **Outcome:** success
- **What worked:** Combining a localhost HTTP probe with `pm2 describe` and a short `npm run dev -- --port 3000` launch attempt quickly separated “port is dead” from “port is occupied by a healthy service.”
- **What to improve:** Keep standard host utilities (`lsof` or `netstat`) available, or add an app status script, because process-to-port attribution on this Mac was more awkward than it needed to be.
- **Reusable pattern:** When `next dev` claims `EADDRINUSE`, verify the port with `curl` first, then identify whether PM2 or another app already owns the port before taking restart action.

### 2026-03-20 — Mission Control build/runtime validation with live smoke test
- **Outcome:** partial
- **What worked:** Running unit/build validation separately from live `test:ci` distinguished code health (clean build/tests) from runtime API drift on the already-running dev server.
- **What to improve:** Capture failing smoke responses with status/body on first failure so overnight checks can pinpoint whether breakage is auth/env drift, missing write-path support, or stale runtime state without extra probing.
- **Reusable pattern:** For an active Next.js app, check `git status` for mutable data artifacts, run `npm test` and `npm run build`, then run the live smoke suite against localhost to detect server/runtime mismatches that static build checks will miss.

### 2026-03-20 — Mission Control dev server overnight health check
- **Outcome:** success
- **What worked:** HTTP probe on localhost:3000 plus API smoke test quickly confirmed runtime health without restarting anything.
- **What to improve:** Keep a lightweight status endpoint or PID file for the dev server so process-to-port attribution is less indirect on hosts missing lsof/netstat.
- **Reusable pattern:** For Next.js overnight checks, verify root 200, fetch rendered HTML for app identity, then run targeted smoke tests against the live local URL before considering a restart.
### 2026-03-20 — Mission Control runtime/dev check
- **Outcome:** success
- **What worked:** Validated live port behavior with direct curl checks and used process polling to confirm build failure was only the active `.next/lock` from a running Next instance.
- **What to improve:** Keep a known-good port/process inspection command handy on macOS environments missing `lsof`/`netstat`.
- **Reusable pattern:** When `next build` fails on `.next/lock`, first verify whether an active dev/prod server is already healthy before restarting or deleting build artifacts.
### 2026-03-20 — Mission Control server/migration overnight ops check
- **Outcome:** success
- **What worked:** Verified app liveness directly with `curl` when `lsof`/`rg` were unavailable; used Supabase REST with the service-role key from `.env.local` to confirm the latest schema table existed without needing Docker or a linked CLI project.
- **What to improve:** Keep a lightweight port-inspection fallback documented for macOS environments missing `lsof`, and standardize a repo-local migration verification script so checks do not depend on ad hoc commands.
- **Reusable pattern:** If `supabase status`/`migration list` is blocked by Docker or missing link state, confirm migration application by checking the target table/endpoint over PostgREST with service-role auth.

### 2026-03-28 — 24/7 Autonomous Operations Plan for 5-Brand Kids' AI Platform
- **Outcome:** success
- **What worked:** Building from prior infrastructure research (same-day memory file), structuring by operational phase (build → ops → scale), grounding cost estimates in real pricing data
- **What to improve:** Could add more detail on inter-agent handoff protocols and failure modes for agent coordination
- **Reusable pattern:** For multi-brand/multi-tenant operational plans, structure as: Agent Roles → Automation Workflows → Cron Schedule → Escalation Matrix → Dashboard → Cost Model → Scaling Triggers. This hierarchy covers everything ops needs.

### 2026-03-28 — KidSpark Multi-Brand Operations Hub Config Pack
- **Outcome:** success
- **What worked:** Reviewed actual project structure (PROJECT.md, n8n workflows, app structure) before writing configs — resulted in accurate references to real paths, ports, services, and workflow schedules
- **What to improve:** Could have also checked if PM2, Caddy, or cloudflared were already installed on Mac Mini
- **Reusable pattern:** For operations config packs, always audit the existing codebase/workflows first to align configs with actual service names, ports, and file paths
