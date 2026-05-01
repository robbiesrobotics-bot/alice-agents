# Alice Coding Orchestration Plan

## Purpose

This document records the current A.L.I.C.E. coding-delivery architecture so future work can resume without relying on chat history.

## Architecture

- **A.L.I.C.E. | Hub** is the product shell that contains both the synchronous Chat surface and the durable Control surface.
- **A.L.I.C.E. | Chat** is the synchronous conversation view where users talk to Alice/Athena, watch streamed agent progress, and see Canvas artifacts beside the conversation.
- `alice-runtime` remains the governed agent execution harness: sessions, model routing, tools, traces, budgets, channels, memory, and API surfaces.
- `alice-agents` remains the team/persona layer: Olivia, Athena, and named specialists.
- Athena is the Alice-native Software Delivery Lead. She plans coding work, assigns named specialists, manages blockers/reviews, and keeps users updated.
- **A.L.I.C.E. | Code** is the coding execution product behind named specialists. It is currently implemented through Claw Code MCP and `claw.*` tools, but users should normally experience the work as Alice specialists, not as a raw Claw runner.
- **A.L.I.C.E. | Control** is the durable work ledger and governance layer for projects, tasks, assignments, blockers, approvals, routines, wakeups, comments, runs, and audit history. It is currently implemented on the Paperclip-derived Hub/Control codebase and APIs.
- **A.L.I.C.E. | Computer** is the browser/computer-control layer for inspecting and controlling UI surfaces. It should initially be powered by `vercel-labs/agent-browser`, with Playwright as the fallback path.
- **A.L.I.C.E. | Canvas** is the visual preview pane inside A.L.I.C.E. | Chat. It is not a project board or orchestrator.
- RecordorAI is the agent memory stack. Runtime and agent templates should treat it as the direct, low-latency backend for semantic recall; old `mempalace`/`qmd` shim paths are migration artifacts, not product architecture. Runtime adapters must handle RecordorAI result shapes and failed write responses explicitly.
- RecordorAI stores and retrieves verbatim memory. Models should receive compact, scoped, ranked memory evidence capsules by default, not raw drawers, raw JSON search churn, long tool results, or unbounded session history.

## Product Stack

- **A.L.I.C.E. | Hub** is the user-facing application shell.
- **A.L.I.C.E. | Chat** is the synchronous conversational workspace. It hosts the left-side conversation and the right-side Canvas pane for visual artifacts.
- **A.L.I.C.E. | Control** tracks durable work and governance. It is internally powered by Paperclip during the transition.
- **A.L.I.C.E. | Runtime** runs the core agent loop, sessions, tool policy, traces, memory, channels, and model routing.
- **A.L.I.C.E. | Agents** contains Olivia, Athena, and the named specialist roster.
- **A.L.I.C.E. | Code** performs coding work through named specialists. It is initially powered by Claw Code MCP and needs a wrapper/add-on around the raw `claw` CLI.
- **A.L.I.C.E. | Computer** inspects and controls browser/computer surfaces. It is initially planned around Vercel Labs `agent-browser`, with Playwright fallback.
- **A.L.I.C.E. | Canvas** shows visual output inside Chat. Canvas is not a separate Control view.

## Naming Boundary

- Use **A.L.I.C.E. | Chat** in user-facing docs, agent instructions, and summaries for the synchronous conversation surface inside Hub.
- Use **A.L.I.C.E. | Control** in user-facing docs, agent instructions, and summaries for durable work tracking.
- Use **A.L.I.C.E. | Code** in user-facing docs, agent instructions, and summaries for coding execution.
- Use **A.L.I.C.E. | Computer** in user-facing docs, agent instructions, and summaries for browser/computer inspection or control.
- Keep existing internal protocol names where they are live contracts: `paperclip`, `@paperclipai/*`, `X-Paperclip-Run-Id`, `claw.*`, `ALICE_CLAW_MCP`, and Claw MCP command/env names.
- Treat Paperclip and Claw Code as implementation details unless the user explicitly asks about internals.

## Internal Mapping

