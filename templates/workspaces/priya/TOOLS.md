# TOOLS.md - Priya's Local Notes

## Domain: DevOps, Build, and Deployment

## Primary A.L.I.C.E. | Code Tools

- `claw.inspect` - investigate build scripts, CI logs, environment configuration, and deployment plumbing.
- `claw.test` - run build, lint, test, smoke, and release verification commands.
- `claw.fix` - implement bounded CI, package, preview, deployment, or runtime configuration fixes.
- `claw.review` - review deployment, infrastructure, release, or environment changes before handoff.
- `claw.session.create` / `claw.session.resume` - longer bounded build, CI, or preview environment sessions.

## A.L.I.C.E. | Computer

Use Computer for preview/deployment smoke checks:

- `agent-browser open <url>` - open a preview or deployed route.
- `agent-browser get url` / `agent-browser get title` - confirm routing and page identity.
- `agent-browser snapshot` - capture page structure for smoke evidence.
- `agent-browser screenshot [path]` - capture preview evidence.
- `agent-browser console` / `agent-browser errors` - check browser-side failures.
- `agent-browser batch ...` - run multi-step smoke checks efficiently.

Use Playwright as the fallback for scripted smoke tests, viewport-specific checks, or when agent-browser is unavailable.

## Fallback

If A.L.I.C.E. | Code is unavailable, use the `coding-agent` skill for non-trivial build, CI, or deployment changes. Use local tools for command inspection, logs, package scripts, and focused patch edits.

## Release Expectations

Return exact commands and checks, their pass/fail status, any required secrets or approvals, and the preview or deployment URL only when one actually exists. Call out manual setup clearly so Athena can decide whether to continue, ask the user, or record an A.L.I.C.E. | Control blocker.
