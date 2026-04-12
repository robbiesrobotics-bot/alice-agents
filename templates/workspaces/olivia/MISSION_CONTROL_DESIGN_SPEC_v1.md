# Mission Control Pro — Complete Design Spec v1.0
**Author:** Nadia (A.L.I.C.E. Design & UX Specialist)  
**Status:** LOCKED — Felix implements from this. No design decisions during implementation.  
**Date:** 2026-03-18

---

## TABLE OF CONTENTS

1. [Emotional Target & Brand Philosophy](#1-emotional-target--brand-philosophy)
2. [Design Token System](#2-design-token-system)
3. [Brand Expression Guidelines](#3-brand-expression-guidelines)
4. [Global Component Standards](#4-global-component-standards)
5. [Mobile-First Breakpoints](#5-mobile-first-breakpoints)
6. [Loading State Standard](#6-loading-state-standard)
7. [Error State Standard](#7-error-state-standard)
8. [Motion & Animation Principles](#8-motion--animation-principles)
9. [First Login Experience](#9-first-login-experience)
10. [Page Specs](#10-page-specs)
    - [Login](#101-login)
    - [Home (Dashboard)](#102-home-dashboard)
    - [My Team](#103-my-team)
    - [Sessions](#104-sessions)
    - [Approvals](#105-approvals)
    - [Workflows](#106-workflows)
    - [Settings](#107-settings)
11. [Copy & Language Standards](#11-copy--language-standards)

---

## 1. EMOTIONAL TARGET & BRAND PHILOSOPHY

### The Emotional Target

A user in Mission Control should feel:
- **In control** — I can see everything, I can act on anything
- **Informed** — I know what's happening right now, without digging
- **Capable** — My team is running; I'm the one making it go
- **Present** — This place feels alive, not archival

A user should NOT feel:
- Overwhelmed by data density
- Confused about what to do next
- Like they're managing tickets in a queue
- Like they're looking at logs from a dead process

### The Core Brand Story

A.L.I.C.E. is a team of AI specialists, not a tool. Mission Control is where you manage that team. The design must reinforce this mental model at every touchpoint:

- **Language:** "Your team" not "your agents." "In a session" not "running." "Waiting on you" not "pending."
- **Presence:** Active agents should pulse. Running sessions should show live tickers. The UI communicates that your team is already working — you're checking in on them.
- **Structure:** The layout should feel like a command center, not an admin panel. Information hierarchy matters: status first, then detail.

### Palette Semantics (NON-NEGOTIABLE)

| Color | Meaning | Do | Don't |
|-------|---------|-----|-------|
| Emerald-500 (`#00bb7f`) | Alive, working, healthy, success | Active status dots, success confirmations, primary CTAs | Decorative accents, borders for style |
| Zinc-950/900 | Infrastructure, structure, the container | Backgrounds, surfaces | Text |
| Zinc-400/500 | Secondary information, metadata | Supporting copy, timestamps | Primary actions |
| Red-500 | Error, failure, danger | Error states only | Warning states |
| Amber-400 | Warning, attention needed | Warnings, degraded states | Errors |
| Blue-400 | Pending, in-progress, informational | Loading, pending approvals | Success |

**The rule:** If you're using emerald, it must mean something is alive or succeeded. If nothing is alive or succeeded, don't use emerald.

---

## 2. DESIGN TOKEN SYSTEM

### Canonical Token Values

```css
/* Backgrounds */
--bg-base:     #09090b;   /* zinc-950 — page background */
--surface-0:   #09090b;   /* zinc-950 — same as base */
--surface-1:   #18181b;   /* zinc-900 — cards, panels */
--surface-2:   #27272a;   /* zinc-800 — inputs, code blocks, nested surfaces */
--surface-3:   #3f3f46;   /* zinc-700 — hover states on surface-2 */

/* Text */
--text-primary:   #fafafa;  /* zinc-50  — headings, important body */
--text-secondary: #a1a1aa;  /* zinc-400 — supporting text, labels */
--text-tertiary:  #71717a;  /* zinc-500 — placeholders, disabled, metadata */

/* Borders */
--border-subtle:  rgba(39,39,42,0.5);  /* zinc-800/50 */
--border-default: #3f3f46;             /* zinc-700 */
--border-strong:  #52525b;             /* zinc-600 */

/* Accent */
--accent:         #00bb7f;  /* emerald-500 — primary actions, active state */
--accent-hover:   #00a36e;  /* emerald-600 — hover on accent elements */
--accent-subtle:  rgba(0,187,127,0.1);  /* emerald for backgrounds/glows */
--accent-text:    #00bb7f;  /* emerald text on dark surfaces */

/* Status */
--status-active:  #00bb7f;  /* emerald-500 */
--status-error:   #ef4444;  /* red-500 */
--status-warn:    #fbbf24;  /* amber-400 */
--status-pending: #60a5fa;  /* blue-400 */
--status-idle:    #52525b;  /* zinc-600 */

/* Agent identity colors (intentional purple spectrum) */
--agent-0: #8b5cf6;  /* violet-500 */
--agent-1: #a855f7;  /* purple-500 */
--agent-2: #c084fc;  /* purple-400 */
--agent-3: #d946ef;  /* fuchsia-500 */
--agent-4: #e879f9;  /* fuchsia-400 */
--agent-5: #7c3aed;  /* violet-600 */
--agent-6: #9333ea;  /* purple-600 */
--agent-7: #a21caf;  /* fuchsia-700 */
```

### Token Usage Rules

1. Never use raw hex values in components — always use tokens
2. `--accent` is reserved for interactive/status meaning only
3. Surface nesting: bg-base → surface-1 → surface-2 (max 3 levels deep)
4. Agent colors are assigned by index at render time, stable per session

---

## 3. BRAND EXPRESSION GUIDELINES

### The "A" Logo Mark

**Logo anatomy:**
- Square emerald box (`--accent`, 4px border-radius)
- White "A" letterform, bold, centered
- The box IS the brand mark — it appears everywhere the brand needs to be present

**Usage rules:**

| Context | Variant | Size | Spec |
|---------|---------|------|------|
| Sidebar (expanded) | Icon + wordmark "A.L.I.C.E." | Icon: 28×28px, text: 16px semibold | 8px gap between icon and text |
| Sidebar (collapsed) | Icon only | 28×28px | Centered in sidebar |
| Login page | Icon + wordmark stacked | Icon: 48×48px, text: 24px semibold | 12px gap, centered |
| Browser tab (favicon) | Icon only | 16×16px | |
| Email/notification | Icon only (if supported) | 32×32px | |

**Spacing rule:** The logo always has at least its own width in clear space on each side.

**Never:**
- Stretch or recolor the emerald box
- Use the wordmark without the icon mark
- Place on a surface lighter than `--surface-1`
- Use a different font for "A.L.I.C.E." — it is always the app's heading font, semibold

### Wordmark Typography

"A.L.I.C.E." uses the app's heading font (Inter or system font stack), weight 600, tracking normal. Never all-lowercase. The periods are part of the name.

"Mission Control" appears as a subtitle below on login only — size 14px, `--text-secondary`, weight 400.

---

## 4. GLOBAL COMPONENT STANDARDS

### The Decision: Hybrid with Clear Boundaries

**AH (A.L.I.C.E. House) components win for:**
- StatusDot / StatusBadge — all agent/session status indicators
- AgentAvatar — all agent identity displays
- SessionCard — all session list items
- ApprovalCard — all approval items
- SidebarNav — the global sidebar
- PageHeader — top of every page
- StatCard — dashboard metric cards

**Shadcn wins for:**
- Dialog / Sheet / Modal — all overlay/drawer patterns
- DropdownMenu — all dropdown menus
- Tooltip — all tooltips
- Switch / Checkbox / RadioGroup — all form controls
- Select / Combobox — all select inputs
- Input / Textarea — all text inputs
- Tabs — tab navigation within pages
- Badge — generic status labels (but NOT agent/session status — use AH StatusBadge)
- Table — data tables (but NOT sessions table — use AH SessionCard)
- Skeleton — loading states
- Toast / Sonner — notifications

**The rule:** If an AH component exists for the concept, use it. Shadcn fills the gaps for generic form/overlay patterns. Never mix them on a single page without this justification.

### No Mixing Rule

A page may use both AH and shadcn components only when:
1. They serve different levels (AH for domain concepts, shadcn for generic UI primitives)
2. The AH component is not available for that specific pattern

Settings was the offender — it now uses shadcn throughout (forms, inputs, tabs) with AH components only for agent-specific displays.

---

## 5. MOBILE-FIRST BREAKPOINTS

### Breakpoint Scale

```
sm:  640px   — phone landscape / large phone
md:  768px   — tablet portrait  
lg:  1024px  — tablet landscape / small desktop
xl:  1280px  — desktop
2xl: 1536px  — wide desktop
```

### Sidebar Behavior by Breakpoint

| Breakpoint | Sidebar | Content |
|---|---|---|
| < 640px (mobile) | Hidden, accessible via hamburger → Sheet overlay | Full width |
| 640px–1023px (sm/md) | Collapsed icon rail (48px wide) | Remaining width |
| 1024px–1279px (lg) | Expanded (220px) | Remaining width |
| 1280px+ (xl) | Expanded (240px) | Remaining width |

### Layout Grid by Breakpoint

| Breakpoint | Columns | Gutter | Page padding |
|---|---|---|---|
| < 640px | 1 | 16px | 16px |
| sm (640px+) | 1–2 | 16px | 24px |
| md (768px+) | 2 | 24px | 32px |
| lg (1024px+) | 2–3 | 24px | 32px |
| xl (1280px+) | 3–4 | 32px | 40px |

### What Changes at Each Breakpoint

**< 640px (mobile):**
- Sidebar hidden → hamburger menu in top bar
- All tables become card stacks (no horizontal scroll)
- Stat cards stack 1-per-row
- Approvals: full-width stacked cards, approve/reject as full-width buttons
- Sessions: full-width cards with truncated content
- No inline split-panels; everything is single-column

**640px–767px (sm):**
- Sidebar icon rail visible
- Stat cards: 2-per-row
- Sessions: 2-column card grid
- Approvals: still stacked but with horizontal action buttons

**768px–1023px (md):**
- Stat cards: 2–3-per-row
- Sessions: list view or 2-column grid
- Approvals: full layout minus detail panel

**1024px+ (lg+):**
- Full desktop layout
- Approvals: master-detail panel layout
- Sessions: full table or card list with metadata columns visible

---

## 6. LOADING STATE STANDARD

### When to Use Skeleton vs Spinner

| Pattern | Use When |
|---------|---------|
| **Skeleton** | Loading page-level content for the first time (data hasn't arrived yet, expected < 3s) |
| **Skeleton** | Refreshing a list where we know the shape of content |
| **Inline spinner** (16px) | A single action is in-flight (submitting a form, triggering an agent) |
| **Button spinner** | A button has been clicked and is waiting for confirmation |
| **Full-page spinner** | NEVER — always prefer skeleton |
| **Overlay spinner** | Blocking modal action only (e.g., deleting an agent — can't navigate away) |

### Skeleton Spec

```
Background: --surface-2 (#27272a)
Shimmer: animate-pulse (opacity 0.4 → 1.0, duration 1.5s, ease-in-out)
Border-radius: matches the component it's replacing
Min-height: matches the approximate height of real content
```

**Skeleton variants to implement:**

- `SkeletonStatCard` — 120px tall, full width of stat card
- `SkeletonSessionCard` — 72px tall, full width of session card row
- `SkeletonAgentCard` — matches AgentCard dimensions
- `SkeletonApprovalCard` — matches ApprovalCard height
- `SkeletonTableRow` — 3 lines: title, subtitle, badge
- `SkeletonText` — generic line skeleton (widths: full, 75%, 50%)

### Skeleton Counts

| Page | Skeleton count on first load |
|------|-----|
| Home | 4× SkeletonStatCard, 3× SkeletonSessionCard |
| My Team | 6× SkeletonAgentCard |
| Sessions | 5× SkeletonSessionCard |
| Approvals | 3× SkeletonApprovalCard |
| Workflows | 4× SkeletonTableRow |
| Settings | Section-level skeleton (don't skeleton individual fields) |

### Transition from Skeleton → Content

- Fade in: `opacity 0 → 1`, duration `200ms`, no layout shift
- Stagger: 50ms delay between list items (max 5 items staggered, then simultaneous)

---

## 7. ERROR STATE STANDARD

### Error Hierarchy

**Level 1 — Inline field error:** Form validation failures
- Red text below field, 12px, `--status-error`
- Icon: `AlertCircle` (12px, inline before text)
- Never use toast for field errors

**Level 2 — Section error:** A card/section failed to load
- Replace skeleton with an error card:
  - Surface-1 background, red-500/20 border
  - `AlertTriangle` icon (20px, `--status-error`)
  - Message: "Couldn't load [section name]"
  - CTA: "Try again" button (ghost, small)

**Level 3 — Page-level error:** Full page failed (e.g., 500, auth failure)
- Centered in content area
- `AlertTriangle` icon (48px, `--status-error`)
- Heading: "Something went wrong"
- Body: Specific error message if available, otherwise: "We couldn't load this page. This is likely temporary."
- CTA: Primary button "Reload page" + ghost button "Go home"

**Level 4 — Toast notification:** Action failed (e.g., user triggered something that failed)
- Sonner toast, variant: `error`
- Duration: 5 seconds
- Message: "[Action] failed — [brief reason if available]"
- Example: "Couldn't approve task — please try again"

### API Error Mapping

| HTTP Status | UX Treatment |
|-------------|-------------|
| 401 | Redirect to login, no error shown |
| 403 | Level 3 error: "You don't have access to this" |
| 404 | Level 3 error: "[Resource] not found" |
| 429 | Level 2 or 4 with "Too many requests — slow down" |
| 500–503 | Level 3 with retry CTA |
| Network offline | Persistent banner at top of page: "No connection — working offline" |

---

## 8. MOTION & ANIMATION PRINCIPLES

### The Rule

**Animate to communicate, never to decorate.**

Every animation must answer the question: "what does this motion tell the user?" If there's no answer, remove it.

### Animation Inventory

| Element | Animation | Spec | Reason |
|---------|-----------|------|--------|
| Active status dot | Pulse ring (scale 1→1.5, opacity 1→0) | 2s loop, ease-in-out | "This agent is alive right now" |
| Session duration ticker | Numeric increment | Real-time, no easing | Counter communicates live work |
| Sidebar expand/collapse | Width transition | 150ms, ease-out | Spatial navigation |
| Detail panel slide-in (Approvals) | Slide from right | 200ms, ease-out | Panel appears from its trigger |
| Sheet/dialog open | Slide up (mobile) / fade+scale (desktop) | 200ms, ease-out | Standard shadcn behavior |
| Page transitions | Fade | 150ms, ease | Not jarring |
| Skeleton → content | Fade in | 200ms | Smooth reveal |
| Toast appearance | Slide up from bottom | shadcn/sonner default | Don't override |
| Button loading state | Spinner replaces text/icon | Immediate, no transition | Action feedback |
| Hover on cards | Background shift to surface-2 | 100ms | Affordance |
| Hover on nav items | Background shift | 100ms | Affordance |

### What Does NOT Animate

- Text content (no typewriter effects)
- Color changes on status (instant — delayed color change is confusing)
- Table sort/filter (instant)
- Form inputs (instant focus ring)
- Any "decorative" parallax or scroll effects
- Stat card numbers (no counting animation — can feel like deception)

### Reduced Motion

All animations must respect `prefers-reduced-motion`. When reduced motion is enabled:
- Remove pulsing status rings (show static dot)
- Remove slide/fade transitions (instant show/hide)
- Keep spinner (it's functional)
- Keep duration ticker (it's informational)

---

## 9. FIRST LOGIN EXPERIENCE

### The Problem

A brand new Pro user has: 0 agents configured, 0 sessions, 0 approvals, 0 workflows. If we show empty states everywhere, it feels like a broken app. We need the first login to feel like a command center that's ready to activate — not a ghost town.

### First Login Detection

Detect "new user" state when: `agents.count === 0 && sessions.total === 0`

This triggers the **Activation Mode** UX (described per-page below).

### Global First Login Treatment

**Welcome Banner** (appears once, dismissible, Home page only):

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Welcome to Mission Control                               │
│  Your A.L.I.C.E. team is ready to be assembled. Start by   │
│  adding your first specialist — they'll handle tasks,        │
│  answer questions, and work while you sleep.                 │
│                                                              │
│  [Add your first agent →]              [Dismiss]             │
└─────────────────────────────────────────────────────────────┘
```

- Background: `--surface-1` with a subtle emerald-500/10 left border (4px)
- Dismiss stores to localStorage, never shows again
- CTA routes to My Team → Add Agent

### First Login Per Page

Each page spec below includes "First Login State" — what a zero-data user sees.

---

## 10. PAGE SPECS

---

### 10.1 LOGIN

#### Layout Spec

```
All breakpoints: Single centered column
Max-width: 400px
Horizontal padding: 24px
Vertical: Centered in viewport (flexbox, min-height 100vh)
```

**Structure:**
```
[A logo mark + "A.L.I.C.E." wordmark]  ← centered, 48px icon
[Mission Control]                        ← 14px, text-secondary, 8px below wordmark
[32px gap]
[Email input]
[Password input]  
[16px gap]
[Sign In — full width, primary button]
[24px gap]
[Forgot password — text link, centered, 14px]
```

#### Component Inventory (SHADCN throughout)

- `Input` — email, password fields
- `Button` — sign in (primary, full width)
- Custom: Logo mark (AH component or inline SVG)
- No card/surface wrapper — form floats directly on bg-base

#### Empty / Zero State

N/A — login has no empty state.

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Form submit | Button shows inline spinner (left of text), text stays visible, disabled state |
| Failed login | Level 1 inline error below password field: "Incorrect email or password" |
| Network error | Level 4 toast: "Sign in failed — check your connection" |
| Success | Fade transition to Home (150ms) |
| Enter key | Submits form if both fields populated |
| Password field | Show/hide toggle (eye icon, right side of input) |

#### Done Criteria

- [ ] Logo matches sidebar exactly (same icon component)
- [ ] Form is centered vertically on all screen sizes
- [ ] Error states appear inline (not toast) for credential failures
- [ ] Loading state on button during submission
- [ ] Accessible: tab order Email → Password → Submit

---

### 10.2 HOME (DASHBOARD)

#### Layout Spec

**Desktop (lg+):**
```
PageHeader: "Mission Control" [greeting: "Good morning, Rob"]
[Welcome Banner if first login]
[Stat Cards row: 4 cards, equal width, gap-4]
[16px gap]
[2-column layout, 2/3 + 1/3]
  Left: Active Sessions (list)
  Right: Team Overview (mini-list of agents by status)
[16px gap]
[Recent Activity (full width, last 10 events)]
```

**Tablet (md):**
```
Stat cards: 2×2 grid
Main layout: Single column (Sessions, then Team, then Activity)
```

**Mobile (< 640px):**
```
Stat cards: 2×2 grid (compact)
All sections: stacked single column
```

#### Stat Card Spec

4 cards:
1. **Active Now** — count of currently running sessions (emerald if >0, zinc if 0)
2. **Pending Approvals** — count awaiting action (amber if >0, zinc if 0)
3. **Team Size** — count of configured agents
4. **Sessions Today** — total sessions started today

StatCard anatomy:
```
[Icon (24px)]  [Label (12px, text-tertiary, uppercase, tracking-wide)]
[Value (32px, semibold, text-primary)]
[Trend/subtitle (12px, text-secondary)]  ← optional
```

Surface-1 card, 16px padding, subtle border-default.

#### Empty State Spec

**First Login State (Activation Mode):**

Replace stat cards with a single "Activation Panel":
```
┌──────────────────────────────────────────────────────┐
│  Command Center — Standby                            │
│                                                      │
│  Your team hasn't been assembled yet.                │
│  Add your first A.L.I.C.E. specialist to start.     │
│                                                      │
│  Step 1 ○ Add a specialist      [Go to My Team →]   │
│  Step 2 ○ Start your first session                   │
│  Step 3 ○ Configure a workflow                       │
└──────────────────────────────────────────────────────┘
```
Background: surface-1, left border accent-subtle (2px emerald).

**Active Sessions — empty (has agents, no running sessions):**
```
Icon: `Zap` (24px, text-tertiary)
Text: "No active sessions"
Sub: "Your team is standing by."
CTA: none (this is fine — not every state needs a CTA)
```

**Team Overview — empty:**
```
Text: "No team members"
CTA: [Add first specialist →] → routes to My Team
```

**Recent Activity — empty:**
```
Icon: `Clock` (24px, text-tertiary)  
Text: "No recent activity"
Sub: "Actions and events will appear here."
```

#### Component Inventory

- AH: `StatCard`, `SessionCard` (mini variant), `AgentAvatar`, `StatusDot`
- Shadcn: `Skeleton`, `Badge` (for activity labels)
- Custom: `WelcomeBanner`, `ActivationPanel` (first login only)

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Stat card — Active Now click | Routes to Sessions, filtered to active |
| Stat card — Pending Approvals click | Routes to Approvals |
| Session card click | Opens session detail (sheet or navigate) |
| Agent in Team Overview click | Routes to My Team, scrolls to agent |
| Refresh | Pull-to-refresh on mobile; automatic 30s polling on desktop |

#### Done Criteria

- [ ] Stat cards show live data, emerald when nonzero for Active/Approvals
- [ ] Active sessions show live duration tickers
- [ ] Responsive: 4-col stat cards on desktop, 2×2 on mobile
- [ ] First login: Activation Panel replaces stat cards
- [ ] Welcome Banner appears once for new users, dismissible
- [ ] Empty states use exact copy/icon spec above

---

### 10.3 MY TEAM

#### Layout Spec

**Desktop (lg+):**
```
PageHeader: "My Team" [subtitle: "N specialists"] [CTA: "Add Specialist" button]
[Agent cards: CSS grid, 3 columns, gap-4]
```

**Tablet (md):**
```
Agent cards: 2 columns
```

**Mobile (< 640px):**
```
Agent cards: 1 column (full width stacked)
CTA button: Full width below page header
```

#### Agent Card Spec

```
┌────────────────────────────────────────┐
│ [Avatar: initials + agent color ring]  │
│ [Name — 16px semibold]                 │
│ [Role/specialty — 14px text-secondary] │
│ [StatusDot + status label]             │
│ ─────────────────────────────────────  │
│ [Sessions today: N]  [Last active: Xm] │
│                         [Configure →]  │
└────────────────────────────────────────┘
```

- Card: surface-1, 20px padding, border-default, 8px border-radius
- Avatar: 48×48px circle, initials (2-letter), colored background from `--agent-N` tokens
- Status dot: 8px, pulsing ring if active
- Hover: card lifts (border-strong, shadow-lg transition 100ms)

#### Empty State Spec

**First Login State:**
```
[Centered in content area]
Icon: `Users` (48px, text-tertiary)
Heading: "Assemble your team"
Body: "Add your first A.L.I.C.E. specialist. Each one handles a domain — coding, research, writing, analysis. Your team works while you work (and while you sleep)."
CTA: [Add your first specialist] — primary button
```

This is NOT a generic "no data" message. It tells the user what the product does and makes adding an agent feel like a meaningful action.

**Search/filter returns no results:**
```
Icon: `SearchX` (32px, text-tertiary)
Text: "No specialists match '[query]'"
CTA: [Clear filter] — ghost button
```

#### Component Inventory

- AH: `AgentCard`, `AgentAvatar`, `StatusDot`, `StatusBadge`, `PageHeader`
- Shadcn: `Dialog` (add/edit agent), `Input` (search), `Select` (filter by status), `Skeleton`, `Button`

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Agent card click | Opens agent detail Sheet (right panel) |
| "Configure" button | Same as card click — opens agent Sheet |
| Agent status dot click | No action — it's informational only |
| "Add Specialist" | Opens Dialog — multi-step: Name → Role → Config |
| Add agent — step transitions | Slide left/right within dialog, no full dialog remount |
| Delete agent | Confirmation dialog: "Remove [Name] from your team?" — destructive button |
| Agent active | Pulsing emerald ring on avatar, status dot pulses |

**Agent Add/Edit Dialog:**
- Step 1: Name + emoji/avatar choice
- Step 2: Role/specialty select (from preset list + custom)
- Step 3: Model + config (API key, temperature, etc.)
- Footer: [Back] [Next / Save]

#### Done Criteria

- [ ] Agent cards show correct status with pulsing dots for active agents
- [ ] Agent color assignments are consistent (same agent always same color)
- [ ] Empty state uses exact copy above — no generic "no agents found"
- [ ] Add/edit dialog works as multi-step flow, not separate pages
- [ ] Mobile: cards are full-width, scannable without horizontal scroll

---

### 10.4 SESSIONS

#### Layout Spec

**Desktop (lg+):**
```
PageHeader: "Sessions" [Filter bar] [New Session button]
[Filter row: Status tabs (All / Active / Completed / Failed) + Search input + Date range]
[Sessions list: full-width cards, stacked]
```

**Tablet (md):**
```
Same as desktop, filter row wraps to 2 rows
```

**Mobile (< 640px):**
```
PageHeader: "Sessions" [New Session button — icon only on mobile]
Filter: Status tabs scroll horizontally (no wrap)
Search: Below tabs, full width
Sessions: Stacked cards, full width
NO table view — always cards on mobile
```

**The sessions table on desktop is abolished.** Sessions are always cards. The table view caused mobile overflow issues and was harder to scan than cards.

#### Session Card Spec (standard)

```
┌────────────────────────────────────────────────────────┐
│ [StatusDot] [Session name/title — 14px semibold]   [▶] │
│ [Agent name + avatar (16px)]   [Duration: 00:04:23]    │
│ [Last message preview — 13px text-secondary, 1 line]   │
│ [Tags/labels]                         [Started: 2h ago] │
└────────────────────────────────────────────────────────┘
```

**Active session variant:**
- Left border: 3px emerald (`--accent`)
- Duration ticker: live, counts up in real-time
- StatusDot: pulsing emerald

**Failed session variant:**
- Left border: 3px red-500
- StatusDot: static red
- Duration replaced with: "Failed · 4 min ago"

**Pending session variant:**
- Left border: 3px blue-400
- StatusDot: static blue
- Shows "Waiting for approval" instead of duration

#### Empty State Spec

**First Login (no sessions ever):**
```
Icon: `MessageSquare` (48px, text-tertiary) — the chat/conversation metaphor
Heading: "No sessions yet"
Body: "Sessions are conversations between you and your team. Start one to see your specialists in action."
CTA: [Start a session] → Opens New Session dialog
```

**Filtered to Active — no active sessions:**
```
Icon: `Coffee` (32px, text-tertiary)  ← intentional: your team is at rest
Text: "Your team is standing by"
Sub: "No active sessions right now."
CTA: [Start a session] — ghost button
```

**Filtered to Failed — no failures:**
```
Icon: `CheckCircle` (32px, --status-active)
Text: "No failures"
Sub: "All good."
[No CTA]
```

**Search returns nothing:**
```
Icon: `SearchX` (32px, text-tertiary)
Text: "No sessions match '[query]'"
CTA: [Clear search]
```

#### Component Inventory

- AH: `SessionCard`, `StatusDot`, `StatusBadge`, `AgentAvatar`, `PageHeader`
- Shadcn: `Tabs` (status filter), `Input` (search), `Dialog` (new session), `Sheet` (session detail), `Skeleton`, `Button`, `Badge` (labels)

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Session card click | Opens session detail Sheet (slides in from right) |
| Session detail Sheet | Shows full message history + metadata + actions |
| Active session — live ticker | Updates every second, no flicker |
| "New Session" button | Opens dialog: Select agent → Enter prompt → Start |
| Status tab switch | Instant filter, no loading state if data cached |
| Search | Debounce 300ms, searches name + agent + content preview |
| Session — Stop button | Confirmation: "Stop this session?" — not destructive dialog, inline |
| Session — Retry (failed) | Immediate action, shows button spinner, refreshes card |
| Pull to refresh (mobile) | Refreshes list |

#### Done Criteria

- [ ] NO horizontal scroll on mobile — ever
- [ ] Active sessions show live duration tickers
- [ ] Status tabs filter instantly
- [ ] Session cards have correct left-border color by status
- [ ] Empty states use exact copy above
- [ ] Session detail Sheet works on all breakpoints
- [ ] First login empty state communicates what sessions ARE

---

### 10.5 APPROVALS

#### Layout Spec

**Desktop (lg+):**
```
PageHeader: "Approvals" [Badge: N pending]
[Master-detail layout: 360px left panel + flexible right panel]
Left: Scrollable list of approval cards
Right: Selected approval detail (empty state if nothing selected)
```

**Tablet (md):**
```
Full-width list only — no detail panel
Tapping an approval opens a Sheet (bottom sheet or right sheet)
```

**Mobile (< 640px): [CRITICAL — this was broken, now fixed]**
```
Full-width stacked cards
NO side-by-side layout
Tap to open detail Sheet (slides up from bottom)
Approve / Reject buttons: full-width, stacked at bottom of Sheet
```

#### Approval Card Spec

```
┌────────────────────────────────────────────────────────┐
│ [AgentAvatar 32px] [Agent name — 13px semibold]        │
│ [Request title — 14px, text-primary, 2-line clamp]     │
│ [Type badge: tool_call / file_write / etc.]             │
│ [Waiting: 4m 32s ago] [→ Approve] [✕ Reject]          │
└────────────────────────────────────────────────────────┘
```

**Selected state (desktop):** Highlighted with border-strong, background surface-2.

#### Approval Detail Panel Spec (desktop right panel)

```
[Agent + request type header]
[Full request context — code block or prose, scrollable]
[Impact summary: what happens if approved / rejected]
[Approve button — full width, primary (emerald)]
[Reject button — full width, destructive (outline)]
[Add note — optional textarea, shows on demand]
```

**Nothing selected state (desktop right panel):**
```
[Centered vertically]
Icon: `MousePointerClick` (32px, text-tertiary)
Text: "Select an approval to review"
```

#### Empty State Spec

**No pending approvals:**
```
Icon: `CheckCircle2` (48px, --status-active)  ← emerald — this is a good thing
Heading: "All caught up"
Body: "No approvals waiting. Your team is running without blockers."
[No CTA]
```

Note: This is the one empty state where we use emerald — because zero pending approvals IS a success state.

**First Login (will look like the above since no agents = no approvals):**
Same "All caught up" state — no special case needed here.

#### Component Inventory

- AH: `ApprovalCard`, `AgentAvatar`, `StatusBadge`, `PageHeader`
- Shadcn: `Sheet` (mobile/tablet detail), `Textarea` (note input), `Button`, `Skeleton`, `Badge` (type labels), `ScrollArea` (for detail content)

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Card click (desktop) | Loads detail in right panel (150ms fade) |
| Card click (mobile/tablet) | Opens bottom Sheet |
| Approve (card inline) | Immediate optimistic update, card fades out (200ms), success toast |
| Reject (card inline) | Immediate optimistic update, card fades out (200ms) |
| Approve (detail panel) | Same optimistic update |
| Add note | Textarea expands inline, "Submit with note" replaces "Approve" |
| Empty right panel | Shows "Select an approval" message — see spec above |
| Waiting timer | Live counter per card — updates every second |

**Optimistic updates:** When a user approves/rejects, the card immediately leaves the list. If the action fails, the card comes back with an error toast: "Couldn't [approve/reject] — please try again"

#### Done Criteria

- [ ] Mobile: full-width stacked cards, NO overflow, Sheet for detail
- [ ] Desktop: master-detail layout, right panel shows selection
- [ ] Waiting timers are live
- [ ] Optimistic updates on approve/reject
- [ ] Empty state uses emerald (it IS a success state)
- [ ] "All caught up" copy — not "No approvals found"

---

### 10.6 WORKFLOWS

#### Layout Spec

**Desktop (lg+):**
```
PageHeader: "Workflows" [CTA: "New Workflow" button]
[Status filter tabs: All / Active / Draft / Archived]
[Workflow table/list: full width]
```

**Mobile (< 640px):**
```
PageHeader: "Workflows" [New Workflow — icon button]
Filter: Horizontal scrolling tabs
Workflows: Stacked cards (not table rows)
```

#### Workflow Card/Row Spec

**Desktop (table-like rows):**
```
[StatusDot] [Workflow name — 14px semibold] [Description — text-secondary, truncated]
[Agent(s) — avatar stack] [Trigger: cron/event label] [Last run: Xh ago] [Run count]
[Actions: Run now / Edit / Archive — overflow menu]
```

**Mobile (cards):**
```
[Workflow name + StatusDot]
[Description — 2 lines]
[Next run: Xh from now OR Last run: Xh ago]
[Actions: kebab menu]
```

#### Empty State Spec

**First Login / No Workflows:**
```
Icon: `GitBranch` (48px, text-tertiary)
Heading: "No workflows yet"
Body: "Workflows are automated sequences your team runs on a schedule or trigger. Set one up to let your team work independently."
CTA: [Create your first workflow] — primary button
```

**Filter: Active — no active workflows:**
```
Icon: `Zap` (32px, text-tertiary)
Text: "No active workflows"
Sub: "Activate a workflow or create a new one."
CTA: [New Workflow] — ghost button
```

**Filter: Archived:**
```
Icon: `Archive` (32px, text-tertiary)
Text: "Nothing archived"
```

#### Component Inventory

- AH: `StatusDot`, `AgentAvatar`, `PageHeader`, `StatusBadge`
- Shadcn: `Table` (desktop rows), `Tabs` (filter), `DropdownMenu` (row actions), `Dialog` (workflow builder), `Sheet` (workflow detail/edit), `Skeleton`, `Button`

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Row click | Opens workflow detail Sheet |
| "Run now" | Triggers run, button shows spinner, success toast when started |
| "Edit" | Opens workflow edit Dialog/Sheet |
| "Archive" | Confirmation inline: "Archive this workflow?" with undo toast |
| Status toggle | Switch on row — optimistic, instant |
| New workflow | Opens multi-step Dialog (trigger → agent → actions → review) |
| Sort columns | Instant client-side sort if data loaded |

#### Done Criteria

- [ ] Mobile: workflows render as cards (no table overflow)
- [ ] Run now action gives immediate feedback
- [ ] Empty states use exact copy — specifically the "let your team work independently" framing
- [ ] Workflow builder dialog is multi-step

---

### 10.7 SETTINGS

#### Layout Spec

**All breakpoints:**
```
PageHeader: "Settings"
[Vertical tab navigation on left (desktop) / Horizontal tabs (mobile)]
[Content panel on right (desktop) / Full width below tabs (mobile)]
```

**Desktop:** Left nav 200px, content fills remainder  
**Mobile:** Tabs scroll horizontally at top, content below full-width

**Settings Tabs:**
1. General
2. Account
3. Team (agent defaults)
4. Integrations
5. Knowledge (previously standalone page — now settings sub-section)
6. Notifications
7. Billing

#### Component Inventory (SHADCN THROUGHOUT — no AH mixing)

- All `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup` — Shadcn
- All `Tabs` — Shadcn
- `Button` — Shadcn
- Section headers — custom styled (not AH PageHeader)
- Knowledge base items — custom (not Knowledge page component)
- Agent display in Team tab — AH `AgentAvatar` only (not full AgentCard)

**The previous Settings problem was mixing AH page-level components in a sub-section context.** Settings uses shadcn primitives throughout. The only AH component allowed is `AgentAvatar` as a display element.

#### Empty State Spec

**Integrations — no connected integrations:**
```
Icon: `Plug` (32px, text-tertiary)
Text: "No integrations connected"
Sub: "Connect your tools to extend what your team can do."
[Integration cards shown regardless — connection is the CTA]
```

**Knowledge — no documents:**
```
Icon: `BookOpen` (32px, text-tertiary)
Text: "No knowledge sources"
Sub: "Add documents or URLs to give your team context."
CTA: [Add knowledge source] — primary button
```

**Notifications — no notification rules:**
```
Text: "Using default notification settings."
[Settings form shown — not a blocking empty state]
```

#### Interaction Spec

| Interaction | Behavior |
|---|---|
| Setting change | Auto-save with debounce 800ms, subtle "Saved" indicator (text fades in/out near the field) |
| Explicit save forms | "Save changes" button, shows spinner on click |
| Destructive actions | Confirmation dialog (e.g., delete account, clear knowledge base) |
| Tab switch | Instant (no loading) |
| Knowledge upload | Drop zone + file picker, progress bar during upload |
| Integration connect | Opens OAuth flow or token input Sheet |

**Auto-save indicator:**
- Appears as "Saved ✓" in text-secondary/text-tertiary near the relevant section
- Fades in at 200ms, waits 2s, fades out at 200ms
- Does NOT use toast for individual setting saves

#### Done Criteria

- [ ] All form components are shadcn — no AH components except AgentAvatar
- [ ] No mixed component systems on any settings tab
- [ ] Auto-save works for toggle/select fields
- [ ] Knowledge tab works equivalently to the previous standalone page
- [ ] Mobile: horizontal scroll tabs, full-width content
- [ ] Tabs are keyboard navigable

---

## 11. COPY & LANGUAGE STANDARDS

### The Mental Model in Copy

| Context | Use | Never use |
|---------|-----|-----------|
| Agent collection | "Your team" | "Your agents", "Your bots" |
| Individual agent | "[Name], your [Role] specialist" | "Agent ID: xyz" |
| Active session | "[Name] is in a session" | "Process running" |
| Pending approval | "[Name] is waiting for you" | "Approval #4892 pending" |
| Session history | "N sessions this week" | "N tasks completed" |
| Idle agent | "[Name] is standing by" | "Agent idle" |

### Empty State Copy Principles

1. **Describe potential, not absence.** "No sessions yet" → "Sessions are conversations with your team. Start one."
2. **First-person team language.** "Your team is standing by" not "No data found"
3. **Emerald empty states are success states.** "All caught up" when approvals are empty.
4. **Only use CTA in empty state if there's a clear next action.** Not every empty state needs a button.

### Timestamps

- < 1 minute: "Just now"
- 1–59 minutes: "Xm ago"
- 1–23 hours: "Xh ago"
- Yesterday: "Yesterday at HH:MM"
- Older: "Mar 14" or "Mar 14, 2025" if different year

### Status Labels

| Status | Display label |
|--------|--------------|
| active | "Active" |
| running | "In session" |
| idle | "Standing by" |
| pending | "Waiting" |
| failed | "Failed" |
| offline | "Offline" |
| disabled | "Disabled" |

---

## APPENDIX: DONE CRITERIA SUMMARY

A page is "done" when:

1. ✅ All breakpoints render without overflow or layout break
2. ✅ All empty states show exact spec copy and icon (not placeholder text)
3. ✅ Component system matches spec (no mixing violations)
4. ✅ Loading states use correct skeleton variant
5. ✅ Error states follow the 4-level hierarchy
6. ✅ Active/live elements animate per the motion spec
7. ✅ Reduced motion respected
8. ✅ Token usage matches the canonical token system (no raw hex)
9. ✅ First login experience shows Activation Mode content where specified
10. ✅ Tab/keyboard navigation works on all interactive elements

---

*Spec locked. Implementation questions → Nadia. No design decisions in PRs.*
