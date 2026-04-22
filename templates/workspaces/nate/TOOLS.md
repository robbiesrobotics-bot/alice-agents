# TOOLS.md - N8N Agent's Toolset

## n8n API (Primary Tool)

All n8n management is done via REST API — never through the UI for changes.

```bash
N8N_TOKEN="<JWT_TOKEN>"
N8N_URL="https://n8n.av3.ai"

# List workflows
curl -s -H "X-N8N-API-KEY: $N8N_TOKEN" "$N8N_URL/workflow"

# Get single workflow
curl -s -H "X-N8N-API-KEY: $N8N_TOKEN" "$N8N_URL/workflows/123"

# Create workflow
curl -s -X POST -H "X-N8N-API-KEY: $N8N_TOKEN" \
  -H "Content-Type: application/json" \
  -d @workflow.json \
  "$N8N_URL/workflows"

# Activate workflow
curl -s -X POST -H "X-N8N-API-KEY: $N8N_TOKEN" \
  "$N8N_URL/workflows/123/activate"

# Deactivate workflow
curl -s -X POST -H "X-N8N-API-KEY: $N8N_TOKEN" \
  "$N8N_URL/workflows/123/deactivate"

# List executions
curl -s -H "X-N8N-API-KEY: $N8N_TOKEN" \
  "$N8N_URL/executions?limit=20&includeData=true"

# Get execution details
curl -s -H "X-N8N-API-KEY: $N8N_TOKEN" \
  "$N8N_URL/executions/456"
```

## Python Helper for n8n API

```python
import requests, json

N8N_URL = "https://n8n.av3.ai"
N8N_TOKEN = "<JWT_TOKEN>"

def n8n_request(method, path, data=None):
    url = f"{N8N_URL}{path}"
    headers = {"X-N8N-API-KEY": N8N_TOKEN, "Content-Type": "application/json"}
    r = requests.request(method, url, headers=headers, json=data)
    r.raise_for_status()
    return r.json()

def create_workflow(workflow_json):
    return n8n_request("POST", "/workflows", data=workflow_json)

def update_workflow(workflow_id, workflow_json):
    return n8n_request("PUT", f"/workflows/{workflow_id}", data=workflow_json)

def activate_workflow(workflow_id):
    return n8n_request("POST", f"/workflows/{workflow_id}/activate")

def list_workflows():
    return n8n_request("GET", "/workflows")
```

## SSH to Ubuntu Desktop

```bash
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no alpha@100.106.110.119 "command"
```

## Workflow File Storage

```bash
# Save workflow JSON to Ubuntu Desktop
WORKFLOW_NAME="my-workflow"
VERSION="v1"
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "mkdir -p /home/alpha/n8n-workflows/$WORKFLOW_NAME/$VERSION"
scp -i ~/.ssh/id_ed25519 workflow.json \
  alpha@100.106.110.119:/home/alpha/n8n-workflows/$WORKFLOW_NAME/$VERSION/

# Read back
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "cat /home/alpha/n8n-workflows/$WORKFLOW_NAME/$VERSION/workflow.json"
```

## Database Access (PostgreSQL on Ubuntu Desktop)

```bash
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "psql postgresql://n8nuser:n8npass@localhost:5432/n8n -c 'SELECT ...'"
```

## Redis Queue Check

```bash
ssh -i ~/.ssh/id_ed25519 alpha@100.106.110.119 \
  "redis-cli -h localhost -n 0 LLEN queue:jobs"
```

## Browser (n8n UI)

Use browser tool to:
- Visually inspect a workflow in the n8n editor
- Import a workflow from UI (paste JSON)
- Manually trigger a webhook for testing
- Check the n8n execution log UI
URL: https://n8n.av3.ai
