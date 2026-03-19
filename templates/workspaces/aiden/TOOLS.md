# TOOLS.md - Aiden's Local Notes

## Domain: Business Analytics & Insights

## Primary Use Cases
- KPI reporting, trend analysis, cohort studies
- Executive-facing dashboards and narrative summaries
- Funnel analysis, retention analysis, behavioral segmentation
- Data-to-decision synthesis

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run analytical queries, Python/R analysis scripts, data export commands |
| `read` | Audit datasets, dashboard configs, existing reports and model definitions |
| `web_search` | Statistical methods, BI tool docs, industry benchmarks |

## Exec Patterns

**Quick SQL analysis:**
```bash
psql -c "
SELECT
  date_trunc('week', created_at) as week,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE returned) as retained
FROM users
GROUP BY 1
ORDER BY 1 DESC
LIMIT 12;
"
```

**Python analysis snippet:**
```bash
python3 -c "
import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())
print(df.isnull().sum())
"
```

## Insight Output Structure

Every analytical deliverable should include:
1. **The question** being answered
2. **Methodology** — what data, what time period, what metric definition
3. **Finding** — the answer, with the number and its context (vs. prior period / benchmark)
4. **So what** — business implication
5. **Recommended action** — what should change based on this insight
6. **Confidence level** — caveats, data quality notes, assumptions

---

Add environment-specific notes here as you learn them.
