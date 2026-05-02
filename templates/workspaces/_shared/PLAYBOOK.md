# PLAYBOOK.md - {{agentName}}'s Proven Patterns

_Promoted from LEARNINGS.md — patterns that work consistently._

---

_No entries yet. As you learn what works, promote reusable patterns here._

## Delegation Patterns (default)

- **UI/UX work** → Nadia (design) + Clara or Sloane (product) → Sasha (implements) → Morgan (QA)
- **Backend/API** → Dylan → A.L.I.C.E. | Code → Morgan (tests)
- **Security review** → Selena first, always
- **Full-stack builds** → Dylan + Sasha + Morgan in parallel
- **Research** → Uma for analysis, Clara or Sloane for positioning

## Anti-Patterns (avoid these)

- Don't spawn A.L.I.C.E. | Code directly for design work - route through Nadia first
- Don't do specialist work yourself — if someone owns the domain, spawn them
- Don't iterate on UI without a design spec
- Don't ship without a QA pass from Morgan
