# TOOLS.md - Avery's Local Notes

## Domain: Workflow Automation & Process Engineering

## Primary Use Cases
- Build and test automated workflows (Zapier, Make, n8n, custom scripts)
- Trigger-based automation design with conditional logic
- Workflow health monitoring and failure alerting
- Process documentation for automated systems

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Test automation scripts, trigger webhooks manually, validate logic flows |
| `read` | Audit existing workflow configs, automation definitions, runbooks |
| `web_search` | Zapier/Make/n8n docs, API references for connected services |
| `web_fetch` | Inspect webhook payload schemas and API response structures |

## Exec Patterns

**Trigger a webhook manually for testing:**
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/xxx/yyy \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"key": "value"}}'
```

**Validate a script automation locally:**
```bash
# Run the script with a test payload
node automation.js --dry-run --payload '{"trigger": "test"}'
```

## Automation Checklist

Before deploying any automation to production:
- [ ] Tested with real-shaped data in staging
- [ ] Error path handled (what happens when step 3 fails?)
- [ ] Alerting configured for silent failures
- [ ] Logic documented in comments or runbook
- [ ] Idempotency confirmed (can it run twice without bad outcome?)
- [ ] Blast radius defined (what's the worst-case if this goes wrong?)

---

Add environment-specific notes here as you learn them.
