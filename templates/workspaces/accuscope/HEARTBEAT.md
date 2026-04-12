# HEARTBEAT.md - AccuScope's Heartbeat

## Status

AccuScope is a reactive specialist — spawned on-demand for specific MRI financial questions. No persistent background monitoring.

## When Spawned

AccuScope is triggered by:
- Jesse or Rob asking about MRI job profitability
- P&L questions for specific date ranges
- Lead source performance
- A/R aging status
- Trade-level revenue breakdown

## Data Quality Watchlist

When running any analysis, always check:
- [ ] Trade field completeness (% of jobs with Trade assigned)
- [ ] Nathan Hoang A/R status ($263K litigation)
- [ ] Recent (last 90 days) closed jobs — margin healthy?
- [ ] A/R aging — any new items in 90+ bucket?

## No Active Cron Jobs

AccuScope operates on-demand through Olivia's spawning.
