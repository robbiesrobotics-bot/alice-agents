# Mission Control Page Audit — Batch 2
**Date:** 2026-03-22  
**Auditor:** Selena (Security & QA)  
**Repo:** `/Users/aliceclaw/.openclaw/workspace/apps/mission-control-web`  
**Live:** `https://alice.av3.ai`  
**Build status:** ✅ Passes after fix

---

## Summary

All 7 page groups audited. APIs tested with MC_ADMIN_TOKEN. One bug fixed (apps endpoint crashing). Several pages depend on Supabase session cookie (not just admin token) which limits curl testability. No hardcoded secrets found. Chat bridge is live and functional.

---

## Page Audits

### Page: /team
- ✅ **`/api/v1/agents` working** — Returns real agent roster from OpenClaw config (Olivia, Hannah, + others), with status, domain, lastActive, toolCallsLast7d
- ✅ **Page renders** agent cards with filter/search/sort — data is real from OpenClaw runtime
- ℹ️ **"Add to team" button** — Opens dialog pointing users to `openclaw.json` (correct behavior, no real invite flow from team page itself)
- ℹ️ `lastActive` is null for all agents (no recent sessions) — expected when gateway is offline
- **Data source:** OpenClaw runtime (real, not mocked)

---

### Page: /tools
- ✅ **`/api/mcp-servers` working** — Returns 13 real OpenClaw built-in tools (web_search, web_fetch, exec, read, write, edit, browser, canvas, message, memory_search, tts, image, pdf)
- ✅ **Tools are real** — Sourced from OpenClaw built-in tool registry, not hardcoded fake data
- ✅ **Category filtering works** — All Tools / Built-in / MCP Tools / Custom
- ℹ️ **No external MCP servers connected** — only built-ins appear; "Connect Server" dialog is UI-only (no persist endpoint wired yet)
- ℹ️ **`agentCount` field is null** for all tools — field exists in type but not populated by the API
- **Data source:** Real OpenClaw built-in tool list

---

### Page: /knowledge
- ✅ **Redirect only** — `/knowledge` redirects to `/settings?tab=knowledge` (intentional)
- ✅ **`/api/knowledge` working** — Returns `{ documents: [], total: 0 }` (empty, no docs uploaded)
- ✅ **`/api/knowledge/search` working** — POST returns results with latency metrics; uses local keyword search (model: `local-keyword-search`)
- ✅ **Upload, delete, search UI** all wired to real endpoints in settings page
- ℹ️ **No documents uploaded yet** — RAG is functional but empty
- **Data source:** Real (Supabase or local store, search is live)

---

### Page: /infra
- ✅ **`/api/v1/nodes` working** — Returns 1 node: `169.254.x.x (Local OpenClaw)`, status `offline` (Vercel deployment — expected, no local gateway reachable)
- ❌ **`/api/v1/apps` returning error** — `{ "error": "Failed to load applications" }` — Root cause: `statSync(CONFIG_PATH)` throws when `~/.openclaw/openclaw.json` doesn't exist on Vercel serverless
- ✅ **`/api/v1/environments` working** — Returns 1 env: `Local Runtime` (status: inactive)
- ✅ **`/api/v1/deployments` working** — Returns empty array (no recorded deployments)
- ⚠️ **`Mac.fios-router.home` node not visible** — The node shown is the Vercel host synthetic node; the Mac node registered via heartbeat is not persisted (ephemeral projection, no DB store)
- **Fix applied:** `getOpenClawApplications()` in `src/lib/openclaw-runtime.ts` — wrapped unguarded `statSync(CONFIG_PATH)` calls on lines 212–213 with `existsSync` guards. Both `createdAt` and `updatedAt` now fall back to `Date.now()` when config file absent. Build passes.

---

### Page: /settings (tabs: Tools, Infrastructure, Knowledge, Billing, Team)

**Tools tab:**
- ✅ Same as `/tools` page — real built-in tools listed

**Infrastructure tab:**
- ✅ Same as `/infra` — nodes/envs/deployments rendered; apps still errors (partially mitigated by fix above — will require redeploy to take effect)

**Knowledge tab:**
- ✅ Full CRUD UI connected to real endpoints

**Billing tab:**
- ✅ **`/api/v1/usage` working** — Returns real usage stats (0 runs — accurate for current period)
- ✅ **`/api/settings/plan` working** — Returns `{ plan: "pro", teamName: "Robbie's Robotics" }`
- ℹ️ **No Stripe integration** — Billing is display-only; "Cloud Add-on" learn-more button leads nowhere functional; expected for self-hosted tier
- **Data source:** Real usage from OpenClaw runtime, plan from settings API