- A.L.I.C.E. | Control Project: Paperclip project or goal.
- A.L.I.C.E. | Control Task: Paperclip issue.
- A.L.I.C.E. | Control Run: Paperclip heartbeat run.
- A.L.I.C.E. | Control Approval: Paperclip approval.
- A.L.I.C.E. | Control Blocker: Paperclip `blockedBy` relationship.
- A.L.I.C.E. | Control Routine: Paperclip routine.
- A.L.I.C.E. | Control Comment: Paperclip issue comment.

## Product Boundaries

- Chat is where users talk with Alice/Athena, see streamed work, and iterate in the moment.
- Control tracks and governs the work; it does not perform the domain work.
- Athena manages software delivery and decides when chat work should become durable Control work.
- Code performs implementation, review, test, and build tasks through coding specialists.
- Computer inspects browser/UI behavior and can report findings back into chat or Control.
- Canvas shows the current visual artifact inside Chat; it does not own project state.
- Runtime runs the agents, enforces policy, and connects tools.
- Control housekeeping should not pollute Chat transcripts. Chat should surface Control links, blockers, approvals, and resume events as notifications/toasts unless Alice/Athena intentionally writes a conversational summary.

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
- Code hardening finding: the current upstream `ultraworkers/claw-code` repo builds a `claw` CLI and includes `claw mcp serve`, but that raw MCP surface does not expose the high-level A.L.I.C.E. | Code `claw.fix`/session contract expected by `alice-runtime`; live smoke testing should use the standalone A.L.I.C.E. | Code wrapper instead.
- `/Users/aliceclaw/code/alice-code-mcp` now contains the first standalone A.L.I.C.E. | Code MCP wrapper. It speaks alice-runtime's stdio JSON-RPC contract and shells out to the raw `claw` CLI behind high-level `claw.*` tools.
- `/Users/aliceclaw/code/agent-browser` now contains the cloned Vercel Labs `agent-browser` source for A.L.I.C.E. | Computer planning. Its useful MVP surfaces are CLI sessions, snapshots, screenshots, console/errors, batch execution, and stream status.
- Alice Hub includes A.L.I.C.E. | Chat as `/chat`, the synchronous conversation view.
- `alice-runtime` has Canvas artifact storage and authenticated Canvas API endpoints.
- Alice Hub Chat can display a right-side Canvas pane from streamed Canvas artifacts.
- Alice Hub preserves alice-runtime session ids and can reload/poll persisted Canvas artifacts for the active chat thread.
- Alice Hub Chat can promote/link durable Control tasks through cross-surface refs, the active Chat thread is addressable by URL, and Control task detail can return users to linked Chat threads.
- Alice Hub Chat continuity now has mocked UI coverage for active `threadId` reloads, persisted Canvas artifact reloads, newest-artifact selection, Canvas desktop/mobile viewport switching, and Control link notifications staying out of the transcript.
- `alice-runtime` exposes A.L.I.C.E. | Control tools for durable task create/update/comment/checkout/release when `ALICE_CONTROL_API_URL` is configured. Tool names currently remain `control.issue.*` because they map to the internal Paperclip issue API.
- `alice-runtime` includes `bun run validate:control` for live A.L.I.C.E. | Control task-route smoke testing with `ALICE_LIVE_CONTROL_*` variables.
- `alice-runtime` discovers repo-local `ALICE_WORKFLOW.md` files for A.L.I.C.E. | Code tool calls with `repoRoot` or `cwd` and appends them to specialist instructions.
- RecordorAI compatibility fixes were applied in runtime memory client work; keep future memory changes aligned with direct RecordorAI native/HTTP/MCP surfaces, not old mempalace or qmd shim naming.
- RecordorAI/OpenClaw benchmarking showed direct memory lookup around 79-82 ms warm, while the production agent path could be 35 s p50 and 68 s p95 because of orchestration/context pressure. Runtime now uses compact memory capsules and applies a context budget before inference calls so long histories and large tool results do not balloon model prompts.
- The runtime `memory.search` tool now returns compact model-facing evidence capsules by default instead of raw full hits.
- The runtime `memory.get` tool now provides explicit bounded full/verbatim drawer retrieval with `maxChars` and `offset`.
- Runtime memory search/write/get calls now carry stable Alice scope through the memory boundary and include regression coverage for scoped capsules plus cross-session sentinel isolation.
- Alice Hub Chat now applies a prompt budget to knowledge-base retrieval before dispatch: max 5 chunks, max 800 chars per chunk, max 4,000 KB chars total, with citation/source metadata preserved.

