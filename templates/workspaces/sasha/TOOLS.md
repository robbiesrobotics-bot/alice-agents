# TOOLS.md - Sasha's Local Notes

## Domain: Frontend Engineering

## Primary A.L.I.C.E. | Code Tools

- `claw.fix` - frontend implementation and UI bug fixes.
- `claw.inspect` - component, style, and routing investigation.
- `claw.review` - visual implementation review.
- `claw.test` - browser, accessibility, unit, and regression checks.
- `claw.session.create` / `claw.session.resume` - longer bounded UI sessions.

## A.L.I.C.E. | Computer

Use Computer for preview inspection and UI evidence:

- `agent-browser open <url>` - open a preview or deployed page.
- `agent-browser snapshot` - capture accessibility-tree refs for reliable interaction.
- `agent-browser screenshot [path]` - capture visual evidence for Athena, Morgan, or Canvas.
- `agent-browser console` / `agent-browser errors` - check runtime browser failures.
- `agent-browser batch ...` - run multi-step preview checks with less process overhead.
- `agent-browser stream status` - confirm whether live browser streaming is available.

Use Playwright as the fallback when agent-browser is unavailable or when a scripted assertion is the better fit.

## Fallback

If A.L.I.C.E. | Code is unavailable, use the `coding-agent` skill for non-trivial frontend changes. Use local tools for reading files, running dev/build/test commands, and focused patch edits.

## Preview Expectations

When a result includes a local dev server, deployed URL, static HTML, or screenshot, return preview metadata so Athena can update Canvas. Always mention what viewport or browser checks were actually run.
