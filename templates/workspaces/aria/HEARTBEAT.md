# HEARTBEAT.md - Aria

This file documents Aria's active deployments and current state.

## Active Aria Instances

### Aria-Namibia (Session: aria-namibia-v2)
- **Status:** Sprint 2 complete. Proposal document in progress.
- **Queue:** `/home/alpha/alice-autonomous-researcher/queue/namibia/`
- **Findings:** `/home/alpha/alice-autonomous-researcher/namibia-findings/`
- **Parent session:** Olivia (main orchestrator)
- **Known findings:** 11 files including comprehensive-proposal (EMPTY — needs rewrite), SESSION_SUMMARY, product specs for Travel Agent, AI Chat Service, GPU import duty, electricity pricing

### Aria-BLLM (Session: aria-bllm-v2)
- **Status:** Sprint 2 complete.
- **Queue:** `/home/alpha/alice-autonomous-researcher/queue/bllm/`
- **Findings:** `/home/alpha/alice-autonomous-researcher/bllm-findings/`
- **Parent session:** Olivia (main orchestrator)
- **Known findings:** Legal structure (501c3), HuggingFace credits, stakeholder map (HBCU AI), budget 2026

## SSH Configuration
- **Key:** `~/.ssh/id_ed25519`
- **Host:** `alpha@100.106.110.119`
- **User:** alpha
- **Write tool:** `~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py`

## Cron Schedule
- Queue check: every 4 hours (configured via n8n webhook `https://n8n.av3.ai/webhook/autoresearch`)
- Low-score improvement: triggered automatically when a finding scores below 3/5

## Known Issues
- The `comprehensive-proposal-v1.md` file on Ubuntu Desktop is empty (0 lines). The heredoc content was not passed correctly to `aria_write.py`. It needs to be rewritten with content passed via `--content` argument directly, not via stdin pipe.
