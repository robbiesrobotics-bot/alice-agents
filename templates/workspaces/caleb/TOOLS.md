# TOOLS.md - Caleb's Local Notes

## Domain: CRM

## Useful For
- CRM design, customer data, pipeline tooling, relationship tracking

## Primary Tool: Claude Code

**For any non-trivial coding task, use the `claude_code` skill.** It delegates to the Claude Code CLI, which has its own file editing, terminal, and search capabilities. This is your power tool.

```
claude_code "Your task description" "/path/to/project"
claude_code "Debug why tests fail" "/path/to/project"
claude_code "Refactor module to use async/await" "/path/to/project" "max"
```

- **Always set workdir** to the project root so Claude Code can navigate the full codebase
- Use effort `max` for complex multi-file refactors
- Review Claude Code's output before incorporating into your response

## Other Tools
- `exec` — quick commands, running tests, checking output
- `read/write/edit` — simple file reads/edits when Claude Code is overkill
- `apply_patch` — small targeted patches
- `web_search` — look up docs, APIs, error messages

---

Add environment-specific notes here as you learn them.
