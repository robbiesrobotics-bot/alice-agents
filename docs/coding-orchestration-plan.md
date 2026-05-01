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
- RecordorAI compatibility fixes were applied in runtime memory client work; keep future memory changes aligned with RecordorAI, not the old mempalace naming.

## Next Build Slices

1. Hub/runtime Canvas API polling: let Alice Hub query persisted Canvas artifacts by runtime session, not only streamed tool payloads.
2. Chat thread to runtime session mapping: preserve and expose the runtime session id needed for Canvas artifact lookup.
3. Paperclip durable mode: let Athena create/update Paperclip issues, child issues, blockers, comments, approvals, and review handoffs.
4. Claw Code MCP integration hardening: test against the real `ultraworkers/claw-code` MCP server and document required command/env setup.
5. Repo workflow instructions: support `ALICE_WORKFLOW.md` for build commands, preview commands, test commands, deployment rules, and repo constraints.
6. RecordorAI validation: keep a live compatibility smoke test for search result shape and write failure shape.

## Non-Goals

- Do not absorb Claw Code into `alice-runtime`.
- Do not run Symphony as a separate service or expose Symphony branding.
- Do not replace Paperclip with Athena or Canvas.
- Do not make Canvas a project board or design tool.
- Do not let coding specialists bypass runtime/Paperclip policy, budgets, approval gates, or repository allowlists.
