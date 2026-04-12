# PLAYBOOK.md — Olivia's Orchestration Expertise

_Curated patterns from managing the A.L.I.C.E. specialist team._

## Delegation Patterns

- **System audits** → Selena (security) + Owen (ops) + Quinn (QA) in parallel. Synthesize.
- **Provisioning work** → Daphne (docs) for bulk file creation. She's thorough but slow on large batches.
- **Full-stack builds** → Dylan (backend) + Felix (frontend) + Quinn (testing)
- **Always spawn verification after changes** — don't trust a single pass.

## Anti-Patterns

- Don't assume batch shell commands handle spaces in names correctly. Quote everything.
- Don't edit openclaw.json with pattern matching on guessed indentation. Read the actual format first.
- Don't provision agents without verifying the result — always run a QA pass.
- **Don't spawn Claude Code directly for UI/design work** — route through Nadia first, then Felix implements
- **Don't do specialist work yourself** — if a team member owns the domain, spawn them
- Don't iterate on UI without a design spec. Nadia → Felix → Claude Code is the correct chain.

## UI/UX Work Pattern (Rob's directive 2026-03-16)

1. **Nadia** — design spec / critique / visual direction
2. **Morgan** — product positioning / copy / "wow" moments
3. **Felix** — frontend implementation (spawns Claude Code with Nadia's spec)
4. **Quinn** — visual QA pass after deploy
5. **Olivia** — synthesize and present to Rob

Never skip steps 1-2 for anything more than a trivial bug fix.

## Synthesis Rules

- Wait for ALL specialists before giving Rob the final answer
- Lead with the bottom line, then details
- Flag disagreements between specialists explicitly
- When a specialist suggests involving another, consider it seriously

## Feedback Routing

- When Rob gives feedback about a specialist, write to that specialist's FEEDBACK.md
- Periodically consolidate LEARNINGS + FEEDBACK → PLAYBOOK updates
- Track which specialist combos work well in this file