## Recommended Next Slice

Continue the no-credential roadmap with mocked A.L.I.C.E. | Control durable-mode coverage.

Scope this slice as:

1. Identify existing Control/Paperclip service and route coverage for child tasks, blockers, approvals, review handoffs, heartbeat resume, and Chat/Control links.
2. Add mocked/local regression coverage for the durable-mode paths Athena will depend on.
3. Prefer API/service contract tests over live smoke tests so no production token is required.
4. Keep user-facing language as A.L.I.C.E. | Control while preserving internal Paperclip route/env names.
5. Update Athena/Control docs with any remaining mocked-vs-live gaps discovered during the slice.

## No-Credential Roadmap

These slices can continue without provider credentials or live production tokens:

1. [x] Runtime context budgeter plus long-history and oversized tool-result regression tests.
2. [x] Scoped RecordorAI memory regression tests for stable Alice scope and cross-session sentinel isolation.
3. [x] Hub knowledge-base prompt budget so retrieved chunks cannot overfill Chat prompts.
4. [x] Chat/Canvas continuity tests for refresh, reload, active thread, artifact persistence, desktop/mobile toggles, and non-polluting Control toasts.
5. [ ] Control durable mode with mocked APIs for child tasks, blockers, approvals, review handoffs, heartbeat resume, and Chat/Control linking.
6. [ ] Computer local planning and wiring around `agent-browser` surfaces with Playwright fallback documented in agent instructions.
7. [ ] Code wrapper hardening that does not require live model credentials: contract tests, command/env docs, policy checks, and structured result validation.

## Remaining Build Slices

1. A.L.I.C.E. | Control live hardening: smoke-test real Control auth/routes, context comments, child tasks, blockers, review handoffs, and heartbeat resume.
2. A.L.I.C.E. | Code integration hardening: build or wrap the MCP add-on around the real `ultraworkers/claw-code` CLI, then document required command/env setup.
3. Named specialist acceptance criteria: make Felix/Dylan/Quinn/Devon expectations explicit for Code-backed work.
4. Repo workflow instructions: support `ALICE_WORKFLOW.md` for build commands, preview commands, test commands, deployment rules, and repo constraints.
5. RecordorAI validation: keep scoped regression coverage for compact capsules and add a live compatibility smoke test for search result shape, write failure shape, health, and P50/P95 latency when credentials are available.
6. A.L.I.C.E. | Computer planning: define the browser/computer-control tool boundary, inspect `vercel-labs/agent-browser`, and document the Playwright fallback path.
7. A.L.I.C.E. | Chat polish: keep Chat, Canvas, and Control links consistent so users can move between immediate conversation and durable work without losing context.

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
- [x] Document current upstream `ultraworkers/claw-code` command/env and MCP contract mismatch.
- [x] Build the initial A.L.I.C.E. | Code MCP add-on/wrapper for the raw `claw` CLI.
- [x] Smoke-test the wrapper's stdio JSON-RPC handshake and tool listing.
- [ ] Smoke-test the wrapper against a real built `claw` binary and provider credential.
- [ ] Document any real-wrapper command/env differences discovered during smoke testing.

### Phase 3: Named Coding Specialist Mapping

- [x] Add Claw-aware templates for Dylan, Felix, Quinn, and Devon.
- [x] Keep Athena as coordinator instead of adding new MVP coding personas.
- [x] Add acceptance criteria per specialist for Code-backed implementation, review, testing, and preview work.

### Phase 4: A.L.I.C.E. | Chat And Canvas MVP

