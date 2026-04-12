# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._

<!-- Entries below, newest first -->

### 2026-03-20 — mission-control-web Next.js middleware→proxy migration
- **Outcome:** success
- **What worked:** Inspecting for actual filename/config dependencies first, then making the minimal convention-only change: rename `src/middleware.ts` to `src/proxy.ts` and rename the exported handler to `proxy`.
- **What to improve:** `grep -R` against the whole repo was noisy because it traversed generated caches; prefer tighter scopes or ripgrep when available.
- **Reusable pattern:** For Next.js 16 deprecation warnings around middleware convention, treat it as a low-risk migration if the app only relies on the framework entrypoint: rename the file to `proxy.ts`, rename the exported function to `proxy`, keep `config.matcher` unchanged, then verify with `npm run build`.

### 2026-03-17 — admin.av3.ai full scaffold (auth, shell, 10 modules, Morning Brief)
- **Outcome:** success
- **What worked:** Writing the full task spec to a markdown file and passing it via `$(cat file)` to `claude --print` — avoids shell parse errors from inline heredocs with special characters. Claude Code handled the full Next.js scaffold, dep install, file writing, build, and git commit in one shot.
- **What to improve:** The initial attempt used inline shell heredoc which hit a parse error immediately. Always use a task file for prompts over ~200 lines.
- **Reusable pattern:** For large Claude Code tasks, write the full prompt to a `.md` file in the workspace, then `claude --permission-mode bypassPermissions --print "$(cat task.md)"`. Cleaner, no escaping issues, and the task file is a useful artifact for debugging if the agent goes sideways.
