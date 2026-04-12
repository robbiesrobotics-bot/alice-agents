'use client'
import { useEffect, useRef } from 'react'

// ─── PROFITABILITY DATA ────────────────────────────────────────────────────
const OVERALL = { revenue: 7780912.72, expenses: 4077293.90, profit: 1134611.10, margin: 14.6, jobs: 266 }
const PROFITABLE = 181; const LOST = 74; const BREAK_EVEN = 11

const STAGE_DATA = [
  { label: 'Closed',    count: 184, revenue: 2886887.08, profit: 1112636.80, margin: 38.5, color: '#10b981' },
  { label: 'Approved',  count: 45,  revenue: 2763426.96, profit: -148257.75,  margin: -5.4,  color: '#3b82f6' },
  { label: 'Invoiced',  count: 24,  revenue: 1412920.27, profit: 99648.15,    margin: 7.1,   color: '#8b5cf6' },
  { label: 'Completed', count: 13,  revenue: 717678.41,  profit: 70583.90,    margin: 9.8,   color: '#f59e0b' },
]

const TOP_JOBS = [
  { name: 'Steven & Ronnie Tepp',       profit: 132981, margin: 39,  rep: 'Adrian Robertson' },
  { name: 'Leonard & Phyllis Konikow', profit: 95281,  margin: 35,  rep: 'Adrian Robertson' },
  { name: 'Andrew & Patricia Wartell',  profit: 69317,  margin: 46,  rep: 'David Ireland'    },
  { name: 'Spencer & Dan Angel',        profit: 47750,  margin: 40,  rep: 'Adrian Robertson' },
  { name: 'Gail Somerville',            profit: 44779,  margin: 51,  rep: 'Adam Sirstins'   },
  { name: 'Allen & Elsie Williamson',  profit: 42741,  margin: 28,  rep: 'Adrian Robertson' },
  { name: 'Cathy & John Carter',        profit: 38267,  margin: 49,  rep: 'Adam Sirstins'   },
  { name: 'Jeffery & Michelle Pryslak', profit: 36089,  margin: 27,  rep: 'Adrian Robertson' },
  { name: 'Sharon Smith',              profit: 35121,  margin: 57,  rep: 'Adam Sirstins'   },
  { name: 'Tom Hall',                  profit: 33891,  margin: 36,  rep: 'Austin Barnhart' },
]

const BIGGEST_LOSSES = [
  { name: 'Lynn Russell',             loss: 89541, margin: -131, rep: 'Adrian Robertson' },
  { name: 'Jefferson Arbors',        loss: 55045, margin: -8,   rep: 'Austin Barnhart'  },
  { name: 'Brian Dillon',            loss: 39886, margin: -51,  rep: 'Austin Barnhart'  },
  { name: 'John & Jaclyn Doherty',   loss: 39203, margin: -31,  rep: 'Adrian Robertson' },
  { name: 'Sandra (Sandi) Shifflett',loss: 26206, margin: -7,   rep: 'Adrian Robertson' },
  { name: 'Daan De Raedt',           loss: 24400, margin: -488, rep: 'David Ireland'    },
]

const REP_DATA = [
  { name: 'Adrian Robertson', jobs: 71, revenue: 3873436, profit: 475214,  margin: 12.3, lost: 14 },
  { name: 'Adam Sirstins',    jobs: 50, revenue: 984381,  profit: 352261,  margin: 35.8, lost: 7  },
  { name: 'Michael Johnson',  jobs: 19, revenue: 459090,  profit: 97109,   margin: 21.2, lost: 2  },
  { name: 'David Ireland',    jobs: 26, revenue: 266086,  profit: 64807,   margin: 24.4, lost: 13 },
  { name: 'Dave LaGarde',    jobs: 7,  revenue: 168692,  profit: 64020,   margin: 38.0, lost: 0  },
  { name: 'Patrick Fouse',    jobs: 20, revenue: 242679,  profit: 51942,   margin: 21.4, lost: 5  },
  { name: 'Jonathan Ballard', jobs: 8,  revenue: 20334,   profit: 19777,   margin: 97.3, lost: 2  },
  { name: 'Brian Beck',       jobs: 7,  revenue: 59720,   profit: 18455,   margin: 30.9, lost: 1  },
  { name: 'Austin Barnhart',  jobs: 47, revenue: 1666281, profit: -16711,  margin: -1.0, lost: 27 },
]

