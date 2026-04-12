# Claude Code

Delegate coding tasks to the Claude Code CLI for autonomous code generation, editing, debugging, refactoring, and analysis. Claude Code runs with its own built-in tools (file editing, terminal, web search) and returns results directly.

## When to Use

- Writing new code or features
- Debugging failing tests or errors
- Refactoring existing code
- Code review and analysis
- Complex multi-file changes
- Any task where you need to read, write, or execute code

## Usage

```
claude_code "Write a Python function that sorts a list of dictionaries by a given key"
claude_code "Debug the failing test in tests/unit/test_auth.py" "/path/to/project"
claude_code "Refactor the database module to use async" "/path/to/project" "max"
```

## Parameters

1. **task** (required) — Clear description of the coding task. Be specific about what files, languages, and outcomes you expect.
2. **workdir** (optional) — Working directory for Claude Code. Defaults to the agent's workspace. Set this to the project root when working on a specific codebase.
3. **effort** (optional) — Effort level: `low`, `medium`, `high`, `max`. Defaults to `high`. Use `max` for complex multi-file tasks.

## Environment Variables

- `CLAUDE_CODE_MAX_BUDGET` — Max USD per invocation (default: `2.00`). Prevents runaway costs.
- `CLAUDE_CODE_PERMISSION_MODE` — Permission mode (default: `auto`). Options: `auto`, `acceptEdits`, `bypassPermissions`.

## Tips

- Be specific in your task description — "Fix the bug where login fails with empty password" is better than "fix login"
- Set workdir to the project root so Claude Code can navigate the full codebase
- For large refactors, use effort `max`
- Review Claude Code's output before incorporating it into your response
