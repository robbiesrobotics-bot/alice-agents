# Mission Control Workflow System — Production Readiness Audit
**Date:** 2026-03-22  
**Auditor:** Quinn (QA Engineering Lead)  
**Base URL:** https://alice.av3.ai  
**Auth:** MC_ADMIN_TOKEN (Bearer)  
**Scope:** End-to-end test of the workflow API and UI

---

## Executive Summary

The workflow system is **largely production-ready** at the API level. Core CRUD, execution, streaming, and cancellation all work correctly. There are several notable gaps: `PATCH` is not supported (405), the global run list endpoint `/api/v1/workflow-runs` returns empty (0 runs) despite runs existing per-workflow, and webhooks require the workflow to be `active` status (not just `draft`). UI testing was blocked by Supabase login — the isolated browser cannot authenticate.

**Overall Score: 7.5/10 — Functional with known gaps**

---

## 1. Workflow List (`/api/v1/workflows`)

### GET /api/v1/workflows
- **Status:** ✅ Pass — HTTP 200
- **Returns:** 27 workflows with full data shapes
- **Fields present:** `id`, `name`, `description`, `status`, `trigger`, `triggerConfig`, `steps`, `nodes`, `edges`, `agents`, `projectId`, `createdAt`, `updatedAt`, `lastRunAt`, `runCount`
- **Field notes:**
  - `steps` is always `[]` (appears unused — nodes/edges are used instead)
  - `agents` is always `[]` (no agent assignments at workflow level)
  - `triggerConfig` is always `null` (trigger config is embedded in node data instead)
  - `projectId` is always `null` (multi-tenancy not yet wired)
- **Sample data:** Mix of "Untitled Workflow" stubs, "Daily Briefing" templates, "SmokeWorkflow" test artifacts, QA Playwright runs, and "Customer Support Triage" live workflow
- **Concern:** Many stale `Untitled Workflow` entries with no nodes — no cleanup or archiving mechanism visible

### GET /api/v1/workflow-templates
- **Status:** ✅ Pass — HTTP 200
- **Returns:** 10 templates across 5 categories:

| Template ID | Name | Category | Trigger |
|---|---|---|---|
| tpl-daily-briefing | Daily Briefing | productivity | cron |
| tpl-pr-review | PR Review Chain | engineering | webhook |
| tpl-support-triage | Customer Support Triage | support | webhook |
| tpl-research-write | Research Write Publish | content | manual |
| tpl-competitor-monitor | Competitor Monitor | intelligence | cron |
| tpl-code-test-deploy | Code Test Deploy Check | engineering | webhook |
| tpl-meeting-actions | Meeting Notes to Action Items | productivity | manual |
| tpl-security-audit | Security Audit | security | cron |
| tpl-user-onboarding | New User Onboarding | operations | event |
| tpl-incident-response | Incident Response | operations | webhook |

- **Field notes:** Templates include full node/edge definitions. No `description` field at template level is missing (it IS present). `event` trigger type appears in `tpl-user-onboarding` but is likely not implemented in the runtime engine.

---

## 2. Create Workflow

### POST /api/v1/workflows (new from scratch)
- **Status:** ✅ Pass — HTTP 201
- **Created:** `wf-086` — "Quinn QA Audit Test Workflow"
- **Node types tested in creation:** `trigger`, `tool`, `loop`, `parallel`, `output`
- **Result:** All 5 node types accepted without error; full workflow returned in response
- **Persistence check:** ✅ Confirmed — `wf-086` appears in list with `total: 27` (was 26)

**Request body accepted:**
```json
{
  "name": "Quinn QA Audit Test Workflow",
  "description": "End-to-end test workflow for QA audit 2026-03-22",
  "trigger": "manual",
  "nodes": [...trigger, tool, loop, parallel, output nodes...],
  "edges": [...]
}
```

### POST /api/v1/workflow-templates/{id}/use
- **Status:** ✅ Pass — HTTP 201
- **Template used:** `tpl-pr-review` → Created `wf-087` (PR Review Chain)
- **Result:** Full workflow instantiated with all nodes and edges from template
- **Note:** No way to pass custom overrides (name, initial values) at template instantiation time

---

## 3. Workflow Editor

### GET /api/v1/workflows/{id}
- **Status:** ✅ Pass — HTTP 200
- **Workflow `wf-086` loads correctly** with all fields
- **Fields returned:** `id`, `name`, `description`, `status`, `trigger`, `triggerConfig`, `steps`, `nodes`, `edges`, `agents`, `projectId`, `createdAt`, `updatedAt`, `lastRunAt`, `runCount`