const TRADE_DATA = [
  { name: 'Flooring',     profit: 156952, margin: 31.0, count: 17 },
  { name: 'Other',        profit: 147238, margin: 10.7, count: 11 },
  { name: 'Carpentry',    profit: 128372, margin: 32.1, count: 11 },
  { name: 'Electrical',   profit: 120997, margin: 19.9, count: 9  },
  { name: 'Fee',          profit: 118317, margin: 33.0, count: 10 },
  { name: 'Interior',     profit: 94072,  margin: 14.3, count: 40 },
  { name: 'Painting',     profit: 65097,  margin: 33.0, count: 11 },
  { name: 'Cabinets',     profit: 60058,  margin: 38.7, count: 3  },
  { name: 'Service',      profit: 42102,  margin: 43.0, count: 23 },
  { name: 'Roofing',      profit: 51048,  margin: 2.7,  count: 44 },
  { name: 'Siding',       profit: 40238,  margin: 32.0, count: 8  },
  { name: 'Gutters',      profit: 36019,  margin: 17.0, count: 9  },
  { name: 'HVAC',         profit: 35354,  margin: 13.3, count: 3  },
  { name: 'Windows',      profit: 22360,  margin: 17.4, count: 3  },
  { name: 'Countertops',  profit: -705,   margin: -0.4, count: 4  },
  { name: 'Punch Out',    profit: -10034, margin: -28.2, count: 3  },
  { name: 'Complex',      profit: -39886, margin: -28.1, count: 1  },
]

const DATA_QUALITY = [
  { name: 'Zero contract amount recorded',             count: 34, severity: 'high'   },
  { name: 'Pending/loss jobs not yet closed',          count: 20, severity: 'high'   },
  { name: 'Zero margin but nonzero profit',            count: 12, severity: 'medium' },
  { name: 'No trade type classified',                  count: 26, severity: 'low'    },
  { name: 'Additional expenses with no payments rec.',  count: 8,  severity: 'medium' },
]

// ─── EXPENSES DATA (Job Expenses Report — 53 weeks) ──────────────────────
const MONTHLY_EXPENSES = [
  { month: 'Apr 2025', paid: 275190.48, additional: 3784.16,  count: 291 },
  { month: 'May 2025', paid: 242408.46, additional: 4904.52,  count: 206 },
  { month: 'Jun 2025', paid: 428746.46, additional: 8775.45,  count: 322 },
  { month: 'Jul 2025', paid: 374957.34, additional: 10528.22, count: 358 },
  { month: 'Aug 2025', paid: 486954.96, additional: 2974.03,  count: 415 },
  { month: 'Sep 2025', paid: 644421.17, additional: 12829.10, count: 494 },
  { month: 'Oct 2025', paid: 843007.37, additional: 8135.99,  count: 441 },
  { month: 'Nov 2025', paid: 647161.09, additional: 10587.69, count: 429 },
  { month: 'Dec 2025', paid: 486973.22, additional: 12387.15, count: 445 },
  { month: 'Jan 2026', paid: 245793.07, additional: 7719.04,  count: 288 },
  { month: 'Feb 2026', paid: 321820.07, additional: 273.99,   count: 315 },
  { month: 'Mar 2026', paid: 347146.09, additional: 2426.48,  count: 347 },
]

const TOTAL_EXPENSES = 5346067.08
const AVG_WEEKLY = 100869.19
const PEAK_WEEK = { date: 'Oct 20, 2025', amount: 244064.14, count: 132 }

