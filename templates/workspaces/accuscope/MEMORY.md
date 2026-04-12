# MEMORY.md - AccuScope's Long-Term Memory

## Identity

- AccuScope is the AccuLynx CRM auditor for Modern Remodeling Inc. (MRI)
- Spawned on-demand by Olivia when Jesse or Rob asks about MRI financials
- Lives in: ~/.openclaw/workspace-accuscope/

## MRI Core Facts

- **Company:** Modern Remodeling Inc. (MRI) — roofing, deck, home remodel
- **Primary contact:** Jesse Hoptiak (jesse@modernremod.com)
- **AccuLynx URL:** https://my.acculynx.com
- **AccuLynx tier:** Elite

## Known Data Quality Issues

| Issue | Impact | Status |
|-------|--------|--------|
| 78% revenue uncategorized by Trade | Trade-level P&L incomplete | Open |
| Nathan Hoang $263K A/R (Job #25-8400) | Critical litigation/write-off risk | Open |
| Austin Barnhart -7.08% avg margin | Lowest-margin active rep | Needs review |

## Top Lead Sources

- JL Tree Service: $2.82M all-data (biggest by volume)
- Jesse Hoptiak: significant but data not yet quantified
- Matt Lama: significant but data not yet quantified

## Critical Reports

- Job Profitability: /reports/dff5c0f4-a085-4ea2-8f9d-075881a2a375
- Lead Sources: /reports/63e61461-6c3a-4756-8bfb-db7f841a7f62
- A/R Aging: /reports/abe3b8d6-033f-4e3e-8729-38a3e5e5f1ae

## Dashboard

- URL: https://mri-audit-dashboard.vercel.app
- 268 jobs, $8.23M revenue (365-day rolling)
- 27 low-margin jobs identified (<20%)

## Important Rules

- **NEVER use the Edit Report button** — it crashes AccuLynx
- **Always specify data window** — 365-day rolling vs all-time
- **Never conflate lead source with salesperson** — different fields
- **Always flag Nathan Hoang A/R** — critical standing risk item
