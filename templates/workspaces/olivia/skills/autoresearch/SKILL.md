# SKILL.md — autoresearch

## Overview
Queue a research task for Aria (the autonomous research agent) to process. The skill writes a JSON task file to the Ubuntu Desktop queue directory via SSH. Aria polls the queue and processes tasks continuously.

## Usage
```
autoresearch(topic="...", project="namibia|bllm", depth="quick|medium|deep", priority="low|normal|high")
```

## Parameters
- `topic` (required): The research topic or question
- `project` (required): `namibia` (infrastructure) or `bllm` (OperationBLLM)
- `depth` (optional): `quick` (5min), `medium` (30min), `deep` (2hr+). Default: `medium`
- `priority` (optional): `low`, `normal`, `high`. Default: `normal`

## Implementation
1. Connect to Ubuntu Desktop via SSH: `ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119`
2. Write task JSON to `/home/alpha/alice-autonomous-researcher/queue/{project}/{topic-sanitized}-{timestamp}.json`
3. Include all fields: topic, project, depth, priority, requester, timestamp, received_at
4. Return the task ID and queue position

## SSH Connection
- Host: `alpha@100.106.110.119`
- Key: `~/.ssh/id_ed25519`
- The alpha user has write access to the queue directory

## Queue Directory Structure
```
/home/alpha/alice-autonomous-researcher/
  queue/
    namibia/    ← Aria-Namibia tasks
    bllm/       ← Aria-BLLM tasks
  processing/   ← Aria moves tasks here while working
  namibia-findings/   ← Aria writes completed research here
  bllm-findings/     ← Aria writes completed research here
```

## Examples
```bash
# Queue a quick Namibia topic
autoresearch(topic="Groq API pricing for Namibia", project="namibia", depth="quick")

# Queue a deep BLLM topic
autoresearch(topic="501c3 filing process for community AI org", project="bllm", depth="deep", priority="high")
```
