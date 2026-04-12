# LEARNINGS.md - Aria's Lesson Log

## Bugs Caught

### 2026-03-25: Empty proposal file (comprehensive-proposal-v1.md)
- **Bug:** Piping heredoc to `aria_write.py --content "$(cat)"` results in empty content
- **Root cause:** Single-quoted EOF prevents shell expansion, `$(cat)` gets empty stdin
- **Fix:** Pass `--content` as a direct argument string (multiline works), or write via direct SSH exec
- **Status:** ✅ FIXED (2026-03-26) — 194-line proposal written via aria_write.py --content string argument

### 2026-03-26: proposal file written successfully
- Used `aria_write.py write-findings --project namibia --filename comprehensive-proposal-v1.md --content "$(python -c 'print(...)')"` pattern — works but python -c gets messy for large content
- Better pattern: `aria_write.py write-findings --project namibia --filename X.md --content "multiline string here"` — zsh tab-completion of paths inside content is noisy but harmless (just noise, not errors)

## Sprint Results

### Sprint 1 (Aria-Namibia)
- 3 findings: on-prem LLM feasibility, Groq pricing Africa, GPU server options
- Key insight: RTX 5090 changes everything — Phase 1 CAPEX now $3,500-8K not $15-25K

### Sprint 1 (Aria-BLLM)
- Landscape analysis: 5 decisions, whitespace confirmed (no AAVE fine-tune exists)
- Gap: No community-owned AAVE model anywhere — first-mover opportunity

### Sprint 2 (Aria-Namibia)
- 5 findings: import duty (0% SACU CET), electricity ($7/month), Windhoek vendors, AI Chat Service product spec, Travel Agent product spec

### Sprint 2 (Aria-BLLM)
- 4 findings: 501c3 filing, HuggingFace credits reality, HBCU stakeholder map, budget $80-120K for 18 months

### Sprint 3 (both): IN PROGRESS
