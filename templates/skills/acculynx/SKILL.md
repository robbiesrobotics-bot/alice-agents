---
name: acculynx
description: 'Analyze AccuLynx CRM CSV exports and build a live visual P&L dashboard on Vercel. Use when: Jesse or Rob drops AccuLynx CSV files in the A.L.I.C.E Sales chat and asks for analysis, a visual dashboard, or a PDF report. Covers Job Profitability Report and Job Expenses Report. Handles data quality flagging, trade/rep/stage breakdowns, and Vercel deployment.'
metadata:
  {
    "openclaw": { "emoji": "📊", "requires": { "anyBins": ["python3", "node", "npx", "vercel"] } }
  }
---

# AccuLynx Analysis Skill

Builds a full visual P&L + Cash Flow dashboard from AccuLynx CSV exports and deploys it live to Vercel.

## Trigger Phrases
- "analyze acculynx"
- "build acculynx dashboard"
- "upload acculynx csv"
- "drop acculynx"
- "refresh the dashboard"
- "acclynx report"
- Any message with a `.csv` attachment from AccuLynx in the A.L.I.C.E Sales thread

## Two CSV Types (know the difference)

### 1. Job Profitability Report
**Filename pattern:** `Job_Profitability_Report*.csv`
**What it contains:** Per-job revenue, expenses, profit, margin %, stage, trades, salesperson
**Key columns:** `Contract Amount`, `Orders Total`, `Profit`, `Profit %`, `Total Expenses`, `Primary Salesperson`, `Order Trades`, `Current Milestone`
**Use for:** Overall P&L, top/bottom jobs, rep performance, trade profitability, margin distributions, data quality
**NOT for:** Cash flow (that's the Expenses Report)

### 2. Job Expenses Report
**Filename pattern:** `Job_Expenses_Report*.csv` or `job_expenses_report*.csv`
**What it contains:** Weekly cash outflows (paid expenses, unbudgeted/additional costs)
**Key columns:** `Payment Date (by week)`, `Total Paid Expenses`, `Paid Expenses Count`, `Additional Expenses Total`, `Additional Expenses Count`
**Use for:** Cash flow analysis, monthly expense trends, peak payout weeks
**NOT for:** Per-job profitability (use the Profitability Report for that)

## Standard Workflow

### Step 1 — Save the CSV(s)
When a CSV arrives via Telegram media attachment, it's auto-saved to:
```
/Users/aliceclaw/.openclaw/media/inbound/
```
Look for the newest matching file. The filename will contain the report type and date.

### Step 2 — Analyze the Data
Write and run a Python analysis script. Key things to compute:

**From Job Profitability Report:**
```python
import csv
from collections import defaultdict

jobs = []
with open('/path/to/Job_Profitability_Report*.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            jobs.append({
                'name': row['Job Name'],
                'contract': float(row['Contract Amount'] or 0),
                'profit': float(row['Profit'] or 0),
                'profit_pct': float(row['Profit %'] or 0),
                'expenses': float(row['Total Expenses'] or 0),
                'salesperson': row['Primary Salesperson'],
                'trades': row['Order Trades'],
                'milestone': row['Current Milestone'],
            })
        except: pass
```
Compute: total revenue/profit/expenses, overall margin, profitable/lost counts, by-stage summaries, by-rep summaries, by-trade summaries, top 10/bottom 10 jobs, data quality issues (zero contract, missing trades, pending losses).

**From Job Expenses Report:**
```python
rows = []
with open('/path/to/job_expenses_report*.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append({
            'date': row['Payment Date (by week)'],
            'paid': float(row['Total Paid Expenses']),
            'additional': float(row['Additional Expenses Total']),
            'count': int(row['Paid Expenses Count']),
        })
```
Compute: total paid, avg weekly, monthly aggregation, peak week, trend over time.

### Step 3 — Build the Dashboard
Use Next.js 14 + Tailwind CSS + Chart.js (via CDN in layout.tsx).

**Project location:** `/tmp/acculynx-dashboard/`
**Vercel deploy token:** `<VERCEL_TOKEN>`

**Standard sections:**
1. About This Data (explain both CSV types)
2. Portfolio KPIs (revenue, profit, margin, win rate)
3. Cash Flow Analysis (expenses data — if Job Expenses Report available)
4. P&L by Job Stage
5. Top 10 Jobs vs Biggest Losses
6. Sales Rep Performance (bar charts for profit and margin)
7. Trade Type Profitability
8. Margin / Profit Distributions
9. Data Quality Issues (zero contract, missing trades, pending losses)

**Required package.json dependencies:**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

**Chart.js CDN (add to layout.tsx head):**
```tsx
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" />
```

**Build command:** `cd /tmp/acculynx-dashboard && npm run build`
**Deploy command:** `cd /tmp/acculynx-dashboard && npx vercel deploy --prod --yes --token <VERCEL_TOKEN>`

### Step 4 — Deploy and Report
1. Run build — fix any TypeScript errors (common: `const` redeclaration, missing `any` type on Chart.js callbacks)
2. Deploy to Vercel with the token above
3. Reply in the Telegram thread with the live URL
4. Summarize key findings in the message

## Common Issues

### TypeScript error: Parameter 'ctx' implicitly has 'any' type
```tsx
// Wrong:
label: ctx => ...
// Right:
label: (ctx: any) => ...
```

### BUILD ERROR: 'const' declarations must be initialized
Spaces in constant names — use underscores:
```python
# Wrong:
BREAK EVEN = 11
# Right:
BREAK_EVEN = 11
```

### Chart.js not loading
Load via CDN script tags in `layout.tsx <head>` — don't use npm install for Chart.js in this setup.

## Key Thresholds (construction industry)
- **Good margin:** 30%+
- **Acceptable margin:** 20–30%
- **Warning:** <20% or any negative
- **Roofing typically:** 10–20% (thin — flag if <10%)
- **Service trades:** usually high margin (40%+)
- **Overall portfolio margin:** good at >15%

## Data Quality Flags to Always Report
1. Jobs with `Contract Amount = 0` — profit can't be calculated
2. Jobs with `Profit % = 0` but nonzero profit — margin not computable
3. Jobs with no `Order Trades` — unclassified
4. Approved/Completed/Invoiced jobs with negative profit — embedded losses
5. `Additional Expenses` with no corresponding payments — unbudgeted costs

## Reply Format
Always lead with the dashboard URL, then summarize:
1. Key P&L numbers (revenue, profit, margin)
2. The most important insight (worst job, worst rep, worst trade, or cash flow flag)
3. Data quality summary
4. Ask: "Want me to set up weekly auto-refresh?"
