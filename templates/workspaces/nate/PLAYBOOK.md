# PLAYBOOK.md - N8N Agent's Workflow Methodology

## Building a New Workflow

### Step 1: Clarify the Trigger
- What starts the workflow? (webhook, schedule, cron, event, manual)
- What's the payload/data shape?
- What's the expected output?

### Step 2: Design the Flow (in text first)
```
Trigger: POST /webhook/myworkflow
  → Authenticate (if needed)
  → Parse payload (JSON)
  → Validate required fields
  → [Action 1] — e.g., write to Supabase
  → [Action 2] — e.g., send notification
  → Respond 200 OK
Error path:
  → Slack/Telegram alert
  → Respond 4xx/5xx
```

### Step 3: Write the Workflow JSON
- Use the n8n workflow JSON schema
- Nodes should have descriptive names (not "HTTP Request", but "Stripe → Parse Checkout Event")
- Add error workflows for critical paths
- Include `notes` field on complex nodes explaining the logic

### Step 4: Test in Staging
- Deploy to n8n (POST /workflows or import via UI)
- Activate in **test mode** — run with sample payload
- Check execution log for errors
- Fix and re-deploy

### Step 5: Activate in Production
- Save production version to `/home/alpha/n8n-workflows/{workflow-name}/{version}/workflow.json`
- Activate the workflow
- Set up monitoring (execution success rate, error alerts)

---

## Common Workflow Patterns

### Webhook Handler
```
HTTP Request (POST) → Switch (route by event type) → [branch nodes] → HTTP Response
                                           ↓
                                     Error Workflow → Telegram alert
```

### Scheduled Job
```
Cron/Schedule → HTTP Request (fetch data) → Process → [actions] → Log result
                                     ↓
                              Error Workflow → Telegram alert
```

### AI Pipeline Trigger
```
Webhook → Parse request → Build prompt → LLM node → Parse response → [actions]
```

### Queue Worker
```
Cron (every 1 min) → Redis LRANGE → Loop over items → Process each → LPUSH results
```

---

## Workflow JSON Schema Reference

```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "name": "Node Display Name",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [100, 300],
      "parameters": { ... },
      "credentials": { "httpQueryAuth": "my-api-key" },
      "notes": "What this node does"
    }
  ],
  "connections": {
    "NodeName": {
      "main": [[{ "node": "NextNode", "type": "main", "index": 0 }]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

## n8n API Reference

### Base URL
`https://n8n.av3.ai`

### Auth
Header: `X-N8N-API-KEY: <token>`

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List all workflows |
| GET | `/workflows/{id}` | Get single workflow |
| POST | `/workflows` | Create workflow |
| PUT | `/workflows/{id}` | Update workflow |
| DELETE | `/workflows/{id}` | Delete workflow |
| POST | `/workflows/{id}/activate` | Activate workflow |
| POST | `/workflows/{id}/deactivate` | Deactivate workflow |
| GET | `/executions` | List executions |
| GET | `/executions/{id}` | Get execution details |
| POST | `/executions/{id}/retry` | Retry execution |
| GET | `/credentials` | List credentials |
| POST | `/credentials` | Create credential |

---

## Diagnosing a Broken Workflow

1. **Check execution log** — GET /executions?filter=error or check n8n UI
2. **Identify the failing node** — look at the error message in the execution log
3. **Common causes**:
   - Credential expired → rotate in n8n credentials vault
   - API rate limited → add Wait node or throttle
   - Payload shape changed → update the Parse/Switch node
   - Node version mismatch → check n8n version, update node type
4. **Fix and redeploy** — update via PUT /workflows/{id}
5. **Notify** — send Telegram message to Rob if it was a production failure

## n8n Database (PostgreSQL on Ubuntu Desktop)

When you need to query n8n's internal DB directly:
```bash
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "psql postgresql://n8nuser:n8npass@localhost:5432/n8n -c 'SELECT * FROM execution_entity WHERE status = '\''error'\'' ORDER BY started_at DESC LIMIT 10'"
```

Key tables:
- `workflow_entity` — workflow definitions
- `execution_entity` — execution history (status: success/error/running)
- `credential_entity` — encrypted credentials

## n8n Redis Queue (Ubuntu Desktop)

Check queue depth:
```bash
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "redis-cli -h localhost GET 'n8n:queue:main:waiting:count'"
```

Clear stuck executions:
```sql
DELETE FROM execution_entity WHERE status = 'running' AND started_at < NOW() - INTERVAL '1 hour';
```
