# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._

<!-- Entries below, newest first -->

### 2026-03-17 — Add Vercel deploy + npm CI workflows for alice-agents
- **Outcome:** success
- **What worked:** Creating GitHub Actions workflows directly and committing to both repos (alice-landing + alice-agents). Hardcoded Vercel org/project IDs in env vars; VERCEL_TOKEN stays in secrets. Used shell loop for syntax check (node --check) to handle glob expansion correctly in bash.
- **What to improve:** The `npm test` conditional using `node -e require(...)` works but ESM packages may need `--input-type` flag in future.
- **Reusable pattern:** For Vercel auto-deploy via GHA: `vercel --prod --token ${{ secrets.VERCEL_TOKEN }} --yes` with VERCEL_ORG_ID/VERCEL_PROJECT_ID in env. Always run `npm ci && npm run build` first to catch errors before deploy.
