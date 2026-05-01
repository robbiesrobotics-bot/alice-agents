# Alice Coding Orchestration Plan

## Purpose

This document records the current A.L.I.C.E. coding-delivery architecture so future work can resume without relying on chat history.

## Architecture

- `alice-runtime` remains the governed agent execution harness: sessions, model routing, tools, traces, budgets, channels, memory, and API surfaces.
- `alice-agents` remains the team/persona layer: Olivia, Athena, and named specialists.
- Athena is the Alice-native Software Delivery Lead. She plans coding work, assigns named specialists, manages blockers/reviews, and keeps users updated.
- **A.L.I.C.E. | Code** is the coding execution product behind named specialists. It is currently implemented through Claw Code MCP and `claw.*` tools, but users should normally experience the work as Alice specialists, not as a raw Claw runner.
- **A.L.I.C.E. | Control** is the durable work ledger for issues, blockers, approvals, child tasks, comments, heartbeats, and audit history. It is currently implemented on the Paperclip-derived Hub/Control codebase and APIs.
- A.L.I.C.E. Canvas is the visual preview pane inside Alice Chat. It is not a project board or orchestrator.
- RecordorAI is the agent memory system. Runtime adapters must handle RecordorAI result shapes and failed write responses explicitly.

## Naming Boundary

- Use **A.L.I.C.E. | Control** in user-facing docs, agent instructions, and summaries for durable work tracking.
- Use **A.L.I.C.E. | Code** in user-facing docs, agent instructions, and summaries for coding execution.
- Keep existing internal protocol names where they are live contracts: `paperclip`, `@paperclipai/*`, `X-Paperclip-Run-Id`, `claw.*`, `ALICE_CLAW_MCP`, and Claw MCP command/env names.
- Treat Paperclip and Claw Code as implementation details unless the user explicitly asks about internals.

## MVP Specialist Mapping

For the MVP, use the existing Alice roster:

- Athena: software delivery lead and coordinator.
- Felix: frontend/UI implementation and preview readiness.
- Dylan: backend/full-stack implementation.
- Quinn: QA, test, and review.
- Devon: build, CI, preview, deployment, and runtime operations.
- Selena: security-sensitive review and policy concerns.
- Daphne: documentation and runbooks.
- Nadia: design direction.

Do not add new coding personas for MVP unless the official roster changes.

## Current Implemented State

- `alice-agents` includes Athena as a starter agent with dedicated workspace templates.
- `alice-agents` includes A.L.I.C.E. | Code-aware workspace templates for Dylan, Felix, Quinn, and Devon.
- `alice-runtime` exposes A.L.I.C.E. | Code tools through the internal Claw MCP bridge behind `ALICE_CLAW_MCP=1`.
- `alice-runtime` normalizes Code/Claw coding session results and attaches Canvas artifacts when preview metadata is returned.
- `alice-runtime` has Canvas artifact storage and authenticated Canvas API endpoints.
- Alice Hub Chat can display a right-side Canvas pane from streamed Canvas artifacts.
- Alice Hub preserves alice-runtime session ids and can reload/poll persisted Canvas artifacts for the active chat thread.
- `alice-runtime` exposes A.L.I.C.E. | Control tools for durable issue create/update/comment/checkout/release when `ALICE_CONTROL_API_URL` is configured.
- `alice-runtime` includes `bun run validate:control` for live A.L.I.C.E. | Control issue-route smoke testing with `ALICE_LIVE_CONTROL_*` variables.
- RecordorAI compatibility fixes were applied in runtime memory client work; keep future memory changes aligned with RecordorAI, not the old mempalace naming.

## Recommended Next Slice

Harden Athena durable mode against the real A.L.I.C.E. | Control API.

The runtime bridge now gives Athena first-class `control.issue.*` tools. The next product gap is live integration confidence and richer lifecycle behavior: test the bridge against Alice Hub Control auth/routes, verify child issues and context comments in the real UI, then add explicit approval/review and heartbeat resume behavior without bypassing stop/resume safety rules.

Scope this slice as:

