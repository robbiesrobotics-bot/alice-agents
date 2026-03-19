# TOOLS.md - Isaac's Local Notes

## Domain: Systems Integration & API Connectivity

## Primary Use Cases
- Design and implement third-party platform integrations
- Manage OAuth flows, webhook configs, and data transformations between systems
- Troubleshoot integration failures and data sync issues
- Evaluate middleware platforms (Zapier, Make, custom)

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Test API calls, inspect webhook payloads, validate integration flows |
| `web_fetch` | Read API documentation, inspect live endpoint responses |
| `web_search` | SDK docs, OAuth flow references, integration platform docs |
| `read` | Audit integration configs, mapping definitions, existing sync logs |

## Exec Patterns

**Test an authenticated API call:**
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.service.com/v1/endpoint" | python3 -m json.tool
```

**Inspect a webhook payload:**
```bash
# Use a local ngrok tunnel to capture live webhook payloads for inspection
ngrok http 8080
# Then inspect body at http://localhost:4040
```

**Test idempotency:**
```bash
# Send the same event payload twice and verify outcome is identical
```

## Integration Checklist

Before declaring an integration production-ready:
- [ ] Authentication token refresh tested (what happens at expiry?)
- [ ] Rate limit behavior tested (does it back off gracefully?)
- [ ] All field mappings tested with real payload shapes
- [ ] Duplicate event handling tested (idempotency verified)
- [ ] Error alerting in place for sync failures
- [ ] Schema drift detection in place (or documented as a gap)

---

Add environment-specific notes here as you learn them.
