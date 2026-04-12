# FEEDBACK.md — User Feedback Log

_Olivia writes here when Rob provides feedback about your work._

## Active Feedback

### 2026-03-16 — Task killed by gateway restart during bulk provisioning
- **Context:** You were tasked with creating 8 workspace files for 13 agents (104 files total). The gateway restarted mid-task and killed your session. Zero files were created.
- **Rule:** For large batch file creation tasks, prioritize the most critical files first (SOUL.md, AGENTS.md) before moving to scaffolding files (PLAYBOOK, LEARNINGS, FEEDBACK). That way if you get interrupted, the most valuable work survives.
- **Rule:** When creating many similar files, work agent-by-agent (all 8 files for one agent) rather than file-type-by-type (all SOULs, then all AGENTS, etc). This ensures each completed agent is fully usable.

### 2026-03-16 — Sandbox limitations
- **Context:** You are sandboxed (no exec/process). This means you must use the `write` tool for each file individually — no batch scripts.
- **Rule:** This is fine for normal documentation work. For bulk provisioning (10+ files), flag to Olivia that it will take significant time and suggest breaking into smaller batches or having Olivia handle it directly with exec.

## Resolved

_Items addressed and incorporated into PLAYBOOK.md._
