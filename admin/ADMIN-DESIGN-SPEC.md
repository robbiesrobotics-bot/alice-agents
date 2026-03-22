# admin.av3.ai — A.L.I.C.E. Owners Section
## Design Specification

> **Author:** Nadia 🎨 (UX/UI Design Lead)
> **Date:** 2026-03-17
> **Status:** Ready for implementation
> **Stack:** Next.js · shadcn/ui · Tailwind v4 · Lucide icons
> **Auth:** Google OAuth via Supabase (single-user — Rob only)
> **Design reference:** Inherits tokens from Mission Control DESIGN-SPEC.md

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
3. [Auth Gate](#3-auth-gate)
4. [Shell Layout & Navigation](#4-shell-layout--navigation)
5. [Module 1 — Morning Brief](#5-module-1--morning-brief) *(default landing)*
6. [Module 2 — CRM](#6-module-2--crm)
7. [Module 3 — Support Queue](#7-module-3--support-queue)
8. [Module 4 — Revenue Dashboard](#8-module-4--revenue-dashboard)
9. [Module 5 — Sales Pipeline](#9-module-5--sales-pipeline)
10. [Module 6 — Content Calendar](#10-module-6--content-calendar)
11. [Module 7 — Agent Status Board](#11-module-7--agent-status-board)
12. [Module 8 — Legal Queue](#12-module-8--legal-queue)
13. [Module 9 — Security Console](#13-module-9--security-console)
14. [Module 10 — Competitive Intel](#14-module-10--competitive-intel)
15. [Shared Components](#15-shared-components)
16. [Implementation Notes for Felix](#16-implementation-notes-for-felix)

---

## 1. Design Philosophy

**This is not a marketing site. It is not Mission Control.**

admin.av3.ai is a private operations terminal. One user. Zero onboarding flows. Maximum information density. Think Bloomberg terminal crossed with a military ops center — every pixel earns its place by reducing the time Rob spends in confusion.

### Principles

1. **Dense by design.** Tables, not cards (except where cards genuinely help scannability — Morning Brief). No decorative whitespace.
2. **Action-forward.** Every list view has a clear next action. Approve. Reject. Note. Close. Don't make Rob hunt for the button.
3. **Agent-aware.** Each module is owned by an agent. That agent's identity should be present — not screaming, but visible. Rob needs to know who surfaced what.
4. **No mystery states.** Every table, chart, and status badge must have an explicit definition. If data is stale, say so. If an agent hasn't run, show it.
5. **Paranoid auth.** Single-user console. Never visible without authentication. No public routes.

### Tone

Dark. Dense. Functional. The equivalent of a cockpit — every instrument has a job, nothing is decorative.

---

## 2. Design Tokens

Inherited directly from Mission Control. Key values repeated here for Felix's reference:

```
/* Backgrounds */
--bg-root:      zinc-950  (#09090b)    /* Page background */
--bg-surface:   zinc-900  (#18181b)    /* Tables, panels, cards */
--bg-elevated:  zinc-800  (#27272a)    /* Hover rows, nested surfaces */

/* Text */
--text-primary:   zinc-50   (#fafafa)
--text-secondary: zinc-400  (#a1a1aa)
--text-tertiary:  zinc-500  (#71717a)

/* Borders */
--border-default: zinc-800  (#27272a)
--border-subtle:  zinc-800/50

/* Status badges */
--status-emerald:  emerald-400 / bg: emerald-400/10  /* Active, healthy, good */
--status-amber:    amber-400   / bg: amber-400/10    /* Warning, pending, attention */
--status-red:      red-400     / bg: red-400/10      /* Alert, error, critical */
--status-zinc:     zinc-500    / bg: zinc-800        /* Inactive, closed, done */

/* Monospace (keys, IDs, logs) */
font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace
```

### Admin-Specific Additions

```
/* Approval action colors */
--action-approve:  emerald-500   /* "Approve & Send" button */
--action-reject:   red-500       /* "Reject" button */
--action-edit:     zinc-300      /* "Edit" ghost button */

/* Severity scale (Security + Legal) */
--sev-critical:  red-400
--sev-high:      orange-400
--sev-medium:    amber-400
--sev-low:       blue-400
--sev-info:      zinc-400
```

---

## 3. Auth Gate

### Route Protection

All routes under `admin.av3.ai/*` are protected. Before any content renders, check Supabase session.

**Unauthenticated state:**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│             ◆  A.L.I.C.E.                       │
│             Owners Section                      │
│                                                  │
│         ┌──────────────────────┐                │
│         │  Sign in with Google │                │
│         └──────────────────────┘                │
│                                                  │
│         Private console. Authorized              │
│         access only.                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Page background:** `bg-zinc-950` full screen
- **Card:** `bg-zinc-900 border border-zinc-800 rounded-xl p-10 max-w-sm mx-auto` centered vertically
- **Logo:** Diamond icon (◆) + "A.L.I.C.E." in `text-xl font-semibold text-zinc-50` + "Owners Section" in `text-sm text-zinc-500`
- **Button:** Google's standard OAuth button styled to match — `bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 rounded-lg px-5 py-2.5 text-sm font-medium flex items-center gap-3`
- **Google icon:** Standard SVG icon, left of text
- **Footer text:** `text-xs text-zinc-600 text-center mt-6` — "Private console. Authorized access only."
- **On auth failure / wrong account:** Show `text-red-400 text-sm text-center` — "Access denied. This console is restricted."

### Session Persistence

- Supabase session cookie. On tab reopen, validate token — do not re-prompt unless expired.
- Session expiry: 7 days. After expiry, redirect to auth gate.

---

## 4. Shell Layout & Navigation

### Outer Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (fixed, left, w-56)  │  MAIN CONTENT AREA (flex-1, scroll) │
│                              │                                       │
│  ◆ admin                     │  [Module content renders here]       │
│                              │                                       │
│  ⊞  Morning Brief   ●3      │                                       │
│  👥 CRM                      │                                       │
│  🎫 Support Queue   ●7      │                                       │
│  💰 Revenue                  │                                       │
│  📊 Sales Pipeline           │                                       │
│  📅 Content Calendar  ●2    │                                       │
│  🤖 Agent Status    ●1      │                                       │
│  ⚖️  Legal Queue    ●4      │                                       │
│  🛡️  Security       ●2      │                                       │
│  🔍 Competitive Intel        │                                       │
│                              │                                       │
│                              │                                       │
│  [Rob's Google avatar]       │                                       │
│  Rob · Sign out              │                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Sidebar Specs

- **Width:** `w-56` (224px) — fixed, never collapses (this is a desktop-only console)
- **Background:** `bg-zinc-950 border-r border-zinc-800`
- **Logo area:** `px-4 pt-5 pb-4 border-b border-zinc-800`
  - Diamond icon (◆ `text-zinc-400`) + "admin" in `text-sm font-semibold text-zinc-50` — no subtitle, keep it minimal
- **Nav items:** `px-2 py-1` container, item height `h-9`, `rounded-lg`
  - Default: `text-zinc-400 text-sm flex items-center gap-2.5 px-3`
  - Hover: `bg-zinc-800/60 text-zinc-200`
  - Active: `bg-zinc-800 text-zinc-50 font-medium` + left accent bar: `2px bg-zinc-100 rounded-full absolute left-0 h-5`
  - Gap between items: `gap-0.5`
- **Badge (unread/pending count):** `ml-auto text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full`
  - High priority (red): `bg-red-500/20 text-red-400 border border-red-500/30`
  - Normal (amber): `bg-amber-500/20 text-amber-400 border border-amber-500/30`
  - Show only when count > 0
- **User footer:** Pinned to bottom, `border-t border-zinc-800 p-3 flex items-center gap-2.5`
  - Google avatar: `w-6 h-6 rounded-full`
  - "Rob" in `text-sm text-zinc-300`
  - Sign out: `text-xs text-zinc-600 hover:text-zinc-400 ml-auto`

### Icons (Lucide)

| Module | Lucide Icon |
|--------|-------------|
| Morning Brief | `LayoutDashboard` |
| CRM | `Users` |
| Support Queue | `MessageSquare` |
| Revenue | `TrendingUp` |
| Sales Pipeline | `KanbanSquare` |
| Content Calendar | `CalendarDays` |
| Agent Status | `Bot` |
| Legal Queue | `Scale` |
| Security | `ShieldAlert` |
| Competitive Intel | `Radar` |

### Slide-Out Detail Panel

The right-side detail panel is shared across all modules that have row-level drill-down (CRM, Support, Legal, Security, Agent Status).

**Behavior:**
- Opens from the right edge, overlays content without collapsing the table
- Width: `w-[520px]` fixed
- Background: `bg-zinc-900/98 backdrop-blur-sm border-l border-zinc-800`
- Animation: slide in from right, `duration-200 ease-out`
- Shadow: `shadow-2xl shadow-black/50` on the left edge
- Close: `X` button top-right, or `Esc` key
- Does NOT dim the background — the table behind stays readable

**Panel header pattern (shared):**
```
┌──────────────────────────────────┐
│ [Back arrow] [Context label]  ✕  │
│ ──────────────────────────────── │
│ [Module-specific content]        │
└──────────────────────────────────┘
```
- Header: `px-5 py-4 border-b border-zinc-800 flex items-center gap-3`
- Context label: varies by module (customer email, ticket ID, etc.)

### Page Header Pattern

Every module uses the same top header:

```
┌──────────────────────────────────────────────────────┐
│ [Module Title]              [Optional action button] │
│ [Agent attribution + last updated]                   │
└──────────────────────────────────────────────────────┘
```

- Container: `px-6 pt-7 pb-5 border-b border-zinc-800`
- Title: `text-xl font-semibold text-zinc-50 tracking-tight`
- Attribution line: `text-xs text-zinc-500 mt-1` — "Managed by Sophie 💬 · Updated 4m ago"
- Action button: Right-aligned, `bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 text-sm px-3 py-1.5 rounded-lg`

---

## 5. Module 1 — Morning Brief

**Route:** `/` (default landing page)
**Managed by:** Eva 📋 (synthesized daily at 8am, also sent via Telegram)
**Purpose:** Instant situational awareness. Rob opens the laptop, sees this, knows what needs attention in 10 seconds.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
│ Good morning, Rob.                Last updated: Today 7:58 AM EDT   │
│ Here's your brief for Tuesday, March 17.                            │
├──────────────────────────────────────────────────────────────────────┤
│ STAT CARDS (4-column row)                                           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│ │ Approval     │ │ Revenue      │ │ Support      │ │ Top Decision│ │
│ │ Queue        │ │ Delta        │ │ Tickets      │ │ Needed      │ │
│ │              │ │              │ │              │ │             │ │
│ │    7         │ │  +$1,240     │ │    4 open    │ │  1 urgent   │ │
│ │ items        │ │  overnight   │ │              │ │             │ │
│ │              │ │              │ │              │ │             │ │
│ │[Review queue]│ │[Open revenue]│ │[View tickets]│ │[View →]     │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ DECISIONS NEEDED                                                     │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ ⚠  Enterprise inquiry from Acme Corp — Sloane needs go/no-go  │  │
│ │    Respond before EOD · [Review pipeline card →]              │  │
│ │                                                                │  │
│ │ ⚠  Logan flagged ToS update needed for EU GDPR compliance     │  │
│ │    Time-sensitive · [Open legal queue →]                      │  │
│ └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ TODAY'S SNAPSHOT (2-column)                                         │
│ ┌────────────────────────────┐ ┌────────────────────────────────┐   │
│ │ AGENT ALERTS               │ │ CONTENT PUBLISHING TODAY       │   │
│ │ 1 agent failed overnight   │ │ Morgan: 2 posts scheduled      │   │
│ │ [View Agent Status →]      │ │ Clara: 1 email going out       │   │
│ │                            │ │ [View calendar →]              │   │
│ └────────────────────────────┘ └────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Stat Cards (Top Row)

**Grid:** `grid grid-cols-4 gap-4`

Each card: `bg-zinc-900 border border-zinc-800 rounded-xl p-5`

| Card | Value | Accent | Quick Action |
|------|-------|--------|--------------|
| Approval Queue | Count of pending items | Red if >3, Amber if 1-3, Zinc if 0 | "Review queue" → `/support` |
| Revenue Delta | ±$ overnight change | Emerald if positive, Red if negative | "Open revenue" → `/revenue` |
| Support Tickets | Open ticket count | Amber if >2, Zinc if 0 | "View tickets" → `/support` |
| Top Decision | Count of Rob-blocking items | Always Amber if >0 | "View →" scrolls to Decisions section |

**Card anatomy:**
- Label: `text-xs font-medium text-zinc-500 uppercase tracking-wider`
- Value: `text-3xl font-semibold tabular-nums text-zinc-50 mt-2` (with color override for accent)
- Sub-label: `text-xs text-zinc-500 mt-0.5` — e.g., "items pending" or "since midnight"
- Quick-action button: `mt-4 w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs py-1.5 rounded-lg font-medium`

### Decisions Needed Section

Only renders if there are Rob-blocking items (sourced from Support Queue "Awaiting Approval" + Sales Pipeline items tagged "needs Rob" + Legal Queue flagged).

- Container: `bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4`
- Header: `text-sm font-medium text-zinc-300 mb-3` — "Decisions Needed"
- Each item: `flex items-start gap-3 py-3 border-b border-zinc-800/50 last:border-0`
  - Icon: `AlertTriangle` `w-4 h-4 text-amber-400 mt-0.5 shrink-0`
  - Body: `flex-1`
    - Primary text: `text-sm text-zinc-200`
    - Sub-text: `text-xs text-zinc-500 mt-0.5`
  - CTA link: `text-xs text-zinc-400 hover:text-zinc-200 underline-offset-2 hover:underline`
- Max 5 items shown. If more: "+N more decisions pending" link.

### Today's Snapshot Row

Two side-by-side mini-panels (`grid grid-cols-2 gap-4`):

**Agent Alerts mini-panel:**
- Shows count of failed/warning agents + quick summary text
- If all green: "All 28 agents healthy" in `text-emerald-400`
- CTA: "View Agent Status →"

**Content Publishing mini-panel:**
- Lists scheduled posts/emails going out today (from Content Calendar)
- Each line: `text-xs text-zinc-300` — "Morgan: LinkedIn post · 10:00 AM"
- CTA: "View calendar →"

### Last Updated / Telegram Note

Footer of the page, below all content:

`text-xs text-zinc-600 text-right px-6 pb-4` — "Brief generated by Eva 📋 at 7:58 AM · Sent to Telegram ✓"

---

## 6. Module 2 — CRM

**Route:** `/crm`
**Managed by:** Caleb 🏗️
**Purpose:** Full customer database. Every person who has ever touched the product.

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER: CRM                                [+ Add customer]        │
│ Managed by Caleb 🏗️ · 847 contacts · Updated 12m ago              │
├────────────────────────────────────────────────────────────────────┤
│ FILTER BAR                                                         │
│ Plan: [All ▾] [Free] [Pro] [Cloud]  Stage: [All ▾]  Date: [Any ▾] │
│ [🔍 Search email or name...                              ]         │
├────────────────────────────────────────────────────────────────────┤
│ CUSTOMER TABLE (fills remaining height, scrollable)               │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ Email           Plan  Stage      Purchase   LTV     Active   │  │
│ │ ──────────────────────────────────────────────────────────── │  │
│ │ rob@example.com Pro   Pro        Jan 12     $348    3h ago   │  │
│ │ alice@corp.com  Cloud Enterprise Mar 1      $2,400  1d ago   │  │
│ │ user@free.io   Free   Free       —          $0      12d ago  │  │
│ │ ...                                                          │  │
│ └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Filter Bar

`flex items-center gap-3 px-6 py-3 border-b border-zinc-800 bg-zinc-950`

- **Plan pills:** Inline toggle chips: All · Free · Pro · Cloud (Enterprise)
  - Chip: `px-3 py-1 text-xs font-medium rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer`
  - Active chip: `border-zinc-400 text-zinc-100 bg-zinc-800`
- **Stage dropdown:** `Select` component — All / Lead / Waitlist / Free / Pro / Enterprise
- **Date range:** `Select` — Any / Last 7d / Last 30d / Last 90d / Custom
- **Search input:** Right-aligned, `w-72`, `bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm placeholder:text-zinc-600`
  - `Search` icon left-inside

### Customer Table

Full-width, dense table. No zebra striping — rely on hover state.

**Columns:**

| Column | Width | Notes |
|--------|-------|-------|
| Email | `w-[220px]` | Primary identifier, left-aligned, `font-mono text-sm text-zinc-200` |
| Plan | `w-[80px]` | Badge: Free=zinc, Pro=blue, Cloud=violet |
| Stage | `w-[120px]` | Lifecycle badge (see below) |
| Purchase date | `w-[110px]` | `text-xs text-zinc-400`, "—" if none |
| LTV | `w-[80px]` | `tabular-nums text-sm text-zinc-300`, "$0" for free |
| License key | `w-[140px]` | `font-mono text-xs text-zinc-500`, masked: `AV3-XXXX-****-****` |
| Last active | `w-[90px]` | Relative time, `text-xs text-zinc-400` |
| Stage progress | `w-[40px]` | Mini horizontal progress bar (optional) |

**Lifecycle stage badges:**

```
Lead:       bg-zinc-800     text-zinc-400    "Lead"
Waitlist:   bg-blue-400/10  text-blue-400    "Waitlist"
Free:       bg-zinc-800     text-zinc-300    "Free"
Pro:        bg-violet-400/10 text-violet-400 "Pro"
Enterprise: bg-amber-400/10 text-amber-400   "Enterprise"
```

Badge style: `px-2 py-0.5 rounded-md text-[11px] font-medium border border-[color]/20`

**Table row:**
- Height: `h-10`
- `hover:bg-zinc-800/50 cursor-pointer transition-colors`
- Click opens Customer Detail Panel (right slide-out)
- `border-b border-zinc-800/40`

**Table header:**
- `text-xs font-medium text-zinc-500 uppercase tracking-wider`
- `border-b border-zinc-800 bg-zinc-950 sticky top-0`

### Customer Detail Panel

Opens on row click. Slides in from right (`w-[520px]`).

```
┌──────────────────────────────────────────────┐
│ ← CRM                                     ✕  │
├──────────────────────────────────────────────┤
│ rob@example.com                              │
│ Pro · $348 LTV · Last active 3h ago          │
│ License: AV3-XXXX-8F3A-9B2C  [Copy]         │
├──────────────────────────────────────────────┤
│ TABS: History │ Tickets │ Purchases │ Notes  │
├──────────────────────────────────────────────┤
│ [Tab content — see below]                    │
└──────────────────────────────────────────────┘
```

**Panel header:**
- Email: `text-base font-semibold text-zinc-100 font-mono`
- Meta row: `text-xs text-zinc-500` — plan badge + LTV + last active
- License key: `text-xs font-mono text-zinc-500 mt-1` with copy-to-clipboard icon `w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300`

**History tab:**
Timeline of all events — signups, plan changes, logins, purchases. Each event:
- `flex items-start gap-3 py-2.5 border-b border-zinc-800/40`
- Left: Date `text-xs text-zinc-600 w-24 shrink-0`
- Middle: Event description `text-sm text-zinc-300`
- Dot timeline visual: thin `w-px bg-zinc-800` vertical line with `w-1.5 h-1.5 rounded-full bg-zinc-600` dot

**Tickets tab:**
List of support tickets for this customer (subset of Support Queue filtered by email). Same row style as Support Queue but compact.

**Purchases tab:**
Stripe transaction list: date, amount, plan, status. `font-mono text-sm` for amounts.

**Notes tab:**
- Free-text textarea: `bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 w-full min-h-[120px] resize-none font-mono`
- "Save note" button: `text-xs bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg`
- Previous notes shown below in chronological order with timestamps

---

## 7. Module 3 — Support Queue

**Route:** `/support`
**Managed by:** Sophie 💬
**Purpose:** Rob's approval inbox for customer support. Sophie drafts, Rob approves.

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER: Support Queue          [Batch approve ▾]  [Filter ▾]      │
│ Managed by Sophie 💬 · 4 awaiting approval · Updated 2m ago       │
├────────────────────────────────────────────────────────────────────┤
│ STATUS TABS: All · Open (12) · Drafted (4) · Awaiting (7) · Sent  │
├────────────────────────────────────────────────────────────────────┤
│ TICKET TABLE                                                       │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │  Source  Category   Subject                   Status   Updated │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │  GH      Bug        Login broken on Safari    Awaiting  2m    │ │
│ │  Email   Billing    Charge without warning    Awaiting  1h    │ │
│ │  Discord General    How do I add agents?      Drafted   3h    │ │
│ │  Slack   Enterprise Need SSO integration      Open      1d    │ │
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Status Tabs

`flex items-center gap-1 px-6 pt-3 pb-0 border-b border-zinc-800`

Each tab: `px-3 py-2 text-sm text-zinc-400 border-b-2 border-transparent hover:text-zinc-200 cursor-pointer`
Active: `text-zinc-50 border-b-2 border-zinc-200`
Count badge inline: `ml-1.5 text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full`

Status values: **All · Open · Drafted · Awaiting Approval · Sent · Closed**

### Ticket Table

**Columns:**

| Column | Width | Notes |
|--------|-------|-------|
| Checkbox | `w-9` | For batch operations |
| Source | `w-[60px]` | Icon only (see below) |
| Category | `w-[100px]` | Badge |
| Subject | `flex-1` | `text-sm text-zinc-200` truncated |
| Customer | `w-[180px]` | `text-xs text-zinc-400 font-mono` — email |
| Status | `w-[140px]` | Badge |
| Assignee | `w-[32px]` | Sophie's emoji avatar always |
| Updated | `w-[70px]` | Relative time |

**Source icons** (16×16, in `text-zinc-500`):

| Source | Icon | Label |
|--------|------|-------|
| GitHub | `Github` Lucide | GH |
| Slack | Custom SVG or `Hash` | Slack |
| Discord | Custom SVG or `MessageCircle` | Discord |
| Email | `Mail` | Email |
| Form | `FileText` | Form |

Show icon + abbreviation text below on hover tooltip.

**Category badges:**

```
Bug:        bg-red-400/10    text-red-400    "Bug"
Billing:    bg-amber-400/10  text-amber-400  "Billing"
General:    bg-zinc-800      text-zinc-400   "General"
Enterprise: bg-violet-400/10 text-violet-400 "Enterprise"
```

**Status badges:**

```
Open:              bg-blue-400/10   text-blue-400   "Open"
Drafted:           bg-amber-400/10  text-amber-400  "Drafted"
Awaiting Approval: bg-orange-400/10 text-orange-400 "Awaiting Approval"
Sent:              bg-emerald-400/10 text-emerald-400 "Sent"
Closed:            bg-zinc-800      text-zinc-500   "Closed"
```

**Row behavior:**
- Rows with "Awaiting Approval" status: left border `border-l-2 border-l-orange-500/60`
- Rows selected via checkbox: `bg-zinc-800/40`
- Click row body → opens Ticket Detail Panel

### Batch Approve Button

Top right header area. `bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-1.5 rounded-lg`

- Only active when ≥1 checkbox selected
- Grayed out otherwise: `opacity-40 cursor-not-allowed`
- Click: Opens confirmation modal: "Approve and send [N] responses? This will email customers directly."
  - Modal: `bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm`
  - Confirm button: `bg-emerald-600 text-white`
  - Cancel: `bg-zinc-800 text-zinc-300`

### Ticket Detail Panel

Opens on row click. `w-[560px]`

```
┌─────────────────────────────────────────────────┐
│ ← Support Queue                              ✕  │
├─────────────────────────────────────────────────┤
│ [GH icon] Login broken on Safari                │
│ Bug · rob@example.com · Opened 2h ago           │
│ Status: [Awaiting Approval badge]               │
├─────────────────────────────────────────────────┤
│ THREAD                                          │
│ ─────────────────────────────────────────────── │
│ [Customer avatar] rob@example.com               │
│ [Customer message text]                         │
│                                                 │
│ [Sophie emoji] Sophie · Draft response:         │
│ ┌─────────────────────────────────────────────┐ │
│ │ Hi Rob, thanks for reaching out. This is    │ │
│ │ a known issue with Safari 17.x ...          │ │
│ │ [Editable textarea if "Edit" is clicked]    │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ [Approve & Send]  [Edit]  [Reject]              │
└─────────────────────────────────────────────────┘
```

**Thread area:**
- Customer messages: left-aligned, `bg-zinc-800/60 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-zinc-200`
- Customer avatar: first initial in `w-7 h-7 rounded-full bg-zinc-700 text-xs text-zinc-300`
- Sophie's draft: `bg-zinc-800 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-zinc-200`
  - Header: `text-xs text-amber-400 mb-2 flex items-center gap-1` — "💬 Sophie's draft"
  - Editable only after clicking "Edit" → textarea replaces the text block

**Action buttons row:**
- `flex items-center gap-3 px-5 py-4 border-t border-zinc-800`
- **Approve & Send:** `bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2` — `CheckCircle2` icon
- **Edit:** `bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-lg` — `Pencil` icon. Clicking enables textarea editing of Sophie's draft.
- **Reject:** `bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg` — `X` icon. Opens a small "Rejection reason" field before confirming.

**Confirmation states:**
- After "Approve & Send": Panel shows `text-emerald-400 text-sm` — "✓ Response sent to rob@example.com" + closes after 1.5s
- After "Reject": Status updates to "Closed (rejected)" and row disappears from Awaiting tab

---

## 8. Module 4 — Revenue Dashboard

**Route:** `/revenue`
**Managed by:** Audrey 💹
**Purpose:** Financial truth. P&L at a glance. No accounting software needed for a quick read.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Revenue                        [Export CSV] [+ Expense]  │
│ Managed by Audrey 💹 · Stripe sync'd 8m ago                      │
├──────────────────────────────────────────────────────────────────┤
│ TOP STATS (5-column)                                             │
│ MRR $4,280 │ ARR $51,360 │ Customers 284 │ New/wk +7 │ Churn 2.1%│
├──────────────────────────────────────────────────────────────────┤
│ CHART: Revenue over time                   [30d] [90d] [1y]     │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │                                                    /       │  │
│ │                                              _____/        │  │
│ │                                        _____/              │  │
│ │ __________/\/\/\___/\/\______________/                     │  │
│ └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ 2-column: TRANSACTIONS (left) │ P&L SUMMARY (right)             │
│                               │                                 │
│ Recent Stripe transactions    │ Revenue:  $4,280                │
│ ─────────────────────────────│ Expenses: ($1,840)              │
│ rob@ex.com  Pro  +$29  Mar 17 │ ──────────────────────          │
│ alice@corp  Cld  +$199 Mar 16 │ Net:      $2,440 ✓             │
│ ...                           │                                 │
│                               │ EXPENSE LOG                     │
│                               │ [+ Manual entry]  [Import CSV] │
│                               │ infra  $840  Mar 15             │
│                               │ tools  $600  Mar 10             │
└──────────────────────────────────────────────────────────────────┘
```

### Top Stats Row

`grid grid-cols-5 gap-3 px-6 py-5 border-b border-zinc-800`

Each stat: `flex flex-col`
- Label: `text-xs text-zinc-500 uppercase tracking-wider font-medium`
- Value: `text-2xl font-semibold text-zinc-50 tabular-nums mt-1`
- Trend delta: `text-xs mt-0.5` — e.g., "+$340 vs last month" in emerald or red

| Stat | Format | Trend |
|------|--------|-------|
| MRR | $4,280 | vs prior month |
| ARR | $51,360 | calculated from MRR×12 |
| Total Customers | 284 | vs prior month |
| New This Week | +7 | vs prior week |
| Churn Rate | 2.1% | vs prior month, lower is better |

Dividers between stats: `border-r border-zinc-800 pr-6 mr-3` except last.

### Revenue Chart

`bg-zinc-900 border border-zinc-800 rounded-xl` in the main content area.

- **Toggle buttons:** `[30d] [90d] [1y]` — pill toggles top-right of chart card
  - Active: `bg-zinc-700 text-zinc-100`
  - Inactive: `bg-transparent text-zinc-500 hover:text-zinc-300`
- **Chart type:** Line chart with area fill
  - Line: `stroke-emerald-400 stroke-width-2`
  - Area fill: gradient from `emerald-400/20` to `transparent`
  - Grid lines: `stroke-zinc-800 stroke-1`
  - Axis labels: `text-[10px] text-zinc-500 font-mono`
- **Tooltip on hover:** `bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs`
  - Date + MRR value
- **Library:** Recharts or similar (defer to Felix's preference)

### Transactions Table

Left side of 2-column split (`grid grid-cols-3 gap-6` — transactions get 2fr, P&L gets 1fr).

`bg-zinc-900 border border-zinc-800 rounded-xl`

- Header: "Recent Transactions" + Stripe logo small
- Columns: Email · Plan · Amount · Date · Status
- Amount: `text-emerald-400 font-mono font-medium text-sm`
- Refunds: `text-red-400` with `−` prefix
- Rows: `h-9 text-xs`, dense, `border-b border-zinc-800/40`
- Max 20 rows shown, "View all in Stripe ↗" link at bottom (opens Stripe dashboard)

### P&L Summary Panel

Right side of 2-column split.

`bg-zinc-900 border border-zinc-800 rounded-xl p-5`

**P&L block:**
```
Revenue:   $4,280
Expenses: ($1,840)
─────────────────
Net:       $2,440
```
- "Revenue" row: `text-sm text-zinc-300` + `text-sm text-emerald-400 tabular-nums font-mono`
- "Expenses" row: `text-sm text-zinc-300` + `text-sm text-red-400 tabular-nums font-mono`
- Divider: `border-t border-zinc-700 my-2`
- "Net" row: `text-sm font-medium text-zinc-100` + `text-sm font-semibold tabular-nums` (emerald if positive, red if negative)

**Expense Log:**
Below P&L block, `border-t border-zinc-800 pt-4 mt-4`

- Header row: "Expenses" label + `[+ Manual]` ghost button + `[Import CSV]` ghost button
- `[+ Manual]` opens inline mini-form: date input + amount input + category dropdown + description input + Save button
- Category options: Infra · Tools · Marketing · Salary · Other
- Each expense row: `flex items-center gap-3 py-2 text-xs border-b border-zinc-800/30`
  - Category badge: `bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase`
  - Amount: `text-red-400 font-mono`
  - Description: `text-zinc-400 flex-1 truncate`
  - Date: `text-zinc-600`
  - Delete: `Trash2` icon `w-3 h-3 text-zinc-700 hover:text-red-400 ml-1 opacity-0 group-hover:opacity-100`

---

## 9. Module 5 — Sales Pipeline

**Route:** `/sales`
**Managed by:** Sloane 💰
**Purpose:** Kanban view of active deals + outreach drafts awaiting Rob's approval.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Sales Pipeline                [Outreach Queue: 3 drafts] │
│ Managed by Sloane 💰 · Updated 1h ago                            │
├──────────────────────────────────────────────────────────────────┤
│ KANBAN BOARD (horizontal scroll)                                 │
│                                                                  │
│ Lead(8) Contacted(5) Interested(3) Demo(2) Negotiating(1) Closed │
│ ┌────┐  ┌────────┐   ┌──────────┐  ┌────┐  ┌──────────┐  ┌───┐ │
│ │card│  │  card  │   │   card   │  │card│  │  card    │  │...│ │
│ │card│  │  card  │   │   card   │  └────┘  └──────────┘  └───┘ │
│ │card│  └────────┘   └──────────┘                               │
│ └────┘                                                           │
├──────────────────────────────────────────────────────────────────┤
│ OUTREACH DRAFT QUEUE                                             │
│ Sloane's drafts awaiting Rob's approval before sending           │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ To: cto@bigcorp.com  Subject: A.L.I.C.E. for your team      │ │
│ │ [Preview] [Approve & Send] [Edit] [Reject]                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Kanban Board

**Container:** `flex gap-4 overflow-x-auto pb-4 px-6 pt-4` (horizontal scroll)

**Columns:** Lead · Contacted · Interested · Demo · Negotiating · Closed · Lost

Each column: `flex flex-col w-[220px] min-w-[220px]`
- Column header: `flex items-center justify-between mb-3`
  - Label: `text-xs font-medium text-zinc-400 uppercase tracking-wider`
  - Count: `text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full`
- Cards container: `flex flex-col gap-2 min-h-[100px]`

**Deal card:**
`bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-zinc-600 transition-colors`

```
┌────────────────────────┐
│ Acme Corp              │
│ Sarah Chen, CTO        │
│                        │
│ Signal: LinkedIn DM    │
│ Est: $2,400/yr         │
│                        │
│ Last activity: 2d ago  │
└────────────────────────┘
```

- Company: `text-sm font-medium text-zinc-100`
- Contact: `text-xs text-zinc-400`
- Signal source: `text-[10px] text-zinc-600 mt-2` with small icon (LinkedIn/Email/Referral)
- Est. deal: `text-xs font-mono text-zinc-300`
- Last activity: `text-[10px] text-zinc-600 mt-1`
- Left border accent by stage:
  - Lead: `border-l-2 border-l-zinc-600`
  - Interested: `border-l-2 border-l-blue-500/60`
  - Demo: `border-l-2 border-l-amber-500/60`
  - Negotiating: `border-l-2 border-l-violet-500/60`
  - Closed: `border-l-2 border-l-emerald-500/60`
  - Lost: `border-l-2 border-l-red-500/40 opacity-50`

**Card click:** Opens deal detail in right slide-out panel with full contact history, notes, and stage change controls.

### Outreach Draft Queue

Below the kanban, separated by a `border-t border-zinc-800 mt-4 pt-4`

- Section header: `text-sm font-medium text-zinc-300 px-6 mb-3` + subtitle `text-xs text-zinc-500`
- Each draft: `bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 mb-3 mx-6`
  - To/From/Subject line: `text-xs text-zinc-500 font-mono`
  - Preview of email body: `text-sm text-zinc-300 mt-2 line-clamp-3`
  - Actions row: `flex items-center gap-2 mt-3`
    - "Preview" ghost button → expands full email
    - "Approve & Send": emerald button
    - "Edit": zinc button (opens draft editor)
    - "Reject": red ghost button

---

## 10. Module 6 — Content Calendar

**Route:** `/content`
**Managed by:** Morgan 📣 (posts) + Clara ✉️ (emails)
**Purpose:** See what's going out. Catch anything that needs review before publish.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Content Calendar            [← Week] [Mar 17–23] [Week →]│
│ Morgan 📣 + Clara ✉️ · 3 items need review                       │
├──────────────────────────────────────────────────────────────────┤
│ DRAFT REVIEW QUEUE (collapsed by default, expands if items exist) │
│ ⚠ 3 drafts need Rob's review before publishing   [Expand ▾]     │
├──────────────────────────────────────────────────────────────────┤
│ WEEK VIEW                                                        │
│      Mon   Tue   Wed   Thu   Fri   Sat   Sun                    │
│      Mar17 Mar18 Mar19 Mar20 Mar21 Mar22 Mar23                  │
│                                                                  │
│ 📣   ──    📝LI  ──    📝X   ──    ──    ──                     │
│      ──    ──    📝Blog ──    ──    ──    ──                     │
│ ✉️   ──    ──    ──    📧NL  ──    ──    ──                     │
├──────────────────────────────────────────────────────────────────┤
│ PUBLISHED FEED (last 10 items)                                  │
│ Mar 15 · LinkedIn · "Why AI agents need..." · 847 views         │
│ Mar 12 · Email NL · "March update" · 23.4% open rate           │
│ ...                                                              │
└──────────────────────────────────────────────────────────────────┘
```

### Draft Review Queue

`bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-3 mx-6 mt-4`

Collapsed: Shows just "⚠ N drafts need Rob's review" + Expand chevron.
Expanded: Each draft as a row:
- Type icon (📝 post / 📧 email)
- Title/subject: `text-sm text-zinc-200`
- Agent: `text-xs text-zinc-500` — "by Morgan 📣"
- Platform: tag badge — LinkedIn / X / Email / Blog
- Scheduled for: `text-xs text-zinc-400`
- Action buttons: [Review & Approve] [Reject]

### Week View

`grid grid-cols-8 gap-0` (1 label column + 7 day columns)

- Row headers (left col): Morgan emoji row, Clara emoji row
- Day header cells: `text-xs font-medium text-zinc-500 text-center py-3 border-b border-zinc-800`
  - Today: `text-zinc-100 bg-zinc-800 rounded-md`
- Content cells: `min-h-[80px] border-b border-r border-zinc-800/40 p-2 align-top`

**Content item chip in cell:**
`bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md px-2 py-1.5 text-xs cursor-pointer mb-1`
- Platform icon (small, 12px)
- Title truncated: `text-zinc-300 ml-1`
- Status dot: right side — green if approved, amber if draft, zinc if reviewing

**Click item:** Expands or opens right panel with full draft, scheduled time, platform, and Review/Approve actions.

### Published Feed

`border-t border-zinc-800 mt-4 pt-4 px-6`

Header: "Recently Published" `text-sm font-medium text-zinc-400 mb-3`

Each row: `flex items-center gap-4 py-2.5 border-b border-zinc-800/40 text-xs`
- Date: `w-14 text-zinc-600 font-mono`
- Platform badge: same style as category badges
- Title: `flex-1 text-zinc-300 truncate`
- Performance note: `text-zinc-500` — "847 views" or "23.4% open" or "12 clicks"
- Source agent emoji: right-aligned

---

## 11. Module 7 — Agent Status Board

**Route:** `/agents`
**Purpose:** Rob's single-pane view into all 28 agents. Is everything running? What broke overnight?

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Agent Status Board                                       │
│ 26 healthy · 1 warning · 1 failed · Last refresh 30s ago  [↺]   │
├──────────────────────────────────────────────────────────────────┤
│ FILTER: [All] [Healthy] [Warning] [Failed] [Idle]               │
├──────────────────────────────────────────────────────────────────┤
│ AGENT GRID (4-column)                                           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│ │ 🧠 Olivia    │ │ 💻 Dylan     │ │ 🛡️ Selena    │ │ 🚀 Devon ││
│ │ ✅ Healthy   │ │ ✅ Healthy   │ │ ⚠️ Warning   │ │ ✅ Health││
│ │ 2m ago       │ │ 12m ago      │ │ API timeout  │ │ 8m ago   ││
│ │ Next: 28m    │ │ Next: on msg │ │ Next: manual │ │ Next: 2h ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│ ...                                                              │
├──────────────────────────────────────────────────────────────────┤
│ FAILED AGENTS (if any) — highlighted section                    │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ❌ Morgan 📣  Failed: Rate limit hit on LinkedIn API        │  │
│ │ Last run: 6h ago  [View log] [Retry] [Dismiss]            │  │
│ └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Bar

`flex items-center gap-6 px-6 py-3 border-b border-zinc-800 text-sm`

- "26 healthy" `text-emerald-400`
- "1 warning" `text-amber-400`
- "1 failed" `text-red-400`
- "Last refresh 30s ago" `text-xs text-zinc-600 ml-auto`
- Refresh icon button: `↺` `w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-500`

### Filter Chips

Same chip pattern as CRM: All · Healthy · Warning · Failed · Idle

### Agent Grid

`grid grid-cols-4 gap-3 px-6 py-4`

Each agent card: `bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-600 transition-colors`

**Failed agents:** `bg-red-950/30 border-red-800/50 ring-1 ring-red-500/20`
**Warning agents:** `bg-amber-950/20 border-amber-800/40`

Card content:
```
┌─────────────────────────────┐
│ 🧠 Olivia                ●  │  ← Status dot top-right
│ Chief Orchestration Officer │
│                             │
│ Last run: 2m ago            │
│ Next run: 28m               │
└─────────────────────────────┘
```

- Emoji: `text-2xl`
- Name: `text-sm font-medium text-zinc-100 mt-1`
- Title: `text-[11px] text-zinc-500`
- Status badge below name: `px-2 py-0.5 rounded-md text-[11px] font-medium` — same colors as status system
- "Last run": `text-[11px] text-zinc-500 mt-2`
- "Next run": `text-[11px] text-zinc-600`

**Status values and badges:**

```
✅ Healthy:  bg-emerald-400/10 text-emerald-400  "Healthy"
⚠️ Warning:  bg-amber-400/10  text-amber-400   "Warning"
❌ Failed:   bg-red-400/10    text-red-400     "Failed"
💤 Idle:     bg-zinc-800      text-zinc-500    "Idle"
```

### Agent Log Panel

Click any agent card → right slide-out panel `w-[560px]`

```
┌──────────────────────────────────────────────────────┐
│ ← Agent Status                                    ✕  │
├──────────────────────────────────────────────────────┤
│ 🧠 Olivia · Chief Orchestration Officer              │
│ Status: ✅ Healthy · Last run: 2m ago                │
├──────────────────────────────────────────────────────┤
│ LAST RUN OUTPUT                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [Monospace log output]                           │ │
│ │ 2026-03-17 07:58:02 INFO Orchestration started  │ │
│ │ 2026-03-17 07:58:03 INFO Routing to Sophie...   │ │
│ │ 2026-03-17 07:58:05 INFO Completed in 3.2s      │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ Run history (last 10 runs):                         │
│ ✅ 2m ago    3.2s   [View log]                      │
│ ✅ 32m ago   2.8s   [View log]                      │
│ ⚠️  1h ago   timeout [View log]                    │
└──────────────────────────────────────────────────────┘
```

**Log area:**
- `bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 overflow-y-auto max-h-[300px]`
- Timestamps: `text-zinc-600`
- Log levels: INFO=zinc-400, WARN=amber-400, ERROR=red-400
- Line hover: `bg-zinc-900/60`

**Run history table:**
- Small table, `text-xs`
- Status icon + relative time + duration + "View log" link
- Click "View log" loads that run's output in the log area above

### Failed Agents Highlight Section

If any agents are in Failed state, show a distinct section above the grid (after filter chips):

`bg-red-950/20 border border-red-800/40 rounded-xl px-5 py-4 mx-6 mb-4`

Header: `text-sm font-medium text-red-400 mb-3` — "❌ Failed Agents"

Each failed agent row:
- Agent emoji + name: `text-sm font-medium text-zinc-200`
- Error summary: `text-xs text-red-300` — truncated error message
- "Last run N ago"
- Action buttons: [View log] [Retry] [Dismiss]
  - Retry: `bg-zinc-800 text-zinc-200 text-xs px-3 py-1 rounded-md`
  - Dismiss: `text-zinc-600 text-xs hover:text-zinc-400`

---

## 12. Module 8 — Legal Queue

**Route:** `/legal`
**Managed by:** Logan ⚖️
**Purpose:** Logan flags legal items. Rob reviews, approves, resolves.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Legal Queue                              [+ Upload doc]  │
│ Managed by Logan ⚖️ · 4 items flagged · Updated 2h ago          │
├──────────────────────────────────────────────────────────────────┤
│ STATUS TABS: All · Flagged (4) · In Review (1) · Resolved       │
├──────────────────────────────────────────────────────────────────┤
│ LEGAL TABLE                                                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Type       Item                          Severity   Status   │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │ Contract   MSA — BigCorp Inc.            High       Flagged  │ │
│ │ Compliance GDPR — EU data residency      Critical  Flagged  │ │
│ │ ToS        Privacy policy update needed  Medium    In Review│ │
│ │ Contract   NDA — Freelancer X            Low       Resolved │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Legal Table

**Columns:**

| Column | Width | Notes |
|--------|-------|-------|
| Type | `w-[110px]` | Badge — Contract / Compliance / ToS / Policy |
| Item name | `flex-1` | `text-sm text-zinc-200` |
| Logan's note | `w-[260px]` | `text-xs text-zinc-500 truncate` — Logan's flag reason |
| Severity | `w-[90px]` | Severity badge |
| Status | `w-[110px]` | Status badge |
| Date flagged | `w-[80px]` | Relative time |

**Type badges:**

```
Contract:   bg-blue-400/10   text-blue-400    "Contract"
Compliance: bg-red-400/10    text-red-400     "Compliance"
ToS:        bg-amber-400/10  text-amber-400   "ToS"
Policy:     bg-zinc-800      text-zinc-400    "Policy"
```

**Severity badges:**

```
Critical: bg-red-400/10    text-red-400     "Critical"
High:     bg-orange-400/10 text-orange-400  "High"
Medium:   bg-amber-400/10  text-amber-400   "Medium"
Low:      bg-blue-400/10   text-blue-400    "Low"
```

**Status badges:**

```
Flagged:   bg-red-400/10    text-red-400    "Flagged"
In Review: bg-amber-400/10  text-amber-400  "In Review"
Resolved:  bg-emerald-400/10 text-emerald-400 "Resolved"
```

### Legal Item Detail Panel

Click row → right slide-out panel `w-[580px]`

```
┌────────────────────────────────────────────────────────┐
│ ← Legal Queue                                       ✕  │
├────────────────────────────────────────────────────────┤
│ MSA — BigCorp Inc.                                     │
│ Contract · High severity · Flagged Mar 15             │
├────────────────────────────────────────────────────────┤
│ LOGAN'S NOTES                                          │
│ ┌────────────────────────────────────────────────┐    │
│ │ "Clause 12.3 grants them IP ownership over    │    │
│ │  any derivative works. Recommend striking      │    │
│ │  or narrowing. Also: payment terms are net-90, │    │
│ │  we should push for net-30."                   │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ DOCUMENT VIEWER                                        │
│ ┌────────────────────────────────────────────────┐    │
│ │ [PDF / document rendered inline or link]       │    │
│ │ [If PDF: iframe embed or native PDF viewer]    │    │
│ │ [If no doc: "No document uploaded"]            │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ ACTIONS                                                │
│ [Mark In Review] [Mark Resolved] [Add note]           │
└────────────────────────────────────────────────────────┘
```

**Logan's notes block:**
`bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm text-zinc-300 italic`
Prefixed with: `text-xs text-zinc-500 mb-2` — "⚖️ Logan's analysis:"

**Document viewer:**
- If a document is attached: `w-full h-[350px] bg-zinc-950 border border-zinc-800 rounded-lg`
  - PDF: rendered via `<iframe>` or `pdf.js`
  - Image: `<img>` with zoom on click
  - If too complex: "Open document ↗" link to storage URL
- "Upload document" button if none attached: `border-dashed border-2 border-zinc-700 rounded-lg p-6 text-center text-xs text-zinc-500 hover:border-zinc-500 cursor-pointer`

**Action buttons:**
`flex items-center gap-2 pt-4 border-t border-zinc-800`
- "Mark In Review": amber ghost button
- "Mark Resolved": emerald button
- "Add Note": zinc ghost button → opens textarea inline

---

## 13. Module 9 — Security Console

**Route:** `/security`
**Managed by:** Selena 🛡️
**Purpose:** Open findings, audit log, compliance checklist. Low noise, high signal.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Security Console                                         │
│ Managed by Selena 🛡️ · 2 open findings · Last scan 1h ago       │
├──────────────────────────────────────────────────────────────────┤
│ 3-SECTION LAYOUT (stacked)                                       │
│                                                                  │
│ ── OPEN FINDINGS ──────────────────────────────────────────────  │
│  Critical  API key exposed in env log    [View] [Resolve]        │
│  Medium    Dependency: lodash < 4.17.21  [View] [Resolve]        │
│                                                                  │
│ ── AUDIT LOG ──────────────────────────────────────────────────  │
│ 2026-03-17 08:02 Rob@gmail   LOGIN  admin.av3.ai  Chrome/macOS   │
│ 2026-03-17 07:58 system      CRON   eva-brief     completed      │
│ 2026-03-17 07:45 sophia-api  CALL   /api/support  200 OK         │
│ ...  (last 50 events)                                            │
│                                                                  │
│ ── COMPLIANCE CHECKLIST ─────────────────────────────────────── │
│ GDPR                                                             │
│ ✅ Privacy policy published                                      │
│ ✅ Cookie consent implemented                                    │
│ ⚠  Data deletion workflow — needs implementation                 │
│ SOC2 Prep                                                        │
│ ⬜ Access control review                                         │
│ ⬜ Incident response runbook                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Open Findings Section

`bg-zinc-900 border border-zinc-800 rounded-xl mb-4`

Header: `px-5 py-3 border-b border-zinc-800 flex items-center justify-between`
- "Open Findings" `text-sm font-medium text-zinc-300`
- Count badge (red if critical exists)

**Finding row:**
`flex items-center gap-4 px-5 py-3 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 group`

- Severity badge: (Critical/High/Medium/Low — see token definitions)
- Component: `text-xs text-zinc-500 font-mono w-[140px]` — e.g., "api-gateway" or "npm:lodash"
- Description: `text-sm text-zinc-200 flex-1`
- Selena's recommendation: `text-xs text-zinc-500 italic` (shown on hover or in detail panel)
- [View] button: `text-xs text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100`
- [Resolve] button: `text-xs text-emerald-400 hover:text-emerald-300 opacity-0 group-hover:opacity-100`

**Finding detail (inline expand on click, not a panel):**
Expands a row below the clicked finding:
`bg-zinc-950 border-t border-zinc-800/40 px-5 py-4`
- Selena's full analysis: `text-sm text-zinc-300`
- Recommended fix: `text-sm text-zinc-300 mt-2`
- Affected files/URLs: `font-mono text-xs text-zinc-500`
- Resolve button large: `bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg`

### Audit Log Section

`bg-zinc-900 border border-zinc-800 rounded-xl mb-4`

Header: "Audit Log (last 50 events)" + `[Export]` button

**Table: dense, monospace-heavy**

Columns: Timestamp · Actor · Event type · Resource · Details

- Timestamp: `font-mono text-[11px] text-zinc-600 w-[140px]`
- Actor: `font-mono text-xs text-zinc-400 w-[180px]`
- Event type badge: color-coded
  - LOGIN/LOGOUT: zinc
  - API_CALL: blue
  - CRON: zinc
  - CONFIG_CHANGE: amber
  - SECURITY_EVENT: red
- Resource: `font-mono text-xs text-zinc-500 flex-1`
- Details: `text-xs text-zinc-600`

Row height: `h-8`, no visible borders between rows (rely on alternating `bg-zinc-950/30` for even rows).

Max 50 rows, no pagination — scroll in section. Section max-height: `max-h-[400px] overflow-y-auto`

### Compliance Checklist Section

`bg-zinc-900 border border-zinc-800 rounded-xl`

Header: "Compliance Checklist"

**Grouped by framework:** GDPR · SOC2 Prep · (expandable for future frameworks)

Group header: `text-xs font-medium text-zinc-400 uppercase tracking-wider px-5 py-3 border-b border-zinc-800/40`

**Checklist item:**
`flex items-start gap-3 px-5 py-2.5 hover:bg-zinc-800/20`

- Status icon: `w-4 h-4 shrink-0 mt-0.5`
  - ✅ Done: `CheckCircle2` `text-emerald-400`
  - ⚠ In progress: `AlertCircle` `text-amber-400`
  - ⬜ Not started: `Circle` `text-zinc-600`
- Item text: `text-sm text-zinc-300`
- Owner note (optional): `text-xs text-zinc-600` — "Selena's note: ..."
- Clicking a checklist item: Opens a small popover with notes field + status change dropdown

---

## 14. Module 10 — Competitive Intel

**Route:** `/intel`
**Managed by:** Rowan 🔍
**Purpose:** Know what competitors are doing. Act on it.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Competitive Intel                    [Request new scan]  │
│ Managed by Rowan 🔍 · Last delta report: 2d ago                  │
├──────────────────────────────────────────────────────────────────┤
│ ROWAN'S DELTA REPORT (top — latest report rendered in-app)      │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ## Week of March 15 — Competitive Delta                    │  │
│ │ Competitor X launched pricing change (+20%). Opportunity   │  │
│ │ to position A.L.I.C.E. as better value at current pricing. │  │
│ │ ...                                                        │  │
│ └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ 2-COLUMN: THREAT MAP (left) │ OPPORTUNITY FLAGS (right)         │
│                              │                                  │
│ ┌────────────────────────┐   │ ┌────────────────────────────┐  │
│ │ Competitor   Threat    │   │ │ Flag              Action   │  │
│ │ ──────────────────── │   │ │ ───────────────────────── │  │
│ │ Zapier       ████ High│   │ │ X pricing up 20%  Capitalize│ │
│ │ Make.com     ███  Med │   │ │ OpenAI API limit  Hedge now │  │
│ │ n8n          ██   Low │   │ │ ...                         │  │
│ │ AutoGPT      █    Low │   │ └────────────────────────────┘  │
│ │ LangChain    ███  Med │   │                                  │
│ │ CrewAI       ██   Low │   │                                  │
│ └────────────────────────┘   │                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Delta Report Section

`bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 mb-4`

Header row: `flex items-center justify-between mb-4`
- "Latest Delta Report" `text-sm font-medium text-zinc-300`
- Report date: `text-xs text-zinc-600` — "Week of March 15"
- "View archive ↓" `text-xs text-zinc-500 hover:text-zinc-300`

**Report content:**
Rendered as markdown (`prose prose-invert prose-sm max-w-none`):
- `prose-headings:text-zinc-200 prose-headings:font-semibold`
- `prose-p:text-zinc-400 prose-p:text-sm`
- `prose-strong:text-zinc-200`
- `prose-ul:text-zinc-400`
- `prose-code:text-emerald-400 prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded`

Max height: `max-h-[300px] overflow-y-auto` with fade-out at bottom + "Read more" expand toggle.

### Threat Map Table

Left side of 2-column (`grid grid-cols-5 gap-6` — 3fr + 2fr)

`bg-zinc-900 border border-zinc-800 rounded-xl`

Header: "Threat Map" — 6 competitors

**Columns:** Competitor · Threat Level (visual bar) · Category · Trend

| Column | Notes |
|--------|-------|
| Competitor | `text-sm font-medium text-zinc-200` |
| Threat bar | Horizontal bar: `h-2 rounded-full bg-zinc-800` filled with color based on level |
| Level label | Critical=red / High=orange / Medium=amber / Low=blue / Minimal=zinc |
| Category | `text-xs text-zinc-500` — pricing / features / marketing / VC-funded |
| Trend | Arrow icon: ↑ rising, → stable, ↓ declining — with color |

**Threat bar fill colors:**
- Critical: `bg-red-500`
- High: `bg-orange-400`
- Medium: `bg-amber-400`
- Low: `bg-blue-400`
- Minimal: `bg-zinc-600`

Bar width maps to threat level: Critical=100%, High=75%, Medium=50%, Low=30%, Minimal=15%

**Click competitor row:** Opens right panel with Rowan's full competitive brief for that competitor.

### Opportunity Flags Table

Right side of 2-column split.

`bg-zinc-900 border border-zinc-800 rounded-xl`

Header: "Opportunity Flags" — items Rowan has flagged as action-worthy

**Columns:** Flag description · Recommended action · Priority · Status

- Flag: `text-sm text-zinc-200`
- Recommended action: `text-xs text-zinc-400`
- Priority: `text-xs badge` — High/Medium/Low
- Status: `text-xs badge` — New / In Progress / Actioned / Dismissed

Each row is clickable → expands inline with Rowan's full context + "Mark as actioned" button.

**"Request new scan" button** (top-right of header):
`bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-lg`
Clicking triggers a webhook/API call to queue Rowan for a fresh competitive scan. Shows loading state: "Queuing Rowan..." → "Scan queued ✓"

---

## 15. Shared Components

These components appear across multiple modules. Felix should build them as primitives.

### `<StatusBadge variant="emerald|amber|red|zinc" size="sm|md">`

```
sm: px-1.5 py-0.5 text-[10px] rounded-md font-medium border
md: px-2 py-0.5 text-xs rounded-md font-medium border

Color map:
emerald → bg-emerald-400/10 text-emerald-400 border-emerald-400/20
amber   → bg-amber-400/10   text-amber-400   border-amber-400/20
red     → bg-red-400/10     text-red-400     border-red-400/20
zinc    → bg-zinc-800       text-zinc-400    border-zinc-700
orange  → bg-orange-400/10  text-orange-400  border-orange-400/20
blue    → bg-blue-400/10    text-blue-400    border-blue-400/20
violet  → bg-violet-400/10  text-violet-400  border-violet-400/20
```

### `<SeverityBadge level="critical|high|medium|low|info">`

Maps to color tokens above. Critical=red, High=orange, Medium=amber, Low=blue, Info=zinc.

### `<DataTable>`

Reusable dense table wrapper:
- `w-full text-sm`
- `<thead>`: `bg-zinc-950 sticky top-0 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider`
- `<tbody tr>`: `border-b border-zinc-800/40 hover:bg-zinc-800/40 cursor-pointer transition-colors h-10`
- Accepts: columns config, data array, onRowClick handler, loading state (skeleton rows)

### `<SlideOutPanel open={bool} onClose={fn} width="520px">`

- Fixed right panel overlay (see §4 Shell Layout)
- Handles open/close animation
- Renders header slot + content slot
- `Esc` key binding wired in

### `<ActionButtons approve reject edit?>`

Standard Approve/Reject/(Edit) button group used in Support Queue, Legal Queue, Outreach Drafts:
```
[Approve & Send]  [Edit]  [Reject]
```
Consistent sizing and spacing. Accept `onApprove`, `onEdit`, `onReject` callbacks.

### `<AgentAttribution agent="Sophie 💬" updatedAt={timestamp}>`

Small attribution line shown in all module headers:
`text-xs text-zinc-500` — "Managed by Sophie 💬 · Updated 4m ago"

### `<MonoId value="AV3-XXXX-8F3A-9B2C" masked?>`

`font-mono text-xs text-zinc-500` with optional copy-to-clipboard button.
If `masked`: shows `AV3-XXXX-****-****`
Copy triggers: brief `text-emerald-400` flash "Copied!" replacing the copy icon for 1.5s.

---

## 16. Implementation Notes for Felix

### Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** shadcn/ui components as base, styled to match these tokens
- **Charts:** Recharts (revenue chart), or Chart.js if Felix prefers
- **PDF viewer:** `react-pdf` for contract documents in Legal Queue
- **Auth:** Supabase Auth (Google OAuth), middleware route protection on all admin routes
- **Markdown:** `react-markdown` with `rehype-highlight` for code blocks (Competitive Intel report)
- **Drag:** Not required for Kanban — drag is optional; stage change via click/select is acceptable v1

### Priority Order

1. **Auth gate + shell layout** — sidebar, slot, route protection
2. **Morning Brief** — default landing, highest Rob-facing value
3. **Support Queue** — ticket table + approve/reject flow
4. **Agent Status Board** — Rob will check this constantly
5. **CRM** — customer table + detail panel
6. **Revenue Dashboard** — chart + P&L
7. **Sales Pipeline** — kanban + outreach queue
8. **Content Calendar** — week view + draft queue
9. **Legal Queue** — table + document viewer
10. **Security Console** — findings + audit log + compliance
11. **Competitive Intel** — delta report + threat map

### Route Structure

```
app/
├── (auth)/
│   └── login/page.tsx          ← Auth gate
├── (admin)/
│   ├── layout.tsx              ← Shell: sidebar + main slot
│   ├── page.tsx                ← Morning Brief (/)
│   ├── crm/page.tsx
│   ├── support/page.tsx
│   ├── revenue/page.tsx
│   ├── sales/page.tsx
│   ├── content/page.tsx
│   ├── agents/page.tsx
│   ├── legal/page.tsx
│   ├── security/page.tsx
│   └── intel/page.tsx
middleware.ts                   ← Supabase session check on all (admin) routes
```

### Data Notes

- All sensitive data (license keys, customer emails) must be served from server components or API routes — never baked into static props
- Revenue data: Stripe API via server-side fetch, cached 5min
- Agent status: poll internal A.L.I.C.E. API every 30s (or WebSocket if available)
- Support tickets: sync from wherever Sophie stores drafts (TBD — likely a Supabase table)
- Morning Brief: pre-generated by Eva at 8am, stored in Supabase, fetched on load

### Accessibility

- Keyboard navigation for all tables (↑↓ rows, Enter to open detail)
- `aria-label` on all icon-only buttons
- Focus trap in slide-out panels (`focus-trap-react` or native dialog)
- All status badges use text + color (not color alone)
- `prefers-reduced-motion`: disable slide animations, use instant show/hide

### Mobile Behavior

This console is desktop-only by design. At `<1024px`, show a centered message:

```
"Admin console is optimized for desktop.
 Please access from a laptop or desktop browser."
```

Do not attempt to make it mobile-responsive. Rob is the only user, he will use a real browser.

---

*This spec is definitive as of 2026-03-17. Questions or edge cases: ping Nadia 🎨.*

— Nadia 🎨