- [x] Keep A.L.I.C.E. | Chat as the synchronous conversation surface in Hub.
- [x] Add runtime Canvas artifact types, storage, and API endpoints.
- [x] Attach Canvas artifacts from coding tool results.
- [x] Add Alice Hub right-side Canvas pane for streamed artifacts.
- [x] Expose and persist alice-runtime session ids through Hub chat sessions.
- [x] Add Hub Canvas API polling/reload from runtime persisted artifacts.
- [x] Make Chat-to-Control linking explicit for durable coding work.
- [x] Make Control-to-Chat return links explicit through addressable Chat thread URLs.
- [x] Keep Control link notifications as Chat toasts rather than transcript messages.
- [x] Add Hub knowledge-base prompt budgeting before Chat dispatch so retrieved chunks stay compact.
- [x] Add browser/UI thread refresh and page reload coverage for Canvas continuity.

### Phase 5: A.L.I.C.E. | Control Durable Mode

- [x] Existing Control/Paperclip primitives support tasks, comments, blockers, approvals, heartbeats, and session state.
- [x] Add Athena durable-mode workflow over Control APIs.
- [x] Add child task creation/update paths for Athena-managed coding plans.
- [x] Add live Control API smoke coverage for create/update/comment/checkout/release.
- [ ] Run live Control API smoke coverage against Alice Hub and document discovered env/auth differences.
- [ ] Add explicit review/approval handoff behavior for long-running coding work.
- [ ] Add heartbeat resume behavior that preserves stop/resume safety rules.

### Phase 6: Workflow Instructions

- [x] Define `ALICE_WORKFLOW.md` discovery rules.
- [x] Pass workflow instructions into Athena and Code-backed specialists.
- [x] Support build/test/preview/deploy command hints through repo-owned workflow text.
- [x] Add repository constraint and approval-gate guidance through repo-owned workflow text.

### Phase 7: RecordorAI Validation

- [x] Runtime memory client handles current RecordorAI search result shape.
- [x] Runtime memory writes fail loudly when RecordorAI reports failure.
- [x] Add scoped memory regression tests for stable Alice scope and cross-session sentinel isolation.
- [ ] Add a live compatibility smoke test for RecordorAI MCP search and write failure shapes.
- [ ] Add latency smoke metrics for RecordorAI search/write so extra process hops are visible.
- [x] Keep current architecture docs and agent templates aligned to RecordorAI, not old mempalace naming.
- [x] Add runtime context budgeter before inference calls.
- [x] Make the runtime `memory.search` tool return compact model-facing capsules by default.
- [x] Add explicit `memory.get` for bounded full/verbatim drawer retrieval.
- [x] Add regression tests for huge memory hits and explicit full retrieval.
- [x] Add regression tests for long-history compaction and oversized tool-result truncation.
- [ ] Introduce native FFI or clean HTTP as the preferred low-latency path when RecordorAI exposes the production binding.

### Phase 8: A.L.I.C.E. | Computer

- [x] Clone `vercel-labs/agent-browser` locally for integration work.
- [x] Define the Computer tool boundary separately from Control, Code, and Canvas.
- [x] Document when Computer should use `agent-browser` versus Playwright fallback.
- [ ] Connect Computer inspection workflows to Quinn, Devon, Felix, and Athena without making Computer the durable ledger.

## Non-Goals

- Do not absorb A.L.I.C.E. | Code/Claw Code into `alice-runtime`.
- Do not run Symphony as a separate service or expose Symphony branding.
- Do not replace A.L.I.C.E. | Control with Athena or Canvas.
- Do not collapse A.L.I.C.E. | Chat into Control; Chat and Control are separate Hub surfaces with shared agents/data.
- Do not refer to Control tasks as Paperclip issues in user-facing summaries unless discussing internals.
- Do not make A.L.I.C.E. | Computer a task ledger, coding runner, or visual artifact store.
- Do not make Canvas a standalone product, project board, or design tool.
- Do not let coding specialists bypass runtime/Control policy, budgets, approval gates, or repository allowlists.
