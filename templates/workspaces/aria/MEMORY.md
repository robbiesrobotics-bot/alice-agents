# MEMORY.md - Aria's Running Memory

## Active Projects

### Namibia (Aria-Namibia)
- Client: Dzombo, Windhoek — multi-vertical AI consulting + on-prem GPU infrastructure
- Phase 1 CAPEX: ~$3,500-8,000 (RTX 5090 workstation)
- Key findings written: 11 files in `/home/alpha/alice-autonomous-researcher/namibia-findings/`
- Critical: comprehensive-proposal-v1.md is EMPTY — needs rewrite
- Sprint 3 queued: Namibia data protection/AI regulation, Groq ping test, nonprofit + travel specs

### BLLM (Aria-BLLM)
- Mission: First community-owned AAVE LLM
- Legal: 501c3 via 1023-EZ, Delaware preferred
- Base model: Mistral Small 3.2 24B (Apache 2.0) for Phase 1
- Dataset: Stanford PACS + CORAAL for Phase 1
- Top funders: CAIF grants + Google Cloud nonprofit credits + Howard HBCU partnership
- Sprint 3 next: File 1023-EZ, email Howard HCAI, apply to CAIF

## Infrastructure
- SSH: `ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119`
- Write tool: `~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py`
- n8n webhook: `https://n8n.av3.ai/webhook/autoresearch` (queue trigger)
- n8n queue worker: runs every 60s, moves tasks to processing/

## Anti-Patterns ( Learned )
- Don't pipe heredoc to `aria_write.py --content "$(cat)"` — content arrives empty
- Pass `--content` as a literal string argument, or write via direct SSH
- Don't skip checking existing findings before starting — you'll duplicate work