1. Run `bun run validate:control` against the real Alice Hub Control API and record any auth/route differences.
2. Verify runtime session id and Canvas artifact id comments appear correctly on Control issues.
3. Confirm child issue creation through `parentId` renders correctly in Control.
4. Add explicit review/approval handoff semantics if the current status/comment model is not enough.
5. Add heartbeat resume behavior that preserves stop/resume safety rules.

## Remaining Build Slices

1. A.L.I.C.E. | Control live hardening: smoke-test real Control auth/routes, context comments, child issues, blockers, review handoffs, and heartbeat resume.
2. A.L.I.C.E. | Code integration hardening: test against the real `ultraworkers/claw-code` MCP server and document required command/env setup.
3. Named specialist acceptance criteria: make Felix/Dylan/Quinn/Devon expectations explicit for Code-backed work.
4. Repo workflow instructions: support `ALICE_WORKFLOW.md` for build commands, preview commands, test commands, deployment rules, and repo constraints.
5. RecordorAI validation: keep a live compatibility smoke test for search result shape and write failure shape.

## Implementation Checklist

### Phase 1: Athena Persona

- [x] Add Athena to the starter roster.
- [x] Add Athena workspace templates and operating doctrine.
- [x] Map MVP coding roles onto the existing roster.
- [x] Add Athena-specific A.L.I.C.E. | Control durable-mode instructions once Control wiring begins.

### Phase 2: A.L.I.C.E. | Code MCP

- [x] Add alice-runtime Code/Claw MCP client/tool registration behind `ALICE_CLAW_MCP=1`.
- [x] Normalize Code/Claw coding/session result shapes.
- [x] Attach Canvas artifacts from Code preview metadata.
- [ ] Smoke-test against the real `ultraworkers/claw-code` MCP server.
- [ ] Document any real-server command/env differences discovered during smoke testing.

### Phase 3: Named Coding Specialist Mapping

- [x] Add Claw-aware templates for Dylan, Felix, Quinn, and Devon.
- [x] Keep Athena as coordinator instead of adding new MVP coding personas.
- [x] Add acceptance criteria per specialist for Code-backed implementation, review, testing, and preview work.

### Phase 4: Canvas MVP In Alice Chat

- [x] Add runtime Canvas artifact types, storage, and API endpoints.
- [x] Attach Canvas artifacts from coding tool results.
- [x] Add Alice Hub right-side Canvas pane for streamed artifacts.
- [x] Expose and persist alice-runtime session ids through Hub chat sessions.
- [x] Add Hub Canvas API polling/reload from runtime persisted artifacts.
- [ ] Add browser/UI thread refresh and page reload coverage for Canvas continuity.

### Phase 5: A.L.I.C.E. | Control Durable Mode

- [x] Existing Control/Paperclip primitives support issues, comments, blockers, approvals, heartbeats, and session state.
- [x] Add Athena durable-mode workflow over Control APIs.
- [x] Add child issue creation/update paths for Athena-managed coding plans.
- [x] Add live Control API smoke coverage for create/update/comment/checkout/release.
- [ ] Run live Control API smoke coverage against Alice Hub and document discovered env/auth differences.
- [ ] Add explicit review/approval handoff behavior for long-running coding work.
- [ ] Add heartbeat resume behavior that preserves stop/resume safety rules.

### Phase 6: Workflow Instructions

- [ ] Define `ALICE_WORKFLOW.md` discovery rules.
- [ ] Pass workflow instructions into Athena and Code-backed specialists.
- [ ] Support build/test/preview/deploy command hints.
- [ ] Add repository constraint and approval-gate guidance.

### Phase 7: RecordorAI Validation

- [x] Runtime memory client handles current RecordorAI search result shape.
- [x] Runtime memory writes fail loudly when RecordorAI reports failure.
- [ ] Add a live compatibility smoke test for RecordorAI MCP search and write failure shapes.
- [ ] Keep docs and variable names aligned to RecordorAI, not old mempalace naming.

## Non-Goals

- Do not absorb A.L.I.C.E. | Code/Claw Code into `alice-runtime`.
- Do not run Symphony as a separate service or expose Symphony branding.
- Do not replace A.L.I.C.E. | Control with Athena or Canvas.
- Do not make Canvas a project board or design tool.
- Do not let coding specialists bypass runtime/Control policy, budgets, approval gates, or repository allowlists.
