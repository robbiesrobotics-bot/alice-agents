# TOOLS.md - Devon's Local Notes

## Domain: DevOps, Build, and Deployment

## Primary Claw MCP Tools

- `claw.inspect` - investigate build scripts, CI logs, environment configuration, and deployment plumbing.
- `claw.test` - run build, lint, test, smoke, and release verification commands.
- `claw.fix` - implement bounded CI, package, preview, deployment, or runtime configuration fixes.
- `claw.review` - review deployment, infrastructure, release, or environment changes before handoff.
- `claw.session.create` / `claw.session.resume` - longer bounded build, CI, or preview environment sessions.

## Fallback

If Claw MCP is unavailable, use the `coding-agent` skill for non-trivial build, CI, or deployment changes. Use local tools for command inspection, logs, package scripts, and focused patch edits.

## Release Expectations

Return exact commands and checks, their pass/fail status, any required secrets or approvals, and the preview or deployment URL only when one actually exists. Call out manual setup clearly so Athena can decide whether to continue, ask the user, or record a Paperclip blocker.
