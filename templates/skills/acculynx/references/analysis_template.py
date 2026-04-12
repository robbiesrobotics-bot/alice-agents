import csv
from collections import defaultdict

jobs = []

with open('/Users/aliceclaw/.openclaw/media/inbound/Job_Profitability_Report-4_08_2026_14_4_7---1ed402bb-54d3-4511-b88f-76cdbc4769ae.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            contract = float(row['Contract Amount'] or 0)
            orders_total = float(row['Orders Total'] or 0)
            profit = float(row['Profit'] or 0)
            profit_pct = float(row['Profit %'] or 0)
            total_expenses = float(row['Total Expenses'] or 0)
            salesperson = row['Primary Salesperson']
            trades = row['Order Trades']
            name = row['Job Name']
            jobs.append({
                'name': name,
                'contract': contract,
                'orders': orders_total,
                'profit': profit,
                'profit_pct': profit_pct,
                'expenses': total_expenses,
                'salesperson': salesperson,
                'trades': trades
            })
        except:
            pass

# Sort by profit
by_profit = sorted(jobs, key=lambda x: x['profit'], reverse=True)
by_margin = sorted(jobs, key=lambda x: x['profit_pct'], reverse=True)
losers = sorted(jobs, key=lambda x: x['profit'])

total_profit = sum(j['profit'] for j in jobs)
total_revenue = sum(j['contract'] for j in jobs)
total_expenses = sum(j['expenses'] for j in jobs)
profitable_count = len([j for j in jobs if j['profit'] > 0])
lost_money_count = len([j for j in jobs if j['profit'] < 0])
zero_count = len([j for j in jobs if j['profit'] == 0])

print("=" * 72)
print("JESSE -- FULL P&L ANALYSIS (Job Profitability Report)")
print("=" * 72)

print("\nOVERALL P&L SUMMARY")
print(f"  Total Revenue:       ${total_revenue:>14,.2f}")
print(f"  Total Expenses:     ${total_expenses:>14,.2f}")
print(f"  TOTAL PROFIT:        ${total_profit:>14,.2f}")
print(f"  Overall Margin:      {(total_profit/total_revenue*100):>14.1f}%")
print(f"  ")
print(f"  Jobs Profitable:     {profitable_count}")
print(f"  Jobs Lost Money:     {lost_money_count}")
print(f"  Jobs Break-Even:     {zero_count}")
print(f"  Total Jobs:          {len(jobs)}")

print("\n" + "=" * 72)
print("TOP 10 JOBS BY PROFIT $")
print("-" * 72)
print(f"{'Job':<38} {'Profit':>10} {'Margin':>8} {'Salesperson':<20}")
print("-" * 72)
for j in by_profit[:10]:
    print(f"{j['name'][:36]:<38} ${j['profit']:>9,.0f} {j['profit_pct']*100:>6.0f}%  {j['salesperson'][:18]:<20}")

print("\n" + "=" * 72)
print("TOP 10 JOBS BY MARGIN %")
print("-" * 72)
print(f"{'Job':<38} {'Margin':>8} {'Profit':>10} {'Salesperson':<20}")
print("-" * 72)
for j in by_margin[:10]:
    if j['contract'] > 0:
        print(f"{j['name'][:36]:<38} {j['profit_pct']*100:>6.0f}%  ${j['profit']:>9,.0f}  {j['salesperson'][:18]:<20}")

print("\n" + "=" * 72)
print("⚠️  JOBS THAT LOST MONEY")
print("-" * 72)
print(f"{'Job':<38} {'Loss':>10} {'Margin':>8} {'Salesperson':<20}")
print("-" * 72)
lost = [j for j in jobs if j['profit'] < 0]
for j in sorted(lost, key=lambda x: x['profit'])[:10]:
    print(f"{j['name'][:36]:<38} ${j['profit']:>9,.0f} {j['profit_pct']*100:>6.0f}%  {j['salesperson'][:18]:<20}")
if not lost:
    print("  No jobs with negative profit found")

print("\n" + "=" * 72)
print("SALESRep PERFORMANCE (Profit)")
print("-" * 72)
reps = defaultdict(lambda: {'profit': 0, 'revenue': 0, 'count': 0})
for j in jobs:
    reps[j['salesperson']]['profit'] += j['profit']
    reps[j['salesperson']]['revenue'] += j['contract']
    reps[j['salesperson']]['count'] += 1
print(f"{'Salesperson':<22} {'Jobs':>5} {'Revenue':>12} {'Profit':>12} {'Margin':>8}")
print("-" * 72)
for rep, d in sorted(reps.items(), key=lambda x: x[1]['profit'], reverse=True):
    margin = (d['profit']/d['revenue']*100) if d['revenue'] > 0 else 0
    print(f"{rep[:20]:<22} {d['count']:>5} ${d['revenue']:>10,.0f} ${d['profit']:>10,.0f} {margin:>7.0f}%")

print("\n" + "=" * 72)
print("TRADE PERFORMANCE (Profit by Primary Trade)")
print("-" * 72)
trades = defaultdict(lambda: {'profit': 0, 'revenue': 0, 'count': 0})
for j in jobs:
    primary_trade = j['trades'].split(',')[0].strip() if j['trades'] else 'Unknown'
    trades[primary_trade]['profit'] += j['profit']
    trades[primary_trade]['revenue'] += j['contract']
    trades[primary_trade]['count'] += 1
print(f"{'Trade':<20} {'Jobs':>5} {'Revenue':>12} {'Profit':>12} {'Margin':>8}")
print("-" * 72)
for trade, d in sorted(trades.items(), key=lambda x: x[1]['profit'], reverse=True):
    margin = (d['profit']/d['revenue']*100) if d['revenue'] > 0 else 0
    print(f"{trade[:18]:<20} {d['count']:>5} ${d['revenue']:>10,.0f} ${d['profit']:>10,.0f} {margin:>7.0f}%")

EOF
python3 /tmp/acculynx_analysis.py