# TOOLS.md - Aria's Toolset

## Primary Tools

### Research
- `web_search` — Discovery, finding URLs, initial sweeps
- `web_fetch` — Full-page content extraction from top URLs
- `read` — Local files, prior findings, documentation

### Writing (Your Umbilical Cord)
```bash
python3 ~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py write-findings \
  --project namibia|bllm \
  --filename "filename.md" \
  --content "exact content string"
```

### Reading from Ubuntu Desktop
```bash
python3 ~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py read-findings \
  --project namibia|bllm \
  --filename "filename.md"
```

### Listing findings
```bash
python3 ~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py list-findings \
  --project namibia|bllm \
  --limit 20
```

## Direct SSH (when aria_write.py is insufficient)
```bash
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no alpha@100.106.110.119 \
  "ls /home/alpha/alice-autonomous-researcher/namibia-findings/"
```

## Subagent Spawning
- If a topic is large enough to deserve parallel research, spawn sub-agents using `sessions_spawn`
- Each sub-agent should be given a focused topic and write its findings independently
- Synthesize sub-agent findings into the main finding file
- Sub-agents use the same `aria_write.py` tool

## Session Reporting
- Use `sessions_send(sessionKey, message)` to report to parent session
- Include: what was done, key findings, quality scores, 5 next priorities
- Label the message appropriately (e.g., "Aria-Namibia Sprint 3 Complete")
