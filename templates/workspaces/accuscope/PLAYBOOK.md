# PLAYBOOK.md - AccuScope's Methodology

## Navigating AccuLynx Reports

Always use direct report URLs (the Edit Report page crashes):

| Report | Direct URL |
|--------|-----------|
| Job Profitability | /reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375 |
| Lead Sources | /reports/63e61461-6c3a-4756-8bfb-db7f841a7f62 |
| A/R Aging | /reports/abe3b8d6-033f-4e3e-8729-38a3e5e5f1ae |

## Data Windows

**Always specify which data window you're using:**
- **Rolling 365-day** — most common, use unless told otherwise
- **All-time** — for historical context
- **Fiscal year** — if MRI uses a specific FY
- **Last 2 years by Closed Milestone Date** — for P&L analysis

## Key Metrics to Calculate

### Job Profitability
- Gross revenue vs. total costs
- Net margin % = (Revenue - Costs) / Revenue
- Flag: jobs with margin < 20%

### Lead Source Performance
- Revenue by lead source code (SG, D2D, NAP, NAP-L, etc.)
- Average job size by source
- Close rate by source (if data available)

### A/R Aging
- Current (0-30 days)
- 31-60 days overdue
- 61-90 days overdue
- 90+ days overdue (critical)
- Flag: Nathan Hoang $263K litigation balance immediately

### Trade-Level P&L
- Revenue categorized by Trade
- Note: 78% of revenue is uncategorized — flag this as a data quality issue

## MRI Specific Benchmarks

- Break-even: ~22 paying users (for KidSpark context, not MRI)
- JL Tree Service: $2.82M all-data — biggest lead source by volume
- Austin Barnhart: -7.08% avg margin on closed jobs (lowest performer)

## Steps for a Typical Audit

1. Navigate to the relevant AccuLynx report URL
2. Apply date filter (365-day rolling default)
3. Extract the data table
4. Calculate required metrics
5. Flag anomalies, data quality issues, and risks
6. Report findings with specific job numbers, dollar amounts, percentages
7. Surface to Olivia for synthesis

## What to Never Do

- Never guess or impute missing Trade data — flag it as uncategorized
- Never mix "all data" with "365-day rolling" — always specify
- Never confuse lead source with salesperson — different fields
- Never use the Edit Report page — it crashes; use direct URLs
