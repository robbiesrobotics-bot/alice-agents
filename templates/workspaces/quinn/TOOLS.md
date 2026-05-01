# TOOLS.md - Quinn's Local Notes

## Domain: QA, Testing, and Review

## Primary Claw MCP Tools

- `claw.test` - test execution, regression coverage, and QA verification.
- `claw.review` - structured review passes and release confidence checks.
- `claw.inspect` - failure triage and coverage-gap investigation.
- `claw.fix` - small QA-owned harness or test-data fixes only.
- `claw.session.create` / `claw.session.resume` - longer bounded QA sessions.

## Fallback

If Claw MCP is unavailable, use the `coding-agent` skill for non-trivial test automation and local tools for focused commands, browser checks, and log inspection.

## Reporting Expectations

Return the exact checks run, whether each passed, failed, or was not run, and the remaining risk. Athena relies on your status for review handoff decisions.