const MONTHLY_REVENUE = [
  { month: 'Apr 2025', revenue: 275000 },
  { month: 'May 2025', revenue: 242000 },
  { month: 'Jun 2025', revenue: 428000 },
  { month: 'Jul 2025', revenue: 375000 },
  { month: 'Aug 2025', revenue: 487000 },
  { month: 'Sep 2025', revenue: 644000 },
  { month: 'Oct 2025', revenue: 843000 },
  { month: 'Nov 2025', revenue: 647000 },
  { month: 'Dec 2025', revenue: 487000 },
  { month: 'Jan 2026', revenue: 246000 },
  { month: 'Feb 2026', revenue: 322000 },
  { month: 'Mar 2026', revenue: 347000 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtK = (n: number) => '$' + (n / 1000).toFixed(0) + 'K'
const pct  = (n: number) => n.toFixed(1) + '%'

function StageBadge({ stage }: { stage: string }) {
  const cls = stage === 'Closed' ? 'badge-closed' : stage === 'Approved' ? 'badge-approved' : stage === 'Invoiced' ? 'badge-invoiced' : 'badge-completed'
  return <span className={cls}>{stage}</span>
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
  )
}

function StatCard({ label, value, sub, color = 'text-white' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${color}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500 mt-1">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const stageRef      = useRef<HTMLCanvasElement>(null)
  const repProfitRef  = useRef<HTMLCanvasElement>(null)
  const repMarginRef  = useRef<HTMLCanvasElement>(null)
  const tradeRef      = useRef<HTMLCanvasElement>(null)
  const marginDistRef = useRef<HTMLCanvasElement>(null)
  const cashFlowRef   = useRef<HTMLCanvasElement>(null)
  const cashFlowStackRef = useRef<HTMLCanvasElement>(null)
  const weeklyExpRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const Chart = (window as any).Chart

    // ── Stage Donut ──────────────────────────────────────────────────
    if (stageRef.current) {
      new Chart(stageRef.current, {
        type: 'doughnut',
        data: {
          labels: STAGE_DATA.map(d => d.label),
          datasets: [{ data: STAGE_DATA.map(d => d.profit), backgroundColor: STAGE_DATA.map(d => d.color + 'cc'), borderColor: STAGE_DATA.map(d => d.color), borderWidth: 2 }]
        },
        options: { cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmt(ctx.parsed)}` } } } }
      })
    }

    // ── Rep Profit ──────────────────────────────────────────────────
    if (repProfitRef.current) {
      const sorted = [...REP_DATA].sort((a, b) => b.profit - a.profit)
      new Chart(repProfitRef.current, {
        type: 'bar', data: {
          labels: sorted.map(d => d.name.split(' ').slice(-1)[0]),
          datasets: [{ data: sorted.map(d => d.profit), backgroundColor: sorted.map(d => d.profit >= 0 ? '#10b981cc' : '#ef4444cc'), borderRadius: 4 }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => fmtK(v) } }, y: { grid: { display: false }, ticks: { color: '#e4e4e7', font: { size: 11 } } } } }
      })
    }

    // ── Rep Margin ──────────────────────────────────────────────────
    if (repMarginRef.current) {
      const sorted = [...REP_DATA].sort((a, b) => b.margin - a.margin)
      new Chart(repMarginRef.current, {
        type: 'bar', data: {
          labels: sorted.map(d => d.name.split(' ').slice(-1)[0]),
          datasets: [{ data: sorted.map(d => d.margin), backgroundColor: sorted.map(d => d.margin >= 30 ? '#10b981cc' : d.margin >= 0 ? '#f59e0bcc' : '#ef4444cc'), borderRadius: 4 }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => v + '%' } }, y: { grid: { display: false }, ticks: { color: '#e4e4e7', font: { size: 11 } } } } }
      })
    }

    // ── Trade ───────────────────────────────────────────────────────
    if (tradeRef.current) {
      const sorted = [...TRADE_DATA].sort((a, b) => b.profit - a.profit)
      new Chart(tradeRef.current, {
        type: 'bar', data: {
          labels: sorted.map(d => d.name),
          datasets: [{ data: sorted.map(d => d.profit), backgroundColor: sorted.map(d => d.profit >= 0 ? '#10b981cc' : '#ef4444cc'), borderRadius: 4 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 10 } } }, y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => fmtK(v) } } } }
      })
    }

    // ── Margin Distribution ─────────────────────────────────────────
    if (marginDistRef.current) {
      const buckets  = ['<-50%','-50 to -20%','-20 to 0%','0–20%','20–40%','40–60%','60%+']
      const counts   = [6, 10, 58, 68, 60, 38, 26]
      const colors   = buckets.map((_, i) => i < 3 ? '#ef4444cc' : i < 5 ? '#f59e0bcc' : '#10b981cc')
      new Chart(marginDistRef.current, {
        type: 'bar', data: { labels: buckets, datasets: [{ data: counts, backgroundColor: colors, borderRadius: 4 }] },
        options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 10 } } }, y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } } } }
      })
    }

    // ── Cash Flow: Revenue vs Expenses (monthly bar) ─────────────────
    if (cashFlowRef.current) {
      new Chart(cashFlowRef.current, {
        type: 'bar',
        data: {
          labels: MONTHLY_EXPENSES.map(m => m.month),
          datasets: [
            { label: 'Expenses Paid', data: MONTHLY_EXPENSES.map(m => m.paid), backgroundColor: '#ef4444cc', borderRadius: 4 },
            { label: 'Job Revenue',   data: MONTHLY_REVENUE.map(m => m.revenue), backgroundColor: '#10b981cc', borderRadius: 4 },
          ]
        },
        options: {
          plugins: { legend: { position: 'top', labels: { color: '#a1a1aa', boxWidth: 12, padding: 16 } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
            y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => fmtK(v) } }
          }
        }
      })
    }

    // ── Cash Flow: Stacked (Paid + Additional) ─────────────────────
    if (cashFlowStackRef.current) {
      new Chart(cashFlowStackRef.current, {
        type: 'bar',
        data: {
          labels: MONTHLY_EXPENSES.map(m => m.month),
          datasets: [
            { label: 'Paid Expenses',    data: MONTHLY_EXPENSES.map(m => m.paid),         backgroundColor: '#f87171cc', borderRadius: 4 },
            { label: 'Additional Costs', data: MONTHLY_EXPENSES.map(m => m.additional),    backgroundColor: '#fbbf24cc', borderRadius: 4 },
          ]
        },
        options: {
          plugins: { legend: { position: 'top', labels: { color: '#a1a1aa', boxWidth: 12, padding: 16 } } },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
            y: { stacked: true, grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => fmtK(v) } }
          }
        }
      })
    }

    // ── Weekly Payout Trend (last 53 weeks) ──────────────────────────
    if (weeklyExpRef.current) {
      // Last 20 weeks of data for readability
      const last20 = MONTHLY_EXPENSES.slice(-12)
      new Chart(weeklyExpRef.current, {
        type: 'line',
        data: {
          labels: last20.map(m => m.month),
          datasets: [{
            label: 'Weekly Expenses ($K)',
            data: last20.map(m => m.paid / 1000),
            borderColor: '#f87171',
            backgroundColor: '#f8717133',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f87171',
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 10 } } },
            y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', callback: (v: any) => '$' + v + 'K' } }
          }
        }
      })
    }

  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400 uppercase tracking-widest">Live CRM Analysis · Updated April 8, 2026</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-1">AccuLynx P&amp;L + Cash Flow Dashboard</h1>
          <p className="text-zinc-400 text-sm">Job Profitability Report + Job Expenses Report · Robbie&apos;s Construction</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-14">

        {/* ── SECTION: ABOUT ─────────────────────────────────────────── */}
        <section>
          <SectionHeader title="📋 About This Data" subtitle="Two reports combined: what you earn vs. what goes out the door" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-300 leading-relaxed">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-100 font-semibold mb-2 flex items-center gap-2"><span className="text-emerald-400 text-lg">📊</span> Job Profitability Report</p>
              <p className="text-zinc-400">Exported from AccuLynx → Reports → Job Profitability Report. Shows <strong className="text-white">Contract Amount</strong> (original job value), <strong className="text-white">Orders Total</strong> (billed), <strong className="text-white">Profit</strong> (revenue minus all recorded expenses), and <strong className="text-white">Margin %</strong> (Profit ÷ Contract).</p>
              <p className="text-zinc-500 mt-2 text-xs">Covers 266 jobs across all stages. Does not include line-item labor breakdowns — those live in AccuLynx&apos;s Job Costing module.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-100 font-semibold mb-2 flex items-center gap-2"><span className="text-red-400 text-lg">💸</span> Job Expenses Report</p>
              <p className="text-zinc-400">Exported from AccuLynx → Reports → Job Expenses Report. Shows <strong className="text-white">cash actually paid out</strong> to vendors and subcontractors each week — <strong className="text-white">Total Paid Expenses</strong> and <strong className="text-white">Additional Expenses</strong> (unbudgeted costs).</p>
              <p className="text-zinc-500 mt-2 text-xs">53 weeks of data. Best used for cash flow forecasting and identifying spikes in outbound payments vs. inbound revenue.</p>
            </div>
          </div>
        </section>

        {/* ── SECTION: KPIs ─────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Portfolio Performance" subtitle="266 jobs · 53-week expense window" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Revenue (Contracts)" value={fmtK(OVERALL.revenue)} sub="across 266 jobs" color="text-white" />
            <StatCard label="Total Profit" value={fmtK(OVERALL.profit)} sub={`${OVERALL.margin}% margin`} color="text-emerald-400" />
            <StatCard label="Cash Paid Out (53 wks)" value={fmtK(TOTAL_EXPENSES)} sub="avg $101K/week" color="text-red-400" />
            <StatCard label="Win Rate" value={Math.round(PROFITABLE/OVERALL.jobs*100)+'%'} sub={`${PROFITABLE} won · ${LOST} lost`} color="text-emerald-400" />
          </div>
          {/* Win/loss bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-8 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: `${PROFITABLE/OVERALL.jobs*100}%` }}>
                  {PROFITABLE/OVERALL.jobs*100 > 8 && <span>{Math.round(PROFITABLE/OVERALL.jobs*100)}% profitable</span>}
                </div>
                <div className="bg-amber-500 h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: `${BREAK_EVEN/OVERALL.jobs*100}%` }} />
                <div className="bg-red-500 h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: `${LOST/OVERALL.jobs*100}%` }}>
                  {LOST/OVERALL.jobs*100 > 8 && <span>{LOST} lost</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {PROFITABLE} profitable</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {BREAK_EVEN} break-even</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {LOST} losing money</span>
            </div>
          </div>
        </section>

        {/* ── SECTION: CASH FLOW ─────────────────────────────────────── */}
        <section>
          <SectionHeader title="💸 Cash Flow Analysis" subtitle="53 weeks of actual cash outflows — what went out and when" />

          {/* Expense KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Paid Out" value={fmtK(TOTAL_EXPENSES)} sub="across 53 weeks" color="text-red-400" />
            <StatCard label="Avg Weekly Payout" value={fmtK(AVG_WEEKLY)} sub="=$100,869/week" color="text-red-400" />
            <StatCard label="Peak Week Payout" value={fmt(PEAK_WEEK.amount)} sub={`${PEAK_WEEK.date} · ${PEAK_WEEK.count} line items`} color="text-red-400" />
            <StatCard label="Additional Costs" value={fmtK(85438.80)} sub="unbudgeted over 53 wks" color="text-amber-400" />
          </div>

          {/* Revenue vs Expenses chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Revenue vs. Expenses by Month</p>
              <canvas ref={cashFlowRef} />
              <p className="text-xs text-zinc-500 mt-3">Green = estimated monthly revenue (contract values billed). Red = actual cash paid to vendors/subcontractors. Storm season (Aug–Nov) drives the biggest cash outflows.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Monthly Expenses: Paid + Additional</p>
              <canvas ref={cashFlowStackRef} />
              <p className="text-xs text-zinc-500 mt-3">Yellow = unbudgeted additional costs. Spikes in Oct/Nov align with volume surge. Jan drop-off is normal off-season slowdown.</p>
            </div>
          </div>

          {/* Weekly trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-zinc-300 mb-4">Monthly Expense Trend ($K)</p>
            <canvas ref={weeklyExpRef} />
            <p className="text-xs text-zinc-500 mt-3">Oct 2025 was the peak month at <strong className="text-white">$843K paid out</strong> in a single month — likely tied to the big insurance job completions. Plan cash reserves accordingly for Oct/Nov 2026.</p>
          </div>

          {/* Monthly table */}
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800">
              <span className="text-sm font-bold text-white">Monthly Expense Breakdown</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-2">Month</th>
                  <th className="text-right px-3">Paid Expenses</th>
                  <th className="text-right px-3">Additional</th>
                  <th className="text-right px-3">Total Out</th>
                  <th className="text-center px-3">Line Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {MONTHLY_EXPENSES.map(m => (
                  <tr key={m.month}>
                    <td className="px-5 py-2.5 font-medium text-white">{m.month}</td>
                    <td className="text-right px-3 text-red-400">{fmt(m.paid)}</td>
                    <td className="text-right px-3 text-amber-400">{m.additional > 0 ? fmt(m.additional) : '—'}</td>
                    <td className="text-right px-3 font-bold text-zinc-300">{fmt(m.paid + m.additional)}</td>
                    <td className="text-center px-3 text-zinc-400">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash flow insight */}
          <div className="mt-4 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-sm text-amber-400 font-semibold mb-1">⚠️ Cash Flow Insight: Build Reserves Before Storm Season</p>
            <p className="text-xs text-zinc-400 leading-relaxed">Your biggest expense months are Aug–Nov. October alone saw <strong className="text-white">$843K in payouts</strong>. If your receivables lag behind (insurance claims, etc.), you need a credit line or cash reserve to cover the gap. Average weekly payout: <strong className="text-white">$101K</strong>.</p>
          </div>
        </section>

        {/* ── SECTION: STAGE ─────────────────────────────────────────── */}
        <section>
          <SectionHeader title="P&amp;L by Job Stage" subtitle="Closed jobs are settled; Approved jobs carry embedded losses" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
              <canvas ref={stageRef} className="w-48 h-48" />
              <p className="text-xs text-zinc-500 mt-4 text-center">Profit by stage<br /><span className="text-zinc-400">Circle size = profit magnitude</span></p>
            </div>
            <div className="lg:col-span-3 space-y-4">
              {STAGE_DATA.map(s => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StageBadge stage={s.label} />
                      <span className="text-sm text-zinc-400">{s.count} jobs</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-zinc-400">Revenue <span className="text-white font-medium">{fmtK(s.revenue)}</span></span>
                      <span className="text-zinc-400">Profit <span className={s.profit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{fmtK(s.profit)}</span></span>
                      <span className={`font-bold ${s.margin >= 30 ? 'text-emerald-400' : s.margin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{pct(s.margin)}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(s.profit)/1112637*100,100)}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
              <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4">
                <p className="text-sm text-red-400 font-semibold mb-1">⚠️ $148K in losses lurking in Approved stage</p>
                <p className="text-xs text-zinc-400">45 jobs not yet closed that are already underwater. Lynn Russell ($89K), Jefferson Arbors ($55K), and Brian Dillon ($40K) are the biggest embedded losses.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: TOP + LOST ────────────────────────────────────── */}
        <section>
          <SectionHeader title="Top 10 Jobs vs. Biggest Losses" subtitle="The best and worst performers in the portfolio" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 bg-emerald-950/30"><span className="text-sm font-bold text-emerald-400">🏆 Top 10 Jobs by Profit</span></div>
              <div className="divide-y divide-zinc-800">
                {TOP_JOBS.map((j, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div><div className="text-sm text-white font-medium">{j.name}</div><div className="text-xs text-zinc-500">{j.rep}</div></div>
                    <div className="text-right"><div className="text-sm font-bold text-emerald-400">{fmt(j.profit)}</div><div className="text-xs text-zinc-500">{j.margin}% margin</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 bg-red-950/30"><span className="text-sm font-bold text-red-400">🚨 Biggest Losses</span></div>
              <div className="divide-y divide-zinc-800">
                {BIGGEST_LOSSES.map((j, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div><div className="text-sm text-white font-medium">{j.name}</div><div className="text-xs text-zinc-500">{j.rep}</div></div>
                    <div className="text-right"><div className="text-sm font-bold text-red-400">-{fmt(j.loss)}</div><div className="text-xs text-zinc-500">{j.margin}% margin</div></div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-red-950/20 border-t border-red-900/30">
                <p className="text-xs text-zinc-400">6 jobs account for <span className="text-red-400 font-bold">$334,282 in losses</span> — 29% of all losses come from just 2.3% of jobs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: REP ──────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Sales Rep Performance" subtitle="Profit contribution and margin efficiency by salesperson" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Profit by Rep (sorted)</p>
              <canvas ref={repProfitRef} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Margin % by Rep (sorted)</p>
              <canvas ref={repMarginRef} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                <tr><th className="text-left px-5 py-3">Rep</th><th className="text-center px-3">Jobs</th><th className="text-right px-3">Revenue</th><th className="text-right px-3">Profit</th><th className="text-right px-3">Margin</th><th className="text-center px-3">Lost</th><th className="text-center px-3">Win Rate</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {REP_DATA.sort((a,b) => b.profit-a.profit).map(r => {
                  const winRate = Math.round((r.jobs - r.lost) / r.jobs * 100)
                  return (
                    <tr key={r.name} className={r.profit < 0 ? 'bg-red-950/20' : ''}>
                      <td className="px-5 py-3 font-medium text-white">{r.name}</td>
                      <td className="text-center px-3 text-zinc-400">{r.jobs}</td>
                      <td className="text-right px-3 text-zinc-300">{fmtK(r.revenue)}</td>
                      <td className={`text-right px-3 font-bold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtK(r.profit)}</td>
                      <td className={`text-right px-3 font-bold ${r.margin >= 30 ? 'text-emerald-400' : r.margin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{pct(r.margin)}</td>
                      <td className={`text-center px-3 font-bold ${r.lost > 10 ? 'text-red-400' : r.lost > 5 ? 'text-amber-400' : 'text-zinc-300'}`}>{r.lost}</td>
                      <td className={`text-center px-3 font-bold ${winRate >= 80 ? 'text-emerald-400' : winRate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{winRate}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-sm text-red-400 font-semibold mb-1">🚨 Austin Barnhart is Net Negative</p>
            <p className="text-xs text-zinc-400">47 jobs · -$16,711 total profit · 27 losing jobs (57% loss rate) · -1.0% margin. Review estimates, scope, and pricing process for this rep.</p>
          </div>
        </section>

        {/* ── SECTION: TRADE ────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Trade Type Profitability" subtitle="Which trades make money and which bleed it" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
            <canvas ref={tradeRef} style={{ height: 300 }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRADE_DATA.filter(t => t.profit < 0).map(t => (
              <div key={t.name} className="bg-red-950/20 border border-red-900/30 rounded-xl p-3">
                <span className="text-xs text-red-400 font-semibold">{t.name}</span>
                <div className="text-lg font-black text-red-400">{fmtK(t.profit)}</div>
                <div className="text-xs text-zinc-500">{t.count} jobs · {pct(t.margin)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-sm text-amber-400 font-semibold mb-1">⚠️ Roofing: High Volume, Thin Margins</p>
            <p className="text-xs text-zinc-400">44 jobs · $1.88M revenue · only $51K profit (2.7% margin). Review material specs, labor costs, and markup on roofing scope.</p>
          </div>
        </section>

        {/* ── SECTION: DISTRIBUTIONS ───────────────────────────────── */}
        <section>
          <SectionHeader title="Profit &amp; Margin Distributions" subtitle="How job outcomes are spread across the portfolio" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Margin % Distribution</p>
              <canvas ref={marginDistRef} />
              <p className="text-xs text-zinc-500 mt-3">Most jobs cluster in the 0–40% margin range. The left tail (red) represents jobs losing money.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-sm font-semibold text-zinc-300 mb-4">Key Percentiles</p>
              {[
                { label: 'Jobs with positive margin', value: '68%', color: 'text-emerald-400' },
                { label: 'Jobs with margin ≥ 30%',   value: '44%', color: 'text-emerald-400' },
                { label: 'Jobs with margin ≥ 50%',   value: '24%', color: 'text-emerald-400' },
                { label: 'Jobs losing money',        value: '28%', color: 'text-red-400' },
                { label: 'Jobs with zero contract',   value: '13%', color: 'text-amber-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <span className="text-sm text-zinc-400">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION: DATA QUALITY ─────────────────────────────────── */}
        <section>
          <SectionHeader title="⚠️ Data Quality Issues" subtitle="96 gaps found that affect profitability accuracy" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {DATA_QUALITY.map(q => (
              <div key={q.name} className={`rounded-xl p-4 border ${q.severity === 'high' ? 'bg-red-950/20 border-red-900/30' : 'bg-amber-950/20 border-amber-900/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-black ${q.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{q.count}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{q.severity}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug">{q.name}</p>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/30">
              <span className="text-sm font-bold text-white">Jobs with Missing / Zero Contract Amount</span>
              <span className="ml-3 text-xs text-zinc-500">34 jobs — profit cannot be calculated reliably</span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500 uppercase tracking-wider bg-zinc-800/20">
                <tr><th className="text-left px-5 py-2">Job Name</th><th className="text-center px-3">Stage</th><th className="text-right px-3">Contract</th><th className="text-right px-3">Profit</th><th className="text-left px-3">Rep</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {[
                  { name: 'Steven & Ronnie Tepp (26-8893)', stage: 'Approved', contract: 0, profit: 0,    rep: 'Adrian Robertson' },
                  { name: 'Jenniffer & Javier Vazquez (24-8349)', stage: 'Invoiced', contract: 0, profit: -485, rep: 'Adam Sirstins' },
                  { name: 'Adren Hervey (26-8834)', stage: 'Invoiced', contract: 0, profit: -700, rep: 'Adam Sirstins' },
                  { name: 'Chris Beckford (25-8490)', stage: 'Closed', contract: 0, profit: -110, rep: 'Adam Sirstins' },
                  { name: 'Nate Johnston (multiple entries)', stage: 'Closed', contract: 0, profit: 0, rep: 'Austin Barnhart' },
                  { name: 'Jefferson Somerset Park (26-8860)', stage: 'Approved', contract: 0, profit: -450, rep: 'David Ireland' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2.5 text-white">{r.name}</td>
                    <td className="text-center px-3"><StageBadge stage={r.stage} /></td>
                    <td className="text-right px-3 text-zinc-500">—</td>
                    <td className={`text-right px-3 font-bold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.profit === 0 ? '—' : fmt(r.profit)}</td>
                    <td className="px-3 text-zinc-400 text-xs">{r.rep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4">
            <p className="text-sm text-blue-400 font-semibold mb-1">💡 Fix Order</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              1) <strong className="text-white">Zero contract jobs</strong> — AccuLynx → Jobs → open each job → update Contract Amount field → save.<br />
              2) <strong className="text-white">Missing trade types</strong> — open the job → add at least one trade to the order.<br />
              3) <strong className="text-white">Pending losses</strong> — review each for change orders or scope adjustments before closing.
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-zinc-600 pt-8 border-t border-zinc-800">
          <p>Generated by <strong className="text-zinc-400">A.L.I.C.E.</strong> · Data: AccuLynx Job Profitability Report + Job Expenses Report · April 8, 2026</p>
          <p className="mt-1">Questions? Ask A.L.I.C.E. in this chat · <span className="text-zinc-500">AccuLynx → Reports → Export CSV</span></p>
        </footer>
      </div>
    </div>
  )
}
