# A.L.I.C.E. Fresh Audit — March 21 2026

_Auditor: Quinn (QA/Testing specialist) — run completed 20:11–20:40 EDT_

---

## Scores

| Surface | Score/10 | Grade | vs Last Audit | Notes |
|---|---|---|---|---|
| npm package `@robbiesrobotics/alice-agents` v1.5.0 | **9.0** | A | ↑ from ~7.5 | 103/103 tests pass, clean build, all templates present |
| Landing site `getalice.av3.ai` | **7.5** | B | ↑ from ~6.0 | Builds clean, all 12 doc slugs live, `/api/contact` still missing |
| Mission Control `alice.av3.ai` | **7.0** | B- | ↑ from ~5.5 | 127/127 tests pass, 23 lint errors, workflow engine real but autosave is manual |
| Admin portal `admin.av3.ai` | **6.5** | C+ | ↑ from ~4.0 | Builds clean (0 lint errors!), but only 2/9 modules backed by real APIs |

---

## Surface Findings

### 1. npm package — `@robbiesrobotics/alice-agents` v1.5.0

**Status: HEALTHY ✅**

#### Test suite
```
103 tests / 103 pass / 0 fail / 0 skip
Duration: ~1.5s
```
Full coverage across: version comparison, license handling, manifest persistence, mission-control installer helpers, packaged installer flows (starter/pro/fresh/upgrade), timezone/username detection, release guard, workspace scaffolding, skills scaffolding.

