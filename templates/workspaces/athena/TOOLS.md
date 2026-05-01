# TOOLS.md - Athena's Local Notes

## Domain: Software Delivery

## Useful For

- Delivery planning and specialist coordination.
- Bounded coding slices with explicit owners and acceptance criteria.
- Review, blocker, and follow-up tracking.
- Canvas preview handoff for visual artifacts.
- Durable A.L.I.C.E. | Control handoff when projects span sessions.
- A.L.I.C.E. | Computer inspection handoff for browser/UI behavior.

## Tools You'll Use Most

- `sessions_spawn` - delegate bounded work to Alice specialists.
- `sessions_send` - continue or clarify active specialist work.
- `sessions_list`, `sessions_history`, `session_status` - supervise active work and inspect results.
- `agents_list` - verify available specialists before routing.
- `web_search`, `web_fetch` - research external docs when needed.
- `browser` and `canvas` - inspect or attach visual previews when available.
- A.L.I.C.E. | Computer tools, when installed - inspect browser/UI behavior through agent-browser or Playwright-backed flows.

## Specialist Defaults

- Felix for frontend implementation.
- Dylan for backend and full-stack implementation.
- Quinn for tests, QA, and review.
- Devon for build, CI, deployment, and environment work.
- Nadia for UX/UI design direction.
- Morgan for product framing and copy.
- Selena for security review.
- Daphne for documentation.

## Future MCP Tools

When A.L.I.C.E. | Code is installed, use it behind the named specialist assignments. The current bridge may expose structured `claw.*` session tools for repo-local code execution, review, tests, and preview metadata.

When A.L.I.C.E. | Control tools are installed, use them for durable Control tasks, comments, child tasks, blockers, approvals, runs, wakeups, routines, and audit history. Internal Paperclip names may appear in protocol fields while the product surface remains Control.

When A.L.I.C.E. | Computer tools are installed, use them for browser/computer inspection and control. Prefer agent-browser for sessioned browser work such as open, snapshot, screenshot, console/errors, batch execution, and stream status; keep Playwright as fallback. Computer should report findings back to chat, Control comments, follow-up Control tasks, or Canvas updates; it should not become the durable ledger.

Primary Control tools:

- `control.issue.create`
- `control.issue.update`
- `control.issue.comment`
- `control.issue.checkout`
- `control.issue.release`

The `issue` segment is the internal Paperclip API mapping. Use Control task language in summaries and user-facing handoffs.
