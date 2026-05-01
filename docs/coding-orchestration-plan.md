# Alice Coding Orchestration Plan

## Purpose

This document records the current A.L.I.C.E. coding-delivery architecture so future work can resume without relying on chat history.

## Architecture

- `alice-runtime` remains the governed agent execution harness: sessions, model routing, tools, traces, budgets, channels, memory, and API surfaces.
- `alice-agents` remains the team/persona layer: Olivia, Athena, and named specialists.
- Athena is the Alice-native Software Delivery Lead. She plans coding work, assigns named specialists, manages blockers/reviews, and keeps users updated.
- Claw Code MCP is the coding execution layer behind named specialists. Users should normally experience Sasha-style work as Alice specialists, not as a raw Claw runner.
- Paperclip is the durable ledger for issues, blockers, approvals, child tasks, comments, heartbeats, and audit history.
- A.L.I.C.E. Canvas is the visual preview pane inside Alice Chat. It is not a project board or orchestrator.
- RecordorAI is the agent memory system. Runtime adapters must handle RecordorAI result shapes and failed write responses explicitly.

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
- `alice-agents` includes Claw-aware workspace templates for Dylan, Felix, Quinn, and Devon.
- `alice-runtime` exposes Claw MCP tools behind `ALICE_CLAW_MCP=1`.
- `alice-runtime` normalizes Claw coding/session results and attaches Canvas artifacts when preview metadata is returned.
- `alice-runtime` has Canvas artifact storage and authenticated Canvas API endpoints.
- Alice Hub Chat can display a right-side Canvas pane from streamed Canvas artifacts.
- Alice Hub preserves alice-runtime session ids and can reload/poll persisted Canvas artifacts for the active chat thread.
- RecordorAI compatibility fixes were applied in runtime memory client work; keep future memory changes aligned with RecordorAI, not the old mempalace naming.

## Recommended Next Slice

Build the Athena durable-mode bridge over Paperclip.

The Canvas bridge now gives chat a visual continuity path for coding work. The next product gap is durable work continuity: Athena needs a first-class way to promote a coding conversation into Paperclip issues, create child work, record blockers/review states, and resume through heartbeats without bypassing the stop/resume safety rules.

Scope this slice as:

1. Define Athena's durable-mode commands/tools for creating or updating Paperclip issues.
2. Map chat thread context, runtime session id, and Canvas artifact id into Paperclip issue metadata/comments.
3. Add child issue creation/update paths for Athena-managed coding plans.
4. Add blocker and review/approval handoff writes.
5. Add tests proving Athena can promote chat work to Paperclip without breaking normal chat mode.

## Remaining Build Slices

1. Paperclip durable mode: let Athena create/update Paperclip issues, child issues, blockers, comments, approvals, and review handoffs.
2. Claw Code MCP integration hardening: test against the real `ultraworkers/claw-code` MCP server and document required command/env setup.
3. Named specialist acceptance criteria: make Felix/Dylan/Quinn/Devon expectations explicit for Claw-backed work.
4. Repo workflow instructions: support `ALICE_WORKFLOW.md` for build commands, preview commands, test commands, deployment rules, and repo constraints.
5. RecordorAI validation: keep a live compatibility smoke test for search result shape and write failure shape.

## Implementation Checklist

### Phase 1: Athena Persona

- [x] Add Athena to the starter roster.
- [x] Add Athena workspace templates and operating doctrine.
- [x] Map MVP coding roles onto the existing roster.
- [ ] Add Athena-specific Paperclip durable-mode instructions once Paperclip wiring begins.

### Phase 2: Claw Code MCP

- [x] Add alice-runtime Claw MCP client/tool registration behind `ALICE_CLAW_MCP=1`.
- [x] Normalize Claw coding/session result shapes.
- [x] Attach Canvas artifacts from Claw preview metadata.
- [ ] Smoke-test against the real `ultraworkers/claw-code` MCP server.
- [ ] Document any real-server command/env differences discovered during smoke testing.

### Phase 3: Named Coding Specialist Mapping

- [x] Add Claw-aware templates for Dylan, Felix, Quinn, and Devon.
- [x] Keep Athena as coordinator instead of adding new MVP coding personas.
- [ ] Add acceptance criteria per specialist for Claw-backed implementation, review, testing, and preview work.

### Phase 4: Canvas MVP In Alice Chat

- [x] Add runtime Canvas artifact types, storage, and API endpoints.
- [x] Attach Canvas artifacts from coding tool results.
- [x] Add Alice Hub right-side Canvas pane for streamed artifacts.
- [x] Expose and persist alice-runtime session ids through Hub chat sessions.
- [x] Add Hub Canvas API polling/reload from runtime persisted artifacts.
- [ ] Add browser/UI thread refresh and page reload coverage for Canvas continuity.

### Phase 5: Paperclip Durable Mode

- [x] Existing Paperclip primitives support issues, comments, blockers, approvals, heartbeats, and session state.
- [ ] Add Athena durable-mode workflow over Paperclip APIs.
- [ ] Add child issue creation/update paths for Athena-managed coding plans.
- [ ] Add review/approval handoff behavior for long-running coding work.
- [ ] Add heartbeat resume behavior that preserves stop/resume safety rules.

### Phase 6: Workflow Instructions

- [ ] Define `ALICE_WORKFLOW.md` discovery rules.
- [ ] Pass workflow instructions into Athena and Claw-backed specialists.
- [ ] Support build/test/preview/deploy command hints.
- [ ] Add repository constraint and approval-gate guidance.

### Phase 7: RecordorAI Validation

- [x] Runtime memory client handles current RecordorAI search result shape.
- [x] Runtime memory writes fail loudly when RecordorAI reports failure.
- [ ] Add a live compatibility smoke test for RecordorAI MCP search and write failure shapes.
- [ ] Keep docs and variable names aligned to RecordorAI, not old mempalace naming.

## Non-Goals

- Do not absorb Claw Code into `alice-runtime`.
- Do not run Symphony as a separate service or expose Symphony branding.
- Do not replace Paperclip with Athena or Canvas.
- Do not make Canvas a project board or design tool.
- Do not let coding specialists bypass runtime/Paperclip policy, budgets, approval gates, or repository allowlists.