**Team tab:**
- ❌ **`/api/team` returns 401** when called with admin token (Bearer header only)
  - Root cause: `isHostedMissionControl()` returns `true` on Vercel (detects `VERCEL` env var), so it calls `getHostedTeamResponse()` which requires Supabase session cookie (not just admin token)
  - The route expects browser session auth, not API token auth for this endpoint
  - **Not a bug per se** — design intent is Supabase auth for team management in hosted mode
  - **Impact:** Team tab in Settings will show "Failed to load team" in browser unless user is logged in via Supabase
- **Sub-routes:** `/settings/team`, `/settings/billing`, `/settings/usage` all redirect correctly to `/settings?tab=*`

---

### Page: /profile
- ✅ **`/api/v1/profile` GET working** — Returns `{ userId: null, email: "sbx_user1051@...", fullName: "sbx_user1051", editable: false, source: "local" }`
- ❌ **`/api/v1/profile` PATCH returns 401** — Requires Supabase auth session (cookie), not admin token; `if (!user) return 401`
  - Profile editing is locked for non-Supabase sessions — the UI correctly shows "editable: false" when no Supabase user
  - **Impact:** Save button disabled correctly, no data loss risk
- ✅ **Profile preview renders correctly** with initials, email, company fields
- **Data source:** `resolveRuntimeOperatorContext()` — local mode with no Supabase session → `editable: false`

---

### Page: /chat
- ✅ **Chat page renders** — `ChatWorkspace` component with `agentId` and `threadId` search params
- ✅ **`/api/chat/threads` working** — Returns 3 real threads from Supabase (`66783d00 "Gateway token test"`, `dd197107 "New conversation"`, `b98ecc55 "MC bridge test"`)
- ✅ **Chat bridge is live** — Threads are stored in Supabase; hosted mode dispatches via `runtime-command-store` → connected node → gateway
- ✅ **`/api/chat/history` working** — Returns messages for a session key; currently empty for the default user
- ℹ️ **Chat route (`/api/chat`)** does NOT have a `GET` handler — only `POST` for sending messages; 404 on GET is expected
- ℹ️ **Thread creation requires browser session** (Supabase auth cookie) for write operations

---

## Bug Fix Applied

**File:** `src/lib/openclaw-runtime.ts`  
**Function:** `getOpenClawApplications()`  
**Lines:** 212–213  
**Problem:** `statSync(CONFIG_PATH)` called unconditionally; throws `ENOENT` on Vercel when `~/.openclaw/openclaw.json` doesn't exist, causing `/api/v1/apps` to return HTTP 500  
**Fix:** Wrapped both `statSync` calls with `existsSync` guards; fallback to `Date.now()`

```typescript
// Before
createdAt: new Date(statSync(CONFIG_PATH).birthtimeMs || statSync(CONFIG_PATH).mtimeMs).toISOString(),
updatedAt: new Date(statSync(CONFIG_PATH).mtimeMs).toISOString(),

// After
createdAt: new Date(existsSync(CONFIG_PATH) ? (statSync(CONFIG_PATH).birthtimeMs || statSync(CONFIG_PATH).mtimeMs) : Date.now()).toISOString(),
updatedAt: new Date(existsSync(CONFIG_PATH) ? statSync(CONFIG_PATH).mtimeMs : Date.now()).toISOString(),
```

---

## Known Issues (Not Fixed — Require Design Decision)

| Issue | Severity | Notes |
|-------|----------|-------|
| `/api/team` returns 401 for admin token | Medium | Hosted mode requires Supabase session cookie; by design for team management |
| `/api/v1/profile` PATCH returns 401 for admin token | Low | Same — profile edit requires real auth session; UI correctly disables edit |
| `Mac.fios-router.home` node not shown | Medium | Node heartbeats go to projection files, not persisted DB — ephemeral, cleared on each Vercel cold start |
| Usage stats all zeros | Low | Accurate — no recent agent runs; not mocked |
| MCP server "Connect" button has no persist endpoint | Low | UI-only dialog; `serverName`/`serverUrl` state is never submitted to API |
| `agentCount` field null on all tools | Low | `/api/mcp-servers` route doesn't compute agent↔tool mapping |

---

## Security Notes

- ✅ Admin token is used correctly (timing-safe compare with `safeCompare`)  
- ✅ No hardcoded secrets in page code
- ✅ Rate limiting applied to `/api/knowledge/search`, `/api/chat`, `/api/v1/ingest`
- ✅ CSP headers present on all responses
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` visible in `.env.local` — ensure this file is not committed to git (standard practice)
- ⚠️ `VERCEL_OIDC_TOKEN` in `.env.local` is short-lived (expired); non-issue for current runtime

---

## Build Status

```
✅ npm run build — SUCCESS (after fix)
No TypeScript errors, no failed routes
```
