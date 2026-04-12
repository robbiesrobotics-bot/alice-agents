# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._
_Olivia periodically reviews these and promotes the best patterns into PLAYBOOK.md._

<!-- Entries below, newest first -->

### 2026-03-28 — Triple-Check COPPA Compliance Audit for KidSpark AI (Legal Briefing Document)
- **Outcome:** success
- **What worked:** Going directly to the eCFR (16 CFR Part 312) and the Federal Register final rule text gave authoritative citations. Cross-referencing with multiple law firm analyses (White & Case, Akin Gump, Reed Smith, etc.) caught nuances like the AI training consent requirement from the FTC commentary. Building the product-by-product risk matrix forced systematic coverage of all 6 KidSpark products.
- **What to improve:** Safe Harbor program pricing is opaque — I provided estimates but couldn't get exact figures. Should also have researched international compliance (GDPR-K, UK AADC) in case KidSpark serves non-US children. The FTC 6(b) inquiry into AI chatbots (Sept 2025) is still ongoing — should monitor for outcomes.
- **Reusable pattern:** For children's privacy compliance audits: (1) Start with threshold analysis (is the service "directed to children"?), (2) Pull the actual CFR text for requirements, (3) Layer in enforcement precedent to illustrate penalties, (4) Map each product to specific risks, (5) Create a phased pre-launch checklist with dependencies. The FTC commentary on the Final Rule is as important as the rule text itself — it contains AI-specific guidance not in the regulatory text.

### 2026-03-28 — Comprehensive COPPA Security & Compliance Plan for Kid-Facing AI Services
- **Outcome:** success
- **What worked:** Structured research → synthesis approach. Started with FTC primary sources (federal register, FTC compliance guides) for authoritative COPPA requirements, then layered in industry analysis for the 2025 amendments. Covering six domains in a single document with cross-references kept it coherent.
- **What to improve:** Should have also researched state-level children's privacy laws (CA CCPA/CPRA minor provisions, Illinois BIPA, etc.) for a more complete picture. Flagged as a gap but didn't research specifics.
- **Reusable pattern:** For compliance plans targeting children: start from the federal baseline (COPPA), note the 2025 amendment compliance deadline (April 22, 2026), and design for the strictest interpretation. The UTMA custodial LLC structure is the standard recommendation for minor-owned businesses. Three-layer content safety (input filter → system prompt → output filter) is the minimum for AI services serving minors.

### 2026-03-20 — Replaced static RBAC operator placeholder with runtime-backed identity
- **Outcome:** success
- **What worked:** Auditing adjacent auth/session code first exposed an existing safe identity primitive (`resolveRuntimeOperatorContext`) and a concrete team role source (`team_members.role`), which let me remove the hardcoded admin placeholder without inventing a new contract.
- **What to improve:** Add focused tests around role mapping and fallback behavior so future auth changes don't silently widen privileges.
- **Reusable pattern:** When a repo has placeholder identity code, prefer wiring it to already-shipping request/session context plus explicit soft fallbacks instead of creating parallel auth abstractions.
