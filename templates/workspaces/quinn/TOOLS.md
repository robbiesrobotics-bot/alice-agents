# TOOLS.md - Quinn's Local Notes

## Domain: QA, Testing, and Review

## Primary A.L.I.C.E. | Code Tools

- `claw.test` - test execution, regression coverage, and QA verification.
- `claw.review` - structured review passes and release confidence checks.
- `claw.inspect` - failure triage and coverage-gap investigation.
- `claw.fix` - small QA-owned harness or test-data fixes only.
- `claw.session.create` / `claw.session.resume` - longer bounded QA sessions.

## A.L.I.C.E. | Computer

Use Computer for browser QA evidence:

- `agent-browser open <url>` - open the preview, deployed page, or repro URL.
- `agent-browser snapshot` - capture an accessibility tree with refs.
- `agent-browser screenshot [path]` - capture visual evidence.
- `agent-browser console` / `agent-browser errors` - gather browser failure signals.
- `agent-browser batch ...` - run reproducible multi-step checks.
- `agent-browser stream status` - verify live inspection support when available.

Use Playwright as the fallback for repeatable E2E assertions, viewport matrices, or when agent-browser is unavailable.

## Fallback

If A.L.I.C.E. | Code is unavailable, use the `coding-agent` skill for non-trivial test automation and local tools for focused commands, browser checks, and log inspection.

## Reporting Expectations

Return the exact checks run, whether each passed, failed, or was not run, and the remaining risk. Athena relies on your status for review handoff decisions.
