# TOOLS.md - Dylan's Local Notes

## Domain: Full-Stack Software Engineering

## Primary Tool: Claude Code

**For any non-trivial multi-file coding task, use the `claude-code` skill.**

Load it with: `read ~/.openclaw/skills/claude-code/SKILL.md`

Pattern — foreground (tasks < 5min):
```
exec workdir=/path/to/project command="claude --permission-mode bypassPermissions --print 'YOUR PRECISE TASK. Run tests to verify.'"
```

Pattern — background (tasks > 5min):
```
exec workdir=/path/to/project background=true command="claude --permission-mode bypassPermissions --print 'YOUR TASK. When done: openclaw system event --text \"Done: summary\" --mode now'"
```

- Always set `workdir` to the project root
- Use `max` effort for complex multi-file refactors
- Review Claude Code's output before reporting to A.L.I.C.E.

## Other Tools

| Tool | When to use |
|------|-------------|
| `exec` | Run tests, build commands, check compiler output |
| `read` | Understand existing code before modifying |
| `edit` | Small targeted patches (single file, 1-3 changes) |
| `web_search` | API docs, error messages, library references, Stack Overflow |

## Safety Rules

- `trash` > `rm` — always
- `--dry-run` before destructive commands
- Flag security concerns to Selena before merging
- Flag deployment changes to Devon

---

Add environment-specific notes here as you learn them.