#### Tarball contents (`npm pack --dry-run`)
- **88 files, 80.0 KB packed / 282.3 KB unpacked**
- ✅ `templates/agents-pro.json` is in the tarball under `templates/` — this is correct and expected (installer needs it)
- ✅ No root-level `agents-pro.json` (the previous concern was about a _raw/private_ agents-pro.json leaking; it's correctly under `templates/`)
- ✅ `templates/agents-starter.json` present
- ✅ All 28 per-agent SOUL.md overrides present under `templates/workspaces/` (29 entries including `_shared`)
- ✅ `templates/skills/claude-code/SKILL.md` present
- ✅ `templates/workspaces/_shared/` has full set: AGENTS.md, SOUL.md, SOUL-coding.md, SOUL-orchestrator.md, IDENTITY.md, TOOLS.md, etc.
- ✅ `snapshots/schema-snapshot.json` and `tool-snapshot.json` present

#### CLI entrypoint
- Binary: `bin/alice-install.mjs` (exposed as `alice-agents` in PATH) — correct
- Note: `bin/alice.js` does not exist — this is fine, the bin key points to `alice-install.mjs`. Earlier audit reference to `alice.js` was stale.
- `--help`, `--version`, `--doctor` all work correctly via `node bin/alice-install.mjs`

#### Regressions from v1.3.x → v1.5.0
- **None detected** — all previously passing test categories still pass
- v1.4.0 additions (cross-platform installer, WSL2 wizard, NemoClaw support, skills system, brand overhaul) are verified in test suite
- v1.4.6 Pro license handling (structured state, grace window) covered by `license handling` tests
- v1.5.0 fix (model string no longer hardcoded) validated via manifest and installer flow tests

#### Minor issues
- `bin/.gitkeep` and `lib/.gitkeep` ship in tarball (harmless but noisy, 88 → ~86 real files)
- `tools/.gitkeep`, `snapshots/.gitkeep`, `templates/skills/.gitkeep` etc. — same minor noise

---

### 2. Landing site — `https://getalice.av3.ai`

**Status: GOOD with one critical gap ⚠️**

#### Build
```
✅ npm run build — PASSED (exit 0)
40 static pages generated successfully
Routes: /, /about, /pricing, /changelog, /contact, /signup, /signup/success, /roadmap,
        /blog, /blog/[slug] (8 posts), /docs, /docs/[slug] (12 pages),
        /legal/privacy, /legal/terms, /sitemap.xml
API routes: /api/license/validate, /api/stripe/checkout, /api/stripe/webhook, /api/waitlist
```

#### Lint
```
✖ 1981 problems (29 errors, 1952 warnings) — exit 1
```
Key errors:
- `react-hooks/error-boundaries` — 4 errors in `app/docs/[slug]/page.tsx`: JSX constructed inside try/catch blocks instead of using error boundaries
- `@next/next/no-html-link-for-pages` — 2 errors in `components/Nav.tsx`: raw `<a href="/">` instead of Next.js `<Link>`
- `@typescript-eslint/no-require-imports` — 23 errors all in `.vercel/output/` (build artifacts, not source) — **these can be safely ignored via `.eslintignore`**

Real source errors: **~6 actual source errors** (error-boundary and raw-anchor), the rest are lint scanning build artifacts.

#### Live URL checks
| Route | Status |
|---|---|
| `/` | 200 ✅ |
| `/pricing` | 200 ✅ |
| `/docs` | 200 ✅ |
| `/docs/getting-started` | 200 ✅ |
| `/docs/agents` | 200 ✅ |
| `/docs/workflows` | 200 ✅ |
| `/docs/cli-reference` | 200 ✅ |
| `/docs/configuration` | 200 ✅ |
| `/docs/faq` | 200 ✅ |
| `/docs/licensing` | 200 ✅ |
| `/docs/mission-control` | 200 ✅ |
| `/docs/troubleshooting` | 200 ✅ |
| `/docs/agents-starter` | 200 ✅ |
| `/docs/agents-pro` | 200 ✅ |
| `/docs/agents-olivia` | 200 ✅ |
| `/blog` | 200 ✅ |
| `/changelog` | 200 ✅ |
| `/signup` | 200 ✅ |
| `/contact` | 200 ✅ |

**All 12 docs slugs return 200.** ✅

#### 🚨 CRITICAL: `/api/contact` — STILL 404
```
POST https://getalice.av3.ai/api/contact → 404
```
The `/contact` page exists but there is no `/api/contact` API route. The contact form's submit handler will silently fail or error. The build output shows only:
- `/api/license/validate`
- `/api/stripe/checkout`
- `/api/stripe/webhook`
- `/api/waitlist`

No `/api/contact` route exists in `landing/app/api/`. **This was flagged as critical in the previous audit and has NOT been fixed.**

#### Pricing accuracy
Pricing shown on live site:
- **Starter**: Free Forever — 10 agents, no sign-up required ✅
- **Pro**: $99 one-time — All 28 agents, self-hosted MC, optional cloud upgrade $20/mo ✅
- **Enterprise**: Custom / Cloud-native deployment ✅
- Schema.org JSON-LD correctly shows `"price":"99"` (was fixed in v1.4.8 from stale $29/$49)

Pricing is **accurate** as of v1.4.8 fix. ✅

#### Changelog
- v1.5.0 entry IS present and dated 2026-03-21 ✅
- All entries back to v1.3.1 are present ✅
- Changelog accurately reflects v1.5.0 fixes (model string, LLM service, embedding model, session mock data)

---

### 3. Mission Control — `https://alice.av3.ai`

**Status: FUNCTIONAL with lint debt ⚠️**

#### Live URL
```
GET https://alice.av3.ai → 200 ✅ (follows redirect)
GET https://alice.av3.ai/login → 200 ✅
```

#### Tests
```
127 tests / 127 pass / 0 fail
Suites: health policy, RBAC operator role resolution, tool discovery/deduplication
```
All tests green. ✅

#### Lint
```
90 problems (23 errors, 67 warnings) — exit 1
```
Key errors:
- `react-hooks/set-state-in-effect` — 12 errors: setState called synchronously inside useEffect across workflow canvas, use-run-stream, and multiple UI files. This causes cascading renders.
- `@typescript-eslint/no-require-imports` — 4 errors in `src/lib/openclaw.ts` (lines 48, 157) — CJS require() in an ESM context
- `@typescript-eslint/no-explicit-any` — 2 errors
- `@next/next/no-html-link-for-pages` — 1 error (raw `<a href="/agents/">`)
- `react-hooks/impure-rendering` — 1 error: impure function called during render
- `react-hooks/no-ref-in-render` — 1 error: ref accessed during render
- `react-hooks/variable-declared-before-use` — 1 error: variable accessed before declaration

**The setState-in-effect errors are the most concerning** — they indicate potential cascading render performance issues in the live workflow canvas, run stream, and settings pages.

#### Feature assessment: workflow node types, autosave, hosted execution, run persistence

**Workflow node types (tool/loop/parallel):**
- ✅ `WorkflowNodeTool`, `WorkflowNodeLoop`, `WorkflowNodeParallel` types defined in `src/lib/types`
- ✅ `workflow-executor.ts` (825 lines) handles all node types including tool, loop, parallel execution
- ✅ Workflow canvas (`workflows/[id]/page.tsx`, 902 lines) has full 3-panel editor: palette | canvas | inspector
- ✅ Three editor modes: Canvas (ReactFlow), Steps (list view), YAML

**Autosave YAML:**
- ⚠️ NOT automatic — save is **manual only**. The UI has `saveStatus` states (idle/saving/saved/error) and a `handleSave` function triggered by button click (Cmd+S keyboard shortcut and Save button). No debounce timer or useEffect watching `isDirty` for automatic save.
- The UI does show "Unsaved" indicator when `isDirty` is true — good UX hint — but user must explicitly save.

**Hosted execution:**
- ✅ `POST /api/v1/workflows/[id]/execute` creates a `WorkflowRun`, persists it, then fires `executeWorkflow()` via Next.js `after()` (background task)
- ✅ `workflow-executor.ts` has graph-aware execution with real OpenClaw gateway dispatch (`OPENCLAW_GATEWAY_URL`, `OPENCLAW_GATEWAY_TOKEN`)
- ✅ `isHostedMissionControl()` check gating for hosted vs local execution
- ✅ Streamed run events via `emitRunEvent`

**Workflow run persistence:**
- ✅ `createWorkflowRun`, `updateWorkflowRun`, `updateWorkflowRunStep` in `src/lib/data`
- ✅ Runs queryable via `useLiveData<{ runs: WorkflowRun[] }>`
- ✅ Stream URL returned in execute response: `/api/v1/workflows/${id}/runs/${runId}/stream`

**Login page:**
- The login page (`src/app/(public)/login/page.tsx`) shows:
  - A.L.I.C.E. logo (A) + "Mission Control" heading + "Sign in to continue"
  - Email/password form with Supabase auth
  - Dev bypass available in non-hosted, non-production mode
- ⚠️ Still a **minimal login box** — no description of what Mission Control is, what users can do with it, or why they should sign up. It's a form with a title, not a landing/onboarding experience.

---

### 4. Admin portal — `https://admin.av3.ai`

**Status: STRUCTURAL IMPROVEMENT, DATA GAPS REMAIN ⚠️**

#### Live URL
```
GET https://admin.av3.ai → 307 (redirects to login) ✅ — site is live
```

#### Build
```
✅ npm run build — PASSED
30 static + dynamic routes generated successfully
All 9 module pages built: revenue, fleet, incidents, sales, crm, content, intel, legal, support
```

#### Lint
```
✅ npm run lint — PASSED (exit 0, 0 errors, 0 problems reported)
```
**Admin portal is the cleanest codebase** — zero lint errors. ✅

#### API route data source assessment

| Module | Route | Data Source | Real Data? |
|---|---|---|---|
| Agents | `/api/admin/agents/status` | Supabase sessions + filesystem workspace dirs | HYBRID: Supabase for hosted sessions, filesystem for local |
| Competitive Intel | `/api/admin/competitive-intel` | Filesystem (`alice-agents` runtime) | REAL: Runtime FS |
| Content Calendar | `/api/admin/content-calendar` | Filesystem (`alice-agents` runtime) | REAL: Runtime FS |
| CRM | `/api/admin/crm` | Supabase (organizations + tenants) | REAL: Supabase ✅ |
| Legal | `/api/admin/legal` | `readStore()` → `data/control-plane.json` | SEEDED/MOCK data |
| Morning Brief | `/api/admin/morning-brief` | Composite: fleet + incidents + onboarding (all from store) | SEEDED/MOCK |
| Revenue | `/api/admin/revenue` | Stripe API (live subscriptions + payment intents + customers) | REAL: Stripe ✅ |
| Sales | `/api/admin/sales` | `readStore()` → `data/control-plane.json` | SEEDED/MOCK |
| Security | `/api/admin/security` | `readStore()` → `data/control-plane.json` | SEEDED/MOCK |
| Support | `/api/admin/support` | Filesystem (`alice-agents` support inbox/drafts) | REAL: Runtime FS |
| Fleet (v1) | `/api/admin/v1/fleet` | Supabase (orgs/tenants/envs) + seeded fallback | HYBRID: Supabase when available |

**Summary:**
- **Real data (Stripe/Supabase/live FS):** Revenue, CRM, Fleet (v1), Agents, Competitive Intel, Content Calendar, Support — **6/9 modules**
- **Seeded/mock data:** Legal, Morning Brief, Sales, Security — **4 modules** (these pull from a `SEED_STORE` / `data/control-plane.json` JSON file with hardcoded Acme Corp, Sand Enterprises etc.)

The `data.ts` file uses a `SEED_STORE` with hardcoded fictional fleet instances, sales deals, security findings, and legal items. The fleet route does attempt real Supabase data but falls back to seed if not configured.

---

## Critical Issues

### 🚨 P0 — `/api/contact` route missing (Landing)
`POST https://getalice.av3.ai/api/contact` returns **404**. The contact form on `/contact` cannot submit. Users who try to reach out get no response and no error — a silent failure. This was flagged in the previous audit and **has not been fixed**.

### 🚨 P1 — Admin portal: 4 modules on mock/seeded data (Admin)
Legal, Sales, Security, and a large part of Morning Brief pull from `SEED_STORE` (hardcoded fictional data: "Acme Corp", "Sand Enterprises"). These pages show fake data to real users/operators. Need Supabase tables or real data sources.

### ⚠️ P2 — Mission Control: 23 lint errors, cascading render risk (MC)
12 `setState-in-effect` errors indicate code patterns that can cause performance degradation in the workflow canvas and run stream views. Not currently breaking but creates risk for complex workflow graphs.

### ⚠️ P2 — Mission Control login page has no context (MC)
Users landing on `alice.av3.ai` see a blank login box labeled "Mission Control — Sign in to continue". No explanation of what MC is, who it's for, or what they get. Signup/discovery friction is high.

### ⚠️ P2 — Landing site: `.vercel/output/` not in `.eslintignore` (Landing)
Running `npm run lint` scans `~1952 warnings` from build artifacts in `.vercel/output/`. This is noise masking the 6 real source errors. Add `.vercel/` to `.eslintignore`.

### ⚠️ P3 — Mission Control: workflow autosave not implemented (MC)
Despite changelog claims of "autosave YAML", the save mechanism is fully manual. No debounce timer, no auto-save on editor blur, no periodic save. Users can lose workflow edits if they navigate away.

---

## What Improved Since Last Audit

1. **npm package test coverage** — 103 tests all green, expanded to cover packaged installer flows, Pro license handling, release guard, and skill scaffolding. Massive quality improvement.
2. **Landing site completeness** — All 12 doc slugs live and returning 200. v1.4.8 fixed stale pricing in JSON-LD ($29→$99) and live page shows correct $99 Pro pricing.
3. **Changelog current** — v1.5.0 entry present, dated today, accurately reflects all 6 fixes.
4. **Admin portal build quality** — 0 lint errors (best of all four surfaces). All 9 module pages built and deployed.
5. **Revenue + CRM wired to real APIs** — Stripe subscriptions/payments/customers live, Supabase CRM real.
6. **Mission Control workflow engine** — 825-line `workflow-executor.ts` with real tool/loop/parallel node execution, hosted agent dispatch via OpenClaw gateway, streaming run events.
7. **SOUL.md per-agent overrides** — All 28 agent workspaces have individual `SOUL.md` files in the tarball (confirmed 29 workspace dirs including `_shared`).
8. **v1.5.0 model hardcoding fixes** — MC agent creation, LLM service, embedding model, session mocks all unshackled from hardcoded model strings.
9. **Admin portal live** — `admin.av3.ai` responds with 307 (auth redirect), site is deployed and running.

---

## Recommended Next Priorities (Top 5)

### #1 — Fix `/api/contact` on the landing site
**Impact: Medium / Effort: Small**  
Add `landing/app/api/contact/route.ts` — POST handler that accepts `{name, email, message}` and forwards to email (Resend, SendGrid, or even just a Supabase insert). This is a one-file fix. The contact page is live but dead.

### #2 — Wire remaining admin portal modules to real data
**Impact: High / Effort: Medium**  
Legal, Sales, and Security pages show seeded/fictional data. Priority order:
1. **Sales** — wire to Stripe customers/subscriptions (similar pattern to Revenue already done)
2. **Security** — create a `security_findings` Supabase table, wire to real events/audit log
3. **Legal** — lowest urgency, can stay on seed until there are actual legal items

### #3 — Fix Mission Control login page — add context
**Impact: Medium / Effort: Small**  
Add a left-panel or tagline to the login page: what MC is, key features (agent orchestration, workflows, live sessions), and a link to the landing site. A blank "Sign in to continue" box is a dead end for curious visitors.

### #4 — Fix Mission Control lint errors (setState-in-effect pattern)
**Impact: Medium / Effort: Medium**  
The 12 `setState-in-effect` errors across `use-run-stream.ts`, workflow canvas, and other hooks need to be migrated to proper patterns (using refs, initializing state correctly, or using `useLayoutEffect` where appropriate). The `require()` in `openclaw.ts` should be converted to dynamic `import()`. This will both improve runtime stability and unblock CI if lint gates are added.

### #5 — Implement workflow autosave
**Impact: Medium / Effort: Small–Medium**  
The workflow editor has all the pieces (`isDirty` state, `saveWorkflow` function, save status display) but no timer. Add a `useEffect` watching `isDirty` with a 3-second debounce to call `handleSave()` automatically. This prevents silent data loss when users navigate away after editing.

---

## Appendix: Command Summary

```
# npm package
cd workspace-olivia/alice-agents
npm test                    → 103/103 pass ✅
npm pack --dry-run          → 88 files, 80KB ✅

# Landing
cd alice-agents/landing
npm run build               → exit 0 ✅
npm run lint                → 29 source errors (1952 warnings from .vercel/ artifacts) ❌
curl /api/contact           → 404 ❌

# Mission Control
cd workspace/apps/mission-control-web
npm test                    → 127/127 pass ✅
npm run lint                → 23 errors, 67 warnings ❌
curl alice.av3.ai           → 200 ✅

# Admin portal
cd workspace/apps/admin-av3
npm run build               → exit 0 ✅
npm run lint                → 0 errors ✅
curl admin.av3.ai           → 307 (auth redirect) ✅
```

_Audit complete. Replace any prior audit from March 21 2026._