### PATCH /api/v1/workflows/{id}
- **Status:** ❌ Fail — HTTP 405 (Method Not Allowed)
- **Impact:** If the UI uses PATCH for autosave, it will silently fail
- **Workaround:** PUT works (see below)

### PUT /api/v1/workflows/{id}
- **Status:** ✅ Pass — HTTP 200
- **Test:** Updated name and description via PUT with full node/edge payload
- **Persistence verified:** GET after PUT confirms updated name and description
- **Note:** PUT requires sending the full payload (nodes + edges) — partial updates not supported

### Node type acceptance
All three requested node types accepted without errors:
- ✅ `tool` node — created with `tool`, `label`, `params` data fields
- ✅ `loop` node — created with `iterateOver`, `loopVar` data fields  
- ✅ `parallel` node — created with `branches` array data field
- ✅ `condition` node (bonus — seen in templates, exists in live wf-050)

---

## 4. Execute a Workflow

### POST /api/v1/workflows/{id}/run
- **Status:** ✅ Pass — HTTP 202
- **Response:** Includes `id`, `workflowId`, `workflowName`, `triggeredBy`, `status: "pending"`, `streamUrl`, `startedAt`
- **Run created:** `run-1774223479555-7q8o5h`
- **Execution time:** ~800ms total for trigger → output node

### GET /api/v1/workflows/{id}/runs
- **Status:** ✅ Pass — HTTP 200
- **Returns:** List of runs for the workflow with status, steps, context, variables
- **Run appeared immediately** in list after POST /run

### GET /api/v1/workflows/{id}/runs/{runId}
- **Status:** ✅ Pass — HTTP 200
- **Run detail:** Full run detail with all step statuses, outputs, durations
- **Sample completed run:**
  - `trigger-1` (Manual Start): completed in 112ms
  - `output-1` (Done): completed in 191ms, output = "Updated!"
  - `finalOutput`: "Updated!"
  - Total: 800ms

### GET /api/v1/workflow-runs (global run list)
- **Status:** ⚠️ Partial — HTTP 200 but returns `{"runs":[],"total":0}`
- **Bug:** Endpoint exists and responds 200, but returns empty results despite runs existing per-workflow
- **Impact:** Any UI using the global run list (dashboard, run history) will show no data
- **Likely cause:** Missing query scope / database join issue

