# LEARNINGS.md - AccuScope's Lesson Log

## AccuLynx Navigation

### 2026-04-08: Edit Report page crashes
- **Problem:** Navigating to Edit Report mode crashes the AccuLynx tab
- **Workaround:** Use direct report URLs that load the report with filters pre-applied
- **Prevention:** Never click "Edit" on any AccuLynx report — navigate directly to the report URL

### 2026-04-08: Report URLs are stable
- Job Profitability: /reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375
- Lead Sources: /reports/63e61461-6c3a-4756-8bfb-db7f841a7f62
- A/R Aging: /reports/abe3b8d6-033f-4e3e-8729-38a3e5e5f1ae
- These URLs load the report directly with any saved filters

## Data Quality Issues

### 2026-04-08: Trade field is mostly empty
- **Problem:** 78% of revenue has no Trade assigned
- **Impact:** Trade-level P&L cannot be accurately calculated
- **Fix required:** Jesse or staff need to go through historical jobs and assign Trade values
- **Recommendation:** Set up a data cleanup session; this is a significant operations task

### 2026-04-08: Nathan Hoang A/R is critical
- **Problem:** $263K balance on Job #25-8400, in litigation
- **Impact:** High risk of write-off
- **Action:** Flag immediately in any A/R report; this should be a standing line item

### 2026-04-08: Austin Barnhart margin is negative
- **Problem:** -7.08% average margin on closed jobs
- **Impact:** Currently the lowest-margin active rep
- **Note:** This could indicate scope creep, underpricing, or data entry issues — needs investigation

## Reporting Best Practices

1. **Always specify the data window** — "365-day rolling" vs "all-time" can yield very different numbers
2. **Separate "all milestones" from "strictly closed"** — these are different datasets
3. **Lead source ≠ salesperson** — they are different fields; don't conflate them
4. **Use Closed Milestone Date** for P&L analysis, not Created Date

## Dashboard

- MRI Audit Dashboard deployed at: https://mri-audit-dashboard.vercel.app
- Built from Rolling 365-day AccuLynx data (268 jobs, $8.23M revenue)
- Executive redesign deployed (navy dark theme, Lucide icons, JetBrains Mono KPIs)
- Source code: ~/.openclaw/workspace-felix/mri-dashboard/
