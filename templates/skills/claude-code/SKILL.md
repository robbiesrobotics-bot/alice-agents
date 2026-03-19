---
name: claude-code
description: 'Delegate implementation tasks to Claude Code. Use when: (1) building new features or apps, (2) porting/refactoring code across multiple files, (3) fixing bugs that require file exploration, (4) any coding task that needs read+write+exec across a codebase. NOT for: planning/research (do that yourself), simple single-line edits (use edit tool directly), reading files (use read tool). Always give Claude Code a working directory and a precise task. Use background:true for long tasks and poll for completion.'
metadata:
  {
    "openclaw": { "emoji": "⚡", "requires": { "anyBins": ["claude"] } }
  }
---

# Claude Code Skill

Runs Claude Code (`claude` CLI) in `--print --permission-mode bypassPermissions` mode.
No PTY needed. Fully autonomous — reads, writes, edits, runs shell commands.

## When to use this skill

Use Claude Code when the task requires:
- Creating or modifying **multiple files**
- Running **build/test/lint** commands to verify correctness
- Exploring an unfamiliar codebase before writing
- Any implementation work that would take you many tool calls

## Basic pattern

```
exec:
  workdir: /path/to/project
  command: claude --permission-mode bypassPermissions --print 'YOUR TASK HERE'
```

## Background pattern (for long tasks)

```
exec:
  workdir: /path/to/project
  background: true
  command: claude --permission-mode bypassPermissions --print 'YOUR TASK HERE.

When done, run: openclaw system event --text "Done: brief summary" --mode now'
```

Then poll with `process(action=log, sessionId=...)` to check progress.

## Writing good prompts for Claude Code

1. **Start with context** — tell it what the project is and what exists
2. **Be specific** — name exact files, functions, behaviors expected
3. **State success criteria** — "run npm run build and it must pass"
4. **End with notification** — always append the `openclaw system event` line for long tasks

## Example: Feature build

```
exec:
  workdir: /Users/aliceclaw/.openclaw/workspace-olivia/mission-control
  background: true
  command: >
    claude --permission-mode bypassPermissions --print '
    This is a Next.js 16 + TypeScript + shadcn/ui app.
    
    Task: Add an AgentWizard modal to src/app/agents/page.tsx.
    - Read src/app/agents/page.tsx first
    - Read src/components/ui/ to see available components
    - Build a multi-step Dialog: name → domain → preview → confirm
    - On confirm, POST /api/agents with the form data
    - The page should refresh the agent list after creation
    
    Run npm run build at the end and fix any TypeScript errors.
    
    When done: openclaw system event --text "AgentWizard complete" --mode now
    '
```

## Example: Bug fix

```
exec:
  workdir: /path/to/project
  command: claude --permission-mode bypassPermissions --print 'Fix the TypeScript error in src/lib/openclaw.ts line 42. Run npm run build to verify.'
```

## Example: Code review

```
exec:
  workdir: /path/to/project
  command: claude --permission-mode bypassPermissions --print 'Review src/app/agents/page.tsx for bugs, performance issues, and missing error handling. Output a numbered list of findings.'
```

## Rules for agents using this skill

1. **Give a precise workdir** — Claude Code needs to know where it is
2. **One task per invocation** — don't chain unrelated work in one prompt
3. **Always verify** — ask Claude Code to run the build/tests before finishing
4. **Background for >5min tasks** — use background:true and the notification line
5. **Report results** — after Claude Code finishes, summarize what changed to A.L.I.C.E.
6. **Never run in ~/.openclaw/ itself** — always in a project subdirectory

## Agents authorized to use this skill

All coding specialists: dylan, felix, isaac, caleb, darius, avery, devon, quinn, alex
Orchestrator: olivia (for coordination tasks only)

## Checking if claude is available

```
exec:
  command: which claude && claude --version
```

If not found, tell A.L.I.C.E. — she'll handle escalation.