### GET /api/v1/workflows/{id}/runs/{runId}/stream
- **Status:** ✅ Pass — HTTP 200
- **Type:** Server-Sent Events (SSE) format
- **Events received:** `event: snapshot` with full run state JSON
- **Behavior:** For completed runs, returns current snapshot and continues emitting (doesn't send a `done` event before close on timeout)
- **Note:** Stream repeats snapshot events in a loop for completed runs — may be a live polling pattern rather than true SSE push

### POST /api/v1/workflows/{id}/runs/{runId}/cancel
- **Status (active run):** ✅ Pass — HTTP 200
- **Behavior:** Run `run-1774223516597-cocrav` was cancelled; `output-1` step shows `status: "skipped"`
- **Cancelled run response includes:** full run state with `status: "cancelled"`
- **Status (completed run):** ✅ Pass (correct error) — HTTP 400 `{"error":"Run already completed"}`
- **Note:** Cancel request on already-completed run at `run-1774223479555-7q8o5h` correctly rejected with meaningful error

---

## 5. Webhook Trigger

### GET /api/v1/webhooks/{workflowId}
- **Status:** ❌ Fail — HTTP 405 (Method Not Allowed)
- **Impact:** GET on webhook endpoint not supported — likely only POST intended

### POST /api/v1/webhooks/{workflowId} — unauthenticated
- **Status:** ❌ Fail — HTTP 401 `{"error":"Unauthorized"}`
- **Tested with:** No auth, `Authorization: Token <webhook-token>`, `X-Webhook-Token: <token>`, query param `?token=<token>`
- **None worked without admin bearer token**

### POST /api/v1/webhooks/{workflowId} — with Bearer token, draft status
- **Status:** ❌ Fail — HTTP 400 `{"error":"Workflow is not active"}`
- **Finding:** Webhooks require the workflow to be `status: "active"` — draft workflows cannot be triggered via webhook

### POST /api/v1/webhooks/{workflowId} — with Bearer token, active status
- **Status:** ✅ Pass — HTTP 202
- **Process:** Activated `wf-086` via PUT (set `status: "active"`), then POST /webhooks returned run created
- **Response:** `{"runId":"run-1774223537292-np3oyh","status":"pending","streamUrl":"..."}`
- **Note:** Webhook auth requires the full admin Bearer token — embedded workflow tokens (e.g., `pr-review-token`) don't appear to work for unauthenticated webhook calls. This is either by design or a missing feature.

---

## 6. Error Cases

### Invalid workflow ID
- **GET /api/v1/workflows/wf-INVALID-999:** ✅ Correct — HTTP 404 `{"error":"Workflow not found"}`
- **POST /api/v1/workflows/wf-INVALID-999/run:** ✅ Correct — HTTP 404 `{"error":"Workflow not found"}`

### POST workflow with missing required fields (empty body `{}`)
- **Status:** ✅ Correct — HTTP 400 `{"error":"name is required"}`
- **Validation:** Name validation present. Additional required field validation not tested (description, trigger may be optional)

### Cancel already-completed run
- **Status:** ✅ Correct — HTTP 400 `{"error":"Run already completed"}`
- **Proper guard in place**

---

## 7. UI Walkthrough

### Screenshots captured

**Login page (https://alice.av3.ai/login):**
- The A.L.I.C.E. login page renders correctly
- Dark theme with email/password form
- Tagline: "Your AI team's command center"
- Features listed: "Monitor your 28 specialist agents", "Build and run multi-agent workflows", "Track sessions, approvals, and memory"

**Workflow pages (https://alice.av3.ai/workflows, /workflows/new):**
- ⚠️ Blocked — the isolated OpenClaw browser is not authenticated with Supabase
- All `/workflows*` routes redirect to `/login?redirect=%2Fworkflows`
- UI screenshots could not be captured without active session cookies
- **Recommendation:** Use the user-profile browser (already logged in) for UI testing, or implement token-based URL auth for testing environments

---

## Findings Summary

| # | Area | Test | Result | HTTP | Notes |
|---|---|---|---|---|---|
| 1 | List | GET /api/v1/workflows | ✅ Pass | 200 | 27 workflows, full shapes |
| 2 | List | GET /api/v1/workflow-templates | ✅ Pass | 200 | 10 templates |
| 3 | Create | POST /api/v1/workflows | ✅ Pass | 201 | All node types accepted |
| 4 | Create | POST /api/v1/workflow-templates/{id}/use | ✅ Pass | 201 | Instantiates full workflow |
| 5 | Editor | GET /api/v1/workflows/{id} | ✅ Pass | 200 | All fields present |
| 6 | Editor | PATCH /api/v1/workflows/{id} | ❌ Fail | 405 | Not implemented — use PUT |
| 7 | Editor | PUT /api/v1/workflows/{id} | ✅ Pass | 200 | Persists correctly |
| 8 | Execute | POST /api/v1/workflows/{id}/run | ✅ Pass | 202 | Run created and executed |
| 9 | Execute | GET /api/v1/workflows/{id}/runs | ✅ Pass | 200 | Run appears in list |
| 10 | Execute | GET /api/v1/workflows/{id}/runs/{runId} | ✅ Pass | 200 | Full run detail |
| 11 | Execute | GET /api/v1/workflow-runs (global) | ⚠️ Partial | 200 | Empty — 0 results despite runs existing |
| 12 | Execute | GET .../runs/{runId}/stream | ✅ Pass | 200 | SSE works; repeats snapshot for completed |
| 13 | Execute | POST .../runs/{runId}/cancel (active) | ✅ Pass | 200 | Cancels; steps show "skipped" |
| 14 | Execute | POST .../runs/{runId}/cancel (done) | ✅ Pass | 400 | Correct error |
| 15 | Webhook | GET /api/v1/webhooks/{workflowId} | ❌ Fail | 405 | GET not supported |
| 16 | Webhook | POST /webhooks — no auth | ❌ Fail | 401 | Unauthorized |
| 17 | Webhook | POST /webhooks — webhook token variants | ❌ Fail | 401 | Embedded tokens don't work |
| 18 | Webhook | POST /webhooks — draft status | ❌ Fail | 400 | Workflow must be active |
| 19 | Webhook | POST /webhooks — active + Bearer | ✅ Pass | 202 | Works with admin token + active status |
| 20 | Errors | Invalid workflow ID | ✅ Pass | 404 | Clean error message |
| 21 | Errors | Run invalid workflow | ✅ Pass | 404 | Clean error message |
| 22 | Errors | POST workflow missing name | ✅ Pass | 400 | Field validation present |
| 23 | UI | /workflows (list page) | ⚠️ Blocked | — | Requires Supabase login session |
| 24 | UI | /workflows/new | ⚠️ Blocked | — | Requires Supabase login session |

---

## Critical Issues (Block Ship)

None that block all functionality, but these need attention:

### 🔴 PATCH not implemented (405)
- **Impact:** If the UI's autosave uses PATCH, it will silently fail for users
- **Fix:** Implement PATCH handler, or verify UI uses PUT exclusively
- **Workaround:** PUT works

### 🔴 Global run list `/api/v1/workflow-runs` returns empty
- **Impact:** Dashboard, global run history, metrics all show 0 runs — this breaks observability
- **Suspected cause:** Missing scope/join in query — possibly filtering by a session or user that doesn't match
- **Fix needed:** Investigate query logic; this endpoint should return all recent runs

---

## High Priority Issues (Fix Soon)

### 🟠 Webhook embedded tokens not honored
- **Impact:** Third-party systems cannot trigger workflows without admin bearer tokens
- **Expected behavior:** A workflow with `trigger.token = "support-triage-token"` should be triggerable via `POST /webhooks/wf-050` with that token in the request
- **Current behavior:** 401 regardless of how token is passed (query, header, body)
- **Fix:** Implement webhook token verification against the workflow's `triggerConfig.token`

### 🟠 Workflows must be `active` to run via webhook — but default status is `draft`
- **Impact:** All template-created workflows default to `draft` and cannot be triggered via webhook until manually activated
- **UX gap:** No activation button/flow visible via API (requires PUT with `status: "active"`)
- **Fix:** Add explicit activation endpoint or UI affordance; document the draft→active workflow

### 🟠 UI requires user authentication (no API-key UI access)
- **Impact:** Cannot test UI without Supabase session credentials
- **Recommendation:** Add a dev/test mode or URL-based auth token for automated UI testing

---

## Medium Priority Issues

### 🟡 `steps` field always empty `[]` on workflows
- The `steps` field exists but is always `[]`. All workflow logic is in `nodes`/`edges`. Either remove `steps` or document that it's deprecated/legacy.

### 🟡 `agents`, `projectId`, `triggerConfig` always null/empty
- These fields suggest planned features (multi-agent teams, multi-project, trigger configuration) that aren't wired yet. Should be documented as roadmap items.

### 🟡 SSE stream repeats snapshots for completed runs
- The stream endpoint (`/runs/{runId}/stream`) repeats `snapshot` events rather than emitting a final event and closing. For completed runs, this wastes bandwidth and may confuse clients expecting an `end` or `complete` event.

### 🟡 `event` trigger type in templates not validated
- `tpl-user-onboarding` uses `trigger.type = "event"` but no event emission mechanism is apparent in the API surface. May cause silent failures.

### 🟡 No pagination on workflow list
- 27 workflows returned in one flat array. At scale, this will become a performance issue. Add `limit`/`offset` or cursor-based pagination.

### 🟡 No DELETE endpoint visible
- Stale/test workflows cannot be cleaned up via API. The many "Untitled Workflow" entries suggest this is needed.

---

## Low Priority / Observations

- **Run ID format:** `run-{timestamp}-{random}` — human-readable but could collide under high concurrency
- **Workflow ID format:** `wf-{sequential}` — predictable (easy to enumerate), but sequential IDs are fine for internal use
- **Template IDs:** Human-readable slugs (`tpl-daily-briefing`) — good for documentation
- **Error messages:** Generally descriptive (`"name is required"`, `"Run already completed"`) — good DX
- **Execution speed:** Trigger → Output completed in ~800ms — reasonable for a simple workflow
- **CORS:** Not tested but API likely requires proper CORS headers for browser-based frontend calls

---

## Test Artifacts Created

| Resource | ID | Status |
|---|---|---|
| Test workflow | `wf-086` | Active (was activated for webhook test) |
| Template-from workflow | `wf-087` | Draft (PR Review Chain) |
| Test run (completed) | `run-1774223479555-7q8o5h` | Completed |
| Test run (cancelled) | `run-1774223516597-cocrav` | Cancelled |
| Test run (webhook) | `run-1774223537292-np3oyh` | Completed/Pending |

---

*Report generated by Quinn (QA Engineering Lead) — 2026-03-22*
