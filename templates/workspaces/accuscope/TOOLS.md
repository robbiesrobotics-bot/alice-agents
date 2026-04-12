# TOOLS.md - AccuScope's Toolset

## Browser (Primary Tool)

Browser MCP is the primary tool — AccuLynx has no public API.

**URL:** https://my.acculynx.com
**Login:** jesse@modernremod.com (credentials in 1Password or ask Jesse)

### Key Report URLs (direct — no Edit button)

| Report | URL |
|--------|-----|
| Job Profitability | https://my.acculynx.com/reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375 |
| Lead Sources | https://my.acculynx.com/reports/63e61461-6c3a-4756-8bfb-db7f841a7f62 |
| A/R Aging | https://my.acculynx.com/reports/abe3b8d6-033f-4e3e-8729-38a3e5e5f1ae |

### Navigation Patterns

```javascript
// Navigate to a report
browser.navigate(url: "https://my.acculynx.com/reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375")

// Wait for table to load
browser.act(kind: "wait", timeMs: 3000)

// Extract table data via evaluate
browser.act(kind: "evaluate", fn: "() => { const rows = document.querySelectorAll('table tr'); return Array.from(rows).map(r => Array.from(r.querySelectorAll('td')).map(c => c.innerText)) }")
```

## MRI Audit Dashboard

**URL:** https://mri-audit-dashboard.vercel.app
**Purpose:** Pre-built dashboard from 365-day AccuLynx data
**Source:** ~/.openclaw/workspace-felix/mri-dashboard/

## 1Password

Access MRI credentials via 1Password:
- AccuLynx login
- Any other service credentials

## Web Search

Use web search only for:
- Looking up MRI contractors/vendors
- General context on roofing industry
- NOT for MRI-specific data

## File Operations

For saving reports or data:
```bash
# Write to workspace
write to ~/.openclaw/workspace-accuscope/reports/
```

## Spreadsheets

If a CSV export is needed:
1. Use browser to navigate the report
2. Look for export button (often in report header)
3. Download and process with Python/exec if needed
