# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._

<!-- Entries below, newest first -->

### 2026-03-21 — Audited A.L.I.C.E. ecosystem across web, admin, package, and landing surfaces
- **Outcome:** success
- **What worked:** Combining live browser/HTTP checks with local lint/test/build runs and targeted git-history review produced a much more honest audit than any single method.
- **What to improve:** For auth-gated apps, explicitly capture post-login evidence earlier when a valid session exists; otherwise more time goes to inference from code.
- **Reusable pattern:** For product audits, separate each surface into live availability, local code quality, recent-change history, and mock-vs-real data provenance.


### 2026-03-20 — Added MCP discovery regression coverage for Mission Control web
- **Outcome:** success
- **What worked:** extracting the MCP discovery logic into a small pure helper module made it straightforward to cover runtime metadata shapes, persisted fallback, dedupe/sort behavior, and empty-result handling with deterministic Node tests.
- **What to improve:** when adding discovery logic that depends on runtime config plus persistence, build the pure selection/normalization layer separately from the service wrapper from the start.
- **Reusable pattern:** for service modules that mix framework aliases and async data sources, move the matching/normalization algorithm into a dependency-injected helper (`discover*FromSources`) and keep the outer module responsible only for wiring real dependencies.

### 2026-03-20 — Added RBAC operator-resolution regression tests for Mission Control web
- **Outcome:** success
- **What worked:** extracting the pure role-resolution logic into a tiny helper module made it easy to test admin/operator/viewer fallback behavior with Node\'s built-in test runner, without pulling in Next.js alias/runtime dependencies.
- **What to improve:** if more auth/RBAC logic grows here, add a dedicated unit-testable core layer earlier instead of relying on inline data or late extraction.
- **Reusable pattern:** for Next app server utilities that are hard to import in plain Node tests, isolate the decision logic into a dependency-injected `*-core.ts` helper and keep framework/Supabase wiring in the outer module.
### 2026-03-20 — Mission Control overnight continuation final QA pass
- **Outcome:** success
- **What worked:** Combined lightweight HTTP probes with a quick browser shell check to verify both rendered routes and JSON health endpoints on a live Next dev instance.
- **What to improve:** Start from repo route discovery sooner so probes target actual API paths (`/api/v1/health` vs nonexistent `/api/health`).
- **Reusable pattern:** For late-stage smoke QA on local Next apps, validate (1) key route 200s, (2) login shell render, (3) one canonical health endpoint, and (4) browser console for runtime errors.

### 2026-03-29 — New User E2E Flow Test (alice.av3.ai)
- **Outcome:** partial — site is up and polished but has critical API routing bug
- **What worked:** Parallel curl testing + HTML inspection gave comprehensive coverage fast. Checking both SSR HTML content and API responses revealed the catch-all route swallowing API paths.
- **What to improve:** Should have tried browser automation earlier to see the actual JS-rendered pages (many elements are client-side only). curl only shows SSR output.
- **Reusable pattern:** When testing Next.js apps on Vercel, always verify that catch-all routes (`[[...slug]]`) don't swallow `/api/*` paths. Test API routes with curl separately from page routes.
