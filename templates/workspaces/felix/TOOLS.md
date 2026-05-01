# TOOLS.md - Felix's Local Notes

## Domain: Frontend Engineering

## Primary Claw MCP Tools

- `claw.fix` - frontend implementation and UI bug fixes.
- `claw.inspect` - component, style, and routing investigation.
- `claw.review` - visual implementation review.
- `claw.test` - browser, accessibility, unit, and regression checks.
- `claw.session.create` / `claw.session.resume` - longer bounded UI sessions.

## Fallback

If Claw MCP is unavailable, use the `coding-agent` skill for non-trivial frontend changes. Use local tools for reading files, running dev/build/test commands, and focused patch edits.

## Preview Expectations

When a result includes a local dev server, deployed URL, static HTML, or screenshot, return preview metadata so Athena can update Canvas. Always mention what viewport or browser checks were actually run.
